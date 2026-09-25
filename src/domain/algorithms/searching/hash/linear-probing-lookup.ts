import { defineHashSearchAlgorithm, makeHashSearchPseudocode } from './shared'
import type { HashSearchAlgorithmEvent, HashSearchInput } from './types'
import { normalizedHashIndex, probeIndex } from '../../../structures/hash-table'

const pseudocode = makeHashSearchPseudocode([
  ['hash', 'home = normalizedHash(key, capacity)'],
  ['probe', 'for probeNumber = 0 .. capacity - 1'],
  ['slot', 'index = (home + probeNumber) mod capacity'],
  ['empty', 'if slot is empty, return not found'],
  ['deleted', 'if slot is deleted, continue probing'],
  ['compare', 'compare slot.key with key'],
  ['advance', 'move to the next slot, wrapping at capacity'],
  ['found', 'return slot.value'],
  ['missing', 'return not found'],
])

function* execute(input: HashSearchInput): Generator<HashSearchAlgorithmEvent, void, undefined> {
  const { table, key } = input
  if (table.strategy !== 'linear-probing') throw new Error('Linear Probing lookup received an incompatible table.')
  const homeIndex = normalizedHashIndex(key, table.capacity)
  yield { type: 'pseudocode', lineId: 'hash' }
  yield { type: 'variable', name: 'capacity', value: table.capacity }
  yield { type: 'variable', name: 'homeIndex', value: homeIndex }
  yield { type: 'hashCode', homeIndex, step: 1 }

  for (let probeNumber = 0; probeNumber < table.capacity; probeNumber += 1) {
    const index = probeIndex('linear-probing', key, probeNumber, table.capacity)
    yield { type: 'pseudocode', lineId: 'probe' }
    yield { type: 'variable', name: 'probeNumber', value: probeNumber }
    yield { type: 'pseudocode', lineId: 'slot' }
    yield { type: 'hashProbe', location: { kind: 'slot', index }, probeNumber }
    const slot = table.slots[index]

    if (slot.state === 'empty') {
      yield { type: 'pseudocode', lineId: 'empty' }
      yield { type: 'explanation', message: `Slot ${index} is empty, so key ${key} is not in the table.` }
      yield { type: 'pseudocode', lineId: 'missing' }
      yield { type: 'hashResult', result: 'not-found' }
      return
    }

    if (slot.state === 'deleted') {
      yield { type: 'pseudocode', lineId: 'deleted' }
      yield { type: 'explanation', message: `Slot ${index} is a deleted marker. Continue probing so keys later in the cluster remain reachable.` }
    } else {
      yield { type: 'pseudocode', lineId: 'compare' }
      yield { type: 'hashCompare', entryId: slot.entry.id, key: slot.entry.key, target: key }
      if (slot.entry.key === key) {
        yield { type: 'pseudocode', lineId: 'found' }
        yield { type: 'explanation', message: `Key ${key} is stored in slot ${index}, after ${probeNumber} probe advances.` }
        yield { type: 'hashResult', result: 'found', entryId: slot.entry.id }
        return
      }
    }

    if (probeNumber + 1 < table.capacity) {
      yield { type: 'pseudocode', lineId: 'advance' }
      yield { type: 'hashAdvance', nextProbeNumber: probeNumber + 1 }
    }
  }

  yield { type: 'pseudocode', lineId: 'missing' }
  yield { type: 'explanation', message: `All ${table.capacity} slots were visited; key ${key} is not in the table.` }
  yield { type: 'hashResult', result: 'not-found' }
}

export const linearProbingLookup = defineHashSearchAlgorithm({
  id: 'hash-linear-probing-lookup',
  name: 'Linear Probing',
  strategy: 'linear-probing',
  description: 'Starts at the key’s home slot and checks consecutive slots until it finds the key or reaches an empty slot. The probe sequence wraps to the beginning of the table.',
  shortDescription: 'Scan consecutive slots after collisions',
  displayOrder: 21,
  useCases: ['Lookup in compact open-addressed tables', 'Study clustering, wraparound and deleted-slot markers'],
  complexity: {
    best: 'O(1)',
    average: 'O(1) with suitable hashing and a bounded load factor',
    worst: 'O(n) when a long cluster forms',
    space: 'O(m + n) for slots and entries',
  },
  pseudocode,
  execute,
})
