import { defineHashSearchAlgorithm, makeHashSearchPseudocode } from './shared'
import type { HashSearchAlgorithmEvent, HashSearchInput } from './types'
import { doubleHashStep, normalizedHashIndex, probeIndex } from '../../../structures/hash-table'

const pseudocode = makeHashSearchPseudocode([
  ['hash', 'home = normalizedHash(key, capacity)'],
  ['step', 'step = 1 + normalizedHash(key, capacity - 1)'],
  ['probe', 'for probeNumber = 0 .. capacity - 1'],
  ['slot', 'index = (home + probeNumber × step) mod capacity'],
  ['empty', 'if slot is empty, return not found'],
  ['deleted', 'if slot is deleted, continue probing'],
  ['compare', 'compare slot.key with key'],
  ['advance', 'move by step, wrapping at capacity'],
  ['found', 'return slot.value'],
  ['missing', 'return not found'],
])

function* execute(input: HashSearchInput): Generator<HashSearchAlgorithmEvent, void, undefined> {
  const { table, key } = input
  if (table.strategy !== 'double-hashing') throw new Error('Double Hashing lookup received an incompatible table.')
  const homeIndex = normalizedHashIndex(key, table.capacity)
  const stepSize = doubleHashStep(key, table.capacity)
  yield { type: 'pseudocode', lineId: 'hash' }
  yield { type: 'variable', name: 'capacity', value: table.capacity }
  yield { type: 'variable', name: 'homeIndex', value: homeIndex }
  yield { type: 'hashCode', homeIndex, step: stepSize }
  yield { type: 'pseudocode', lineId: 'step' }
  yield { type: 'variable', name: 'stepSize', value: stepSize }
  yield { type: 'explanation', message: `The primary hash selects slot ${homeIndex}; the secondary hash advances by ${stepSize}. Prime capacity ${table.capacity} ensures this step visits every slot.` }

  for (let probeNumber = 0; probeNumber < table.capacity; probeNumber += 1) {
    const index = probeIndex('double-hashing', key, probeNumber, table.capacity)
    yield { type: 'pseudocode', lineId: 'probe' }
    yield { type: 'variable', name: 'probeNumber', value: probeNumber }
    yield { type: 'pseudocode', lineId: 'slot' }
    yield { type: 'variable', name: 'currentIndex', value: index }
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
      yield { type: 'explanation', message: `Slot ${index} is a deleted marker. Continue by ${stepSize} so later keys remain reachable.` }
    } else {
      yield { type: 'pseudocode', lineId: 'compare' }
      yield { type: 'hashCompare', entryId: slot.entry.id, key: slot.entry.key, target: key }
      if (slot.entry.key === key) {
        yield { type: 'pseudocode', lineId: 'found' }
        yield { type: 'explanation', message: `Key ${key} is stored in slot ${index}, after ${probeNumber} advances of ${stepSize}.` }
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
  yield { type: 'explanation', message: `All ${table.capacity} slots in this double-hash sequence were visited; key ${key} is not in the table.` }
  yield { type: 'hashResult', result: 'not-found' }
}

export const doubleHashingLookup = defineHashSearchAlgorithm({
  id: 'hash-double-hashing-lookup',
  name: 'Double Hashing',
  strategy: 'double-hashing',
  description: 'Uses a primary hash for the home slot and a secondary hash for the probe step. Prime capacity and a nonzero step produce a sequence that visits every slot before repeating.',
  shortDescription: 'Use a second hash to choose probe steps',
  displayOrder: 22,
  useCases: ['Reduce primary clustering in open-addressed tables', 'Compare independent probe sequences'],
  complexity: {
    best: 'O(1)',
    average: 'O(1) with suitable hashing and a bounded load factor',
    worst: 'O(n) when many probes are needed',
    space: 'O(m + n) for slots and entries',
  },
  pseudocode,
  execute,
})
