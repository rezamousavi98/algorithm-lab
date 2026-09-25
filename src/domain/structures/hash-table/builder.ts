import { doubleHashStep, normalizedHashIndex, probeIndex } from './hash'
import { HASH_TABLE_CAPACITIES, MAX_HASH_TABLE_ENTRIES, type ChainingBucket, type HashCollisionStrategy, type HashEntry, type HashEntryInput, type HashSlot, type HashTable, type HashTableBuildResult } from './types'

function failure(error: string): HashTableBuildResult {
  return Object.freeze({ ok: false, error })
}

function chooseCapacity(size: number): typeof HASH_TABLE_CAPACITIES[number] | null {
  return HASH_TABLE_CAPACITIES.find(capacity => size * 2 <= capacity) ?? null
}

function validateInputs(inputs: readonly HashEntryInput[]): string | null {
  if (!Array.isArray(inputs)) return 'Hash entries must be provided as a list.'
  if (inputs.length > MAX_HASH_TABLE_ENTRIES) return `A hash table can contain at most ${MAX_HASH_TABLE_ENTRIES} input entries.`
  for (const [index, entry] of inputs.entries()) {
    if (typeof entry !== 'object' || entry === null) return `Entry ${index + 1} must contain a key and value.`
    if (!Number.isSafeInteger(entry.key)) return `Key ${index + 1} must be a safe integer.`
    if (!Number.isSafeInteger(entry.value)) return `Value ${index + 1} must be a safe integer.`
  }
  return null
}

function prepareEntries(inputs: readonly HashEntryInput[]): readonly HashEntry[] {
  const entries: HashEntry[] = []
  for (const input of inputs) {
    const key = Object.is(input.key, -0) ? 0 : input.key
    const existingIndex = entries.findIndex(entry => entry.key === key)
    if (existingIndex >= 0) {
      const existing = entries[existingIndex]
      entries[existingIndex] = Object.freeze({ ...existing, value: input.value })
    } else {
      entries.push(Object.freeze({ id: `entry-${entries.length}`, key, value: input.value }))
    }
  }
  return Object.freeze(entries)
}

function createChainingTable(entries: readonly HashEntry[], capacity: typeof HASH_TABLE_CAPACITIES[number]): HashTable {
  const buckets: HashEntry[][] = Array.from({ length: capacity }, () => [])
  for (const entry of entries) buckets[normalizedHashIndex(entry.key, capacity)].push(entry)
  const immutableBuckets: readonly ChainingBucket[] = Object.freeze(buckets.map(bucket => Object.freeze({ entries: Object.freeze(bucket) })))
  return Object.freeze({ strategy: 'separate-chaining', capacity, size: entries.length, entries, buckets: immutableBuckets })
}

function createOpenAddressedTable(
  entries: readonly HashEntry[],
  capacity: typeof HASH_TABLE_CAPACITIES[number],
  strategy: 'linear-probing' | 'double-hashing',
): HashTable {
  const slots: HashSlot[] = Array.from({ length: capacity }, () => Object.freeze({ state: 'empty' as const }))
  for (const entry of entries) {
    if (strategy === 'double-hashing') doubleHashStep(entry.key, capacity)
    let inserted = false
    for (let probe = 0; probe < capacity; probe += 1) {
      const index = probeIndex(strategy, entry.key, probe, capacity)
      if (slots[index].state === 'empty') {
        slots[index] = Object.freeze({ state: 'occupied', entry })
        inserted = true
        break
      }
    }
    if (!inserted) throw new Error('The selected hash probe sequence could not place every entry.')
  }
  return Object.freeze({ strategy, capacity, size: entries.length, entries, slots: Object.freeze(slots) })
}

/** Builds an immutable, deterministic table from insertion-ordered key/value entries. */
export function buildHashTable(
  inputs: readonly HashEntryInput[],
  strategy: HashCollisionStrategy = 'separate-chaining',
): HashTableBuildResult {
  const inputError = validateInputs(inputs)
  if (inputError) return failure(inputError)
  if (!['separate-chaining', 'linear-probing', 'double-hashing'].includes(strategy)) return failure('Unknown hash collision strategy.')

  const entries = prepareEntries(inputs)
  const capacity = chooseCapacity(entries.length)
  if (capacity === null) return failure(`No supported table capacity can keep ${entries.length} entries at or below 0.5 load.`)

  try {
    const table = strategy === 'separate-chaining'
      ? createChainingTable(entries, capacity)
      : createOpenAddressedTable(entries, capacity, strategy)
    const invariantError = validateHashTable(table)
    return invariantError ? failure(invariantError) : Object.freeze({ ok: true, table })
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Could not build the hash table.')
  }
}

/** Validates structure and verifies that every prepared entry can be retrieved by its strategy. */
export function validateHashTable(table: HashTable): string | null {
  if (!table || typeof table !== 'object') return 'Hash table must be an object.'
  if (!HASH_TABLE_CAPACITIES.includes(table.capacity)) return 'Hash table capacity is unsupported.'
  if (!['separate-chaining', 'linear-probing', 'double-hashing'].includes(table.strategy)) return 'Hash collision strategy is unsupported.'
  if (!Array.isArray(table.entries)) return 'Hash table entries must be a list.'
  if (!Number.isInteger(table.size) || table.size < 0 || table.size > MAX_HASH_TABLE_ENTRIES) return 'Hash table size is invalid.'
  if (table.entries.length !== table.size) return 'Hash table size does not match its entries.'

  const ids = new Set<string>()
  const keys = new Set<number>()
  const entriesById = new Map<string, HashEntry>()
  for (const entry of table.entries) {
    if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id)) return 'Hash table entry IDs must be present and unique.'
    if (!Number.isSafeInteger(entry.key) || Object.is(entry.key, -0) || !Number.isSafeInteger(entry.value)) return 'Hash table keys and values must be normalized safe integers.'
    if (keys.has(entry.key)) return 'Hash table keys must be unique.'
    ids.add(entry.id)
    keys.add(entry.key)
    entriesById.set(entry.id, entry)
  }
  if (table.size * 2 > table.capacity) return 'Hash table load factor must not exceed 0.5.'

  if (table.strategy === 'separate-chaining') {
    if (!Array.isArray(table.buckets)) return 'Hash table buckets must be a list.'
    if (table.buckets.length !== table.capacity) return 'Bucket count must equal table capacity.'
    const seen = new Set<string>()
    for (const [bucketIndex, bucket] of table.buckets.entries()) {
      if (!bucket || typeof bucket !== 'object' || !Array.isArray(bucket.entries)) return `Bucket ${bucketIndex} must contain an entry list.`
      for (const entry of bucket.entries) {
        const expected = entry && entriesById.get(entry.id)
        if (!expected || seen.has(entry.id) || entry.key !== expected.key || entry.value !== expected.value) return 'A bucket contains an unknown, repeated, or inconsistent entry.'
        if (normalizedHashIndex(entry.key, table.capacity) !== bucketIndex) return 'An entry is stored in the wrong bucket.'
        seen.add(entry.id)
      }
    }
    if (seen.size !== table.size) return 'One or more entries are missing from the buckets.'
    return null
  }

  if (!Array.isArray(table.slots)) return 'Hash table slots must be a list.'
  if (table.slots.length !== table.capacity) return 'Slot count must equal table capacity.'
  const occupied = new Map<string, HashEntry>()
  for (const slot of table.slots) {
    if (!slot || typeof slot !== 'object' || !['empty', 'deleted', 'occupied'].includes(slot.state)) return 'Hash table contains an invalid slot state.'
    if (slot.state === 'occupied') {
      const expected = slot.entry && entriesById.get(slot.entry.id)
      if (!expected || occupied.has(slot.entry.id) || slot.entry.key !== expected.key || slot.entry.value !== expected.value) return 'A slot contains an unknown, repeated, or inconsistent entry.'
      occupied.set(slot.entry.id, slot.entry)
    }
  }
  if (occupied.size !== table.size) return 'One or more entries are missing from the slots.'

  for (const entry of table.entries) {
    let found = false
    for (let probe = 0; probe < table.capacity; probe += 1) {
      const index = probeIndex(table.strategy, entry.key, probe, table.capacity)
      const slot = table.slots[index]
      if (slot.state === 'empty') break
      if (slot.state === 'occupied' && slot.entry.id === entry.id) {
        found = slot.entry.key === entry.key && slot.entry.value === entry.value
        break
      }
    }
    if (!found) return 'An entry cannot be retrieved by the selected probe sequence.'
  }
  return null
}
