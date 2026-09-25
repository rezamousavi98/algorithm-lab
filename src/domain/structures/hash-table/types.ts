export const HASH_TABLE_CAPACITIES = [11, 23, 47, 97] as const
export const MAX_HASH_TABLE_ENTRIES = 32

export type HashCollisionStrategy = 'separate-chaining' | 'linear-probing' | 'double-hashing'

export type HashEntry = Readonly<{
  id: string
  key: number
  value: number
}>

export type HashEntryInput = Readonly<{
  key: number
  value: number
}>

export type ChainingBucket = Readonly<{
  entries: readonly HashEntry[]
}>

export type HashSlot =
  | Readonly<{ state: 'empty' }>
  | Readonly<{ state: 'deleted' }>
  | Readonly<{ state: 'occupied'; entry: HashEntry }>

type HashTableBase = Readonly<{
  capacity: typeof HASH_TABLE_CAPACITIES[number]
  size: number
  /** Unique entries in first insertion order, retained for deterministic rebuilds. */
  entries: readonly HashEntry[]
}>

export type SeparateChainingHashTable = HashTableBase & Readonly<{
  strategy: 'separate-chaining'
  buckets: readonly ChainingBucket[]
}>

export type OpenAddressedHashTable = HashTableBase & Readonly<{
  strategy: 'linear-probing' | 'double-hashing'
  slots: readonly HashSlot[]
}>

export type HashTable = SeparateChainingHashTable | OpenAddressedHashTable

export type HashTableBuildResult =
  | Readonly<{ ok: true; table: HashTable }>
  | Readonly<{ ok: false; error: string }>
