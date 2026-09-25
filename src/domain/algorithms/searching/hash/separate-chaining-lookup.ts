import { defineHashSearchAlgorithm, makeHashSearchPseudocode } from './shared'
import type { HashSearchAlgorithmEvent, HashSearchInput } from './types'
import { normalizedHashIndex } from '../../../structures/hash-table'

const pseudocode = makeHashSearchPseudocode([
  ['hash', 'bucketIndex = normalizedHash(key, capacity)'],
  ['bucket', 'entry = buckets[bucketIndex].head'],
  ['compare', 'compare entry.key with key'],
  ['advance', 'entry = entry.next'],
  ['found', 'return entry.value'],
  ['missing', 'return not found'],
])

function* execute(input: HashSearchInput): Generator<HashSearchAlgorithmEvent, void, undefined> {
  const { table, key } = input
  const bucketIndex = normalizedHashIndex(key, table.capacity)
  yield { type: 'pseudocode', lineId: 'hash' }
  yield { type: 'variable', name: 'capacity', value: table.capacity }
  yield { type: 'variable', name: 'bucketIndex', value: bucketIndex }
  yield { type: 'hashCode', homeIndex: bucketIndex, step: null }
  yield { type: 'pseudocode', lineId: 'bucket' }
  yield { type: 'hashProbe', location: { kind: 'bucket', index: bucketIndex }, probeNumber: 0 }

  const bucket = table.strategy === 'separate-chaining' ? table.buckets[bucketIndex] : undefined
  if (!bucket) throw new Error('Separate Chaining lookup received an incompatible table.')
  yield { type: 'variable', name: 'chainLength', value: bucket.entries.length }

  for (let chainIndex = 0; chainIndex < bucket.entries.length; chainIndex += 1) {
    const entry = bucket.entries[chainIndex]
    yield { type: 'pseudocode', lineId: 'compare' }
    yield { type: 'variable', name: 'chainIndex', value: chainIndex }
    yield { type: 'hashCompare', entryId: entry.id, key: entry.key, target: key }
    if (entry.key === key) {
      yield { type: 'pseudocode', lineId: 'found' }
      yield { type: 'explanation', message: `Key ${key} is in bucket ${bucketIndex}, at chain position ${chainIndex}.` }
      yield { type: 'hashResult', result: 'found', entryId: entry.id }
      return
    }
    yield { type: 'pseudocode', lineId: 'advance' }
    yield { type: 'hashChainAdvance', nextChainIndex: chainIndex + 1 }
  }

  yield { type: 'pseudocode', lineId: 'missing' }
  yield { type: 'explanation', message: bucket.entries.length === 0
    ? `Bucket ${bucketIndex} is empty; key ${key} is not in the table.`
    : `The chain in bucket ${bucketIndex} ended without key ${key}.` }
  yield { type: 'hashResult', result: 'not-found' }
}

export const separateChainingLookup = defineHashSearchAlgorithm({
  id: 'hash-chaining-lookup',
  name: 'Separate Chaining',
  strategy: 'separate-chaining',
  description: 'Hashes the key to a bucket, then follows that bucket’s linked chain until it finds the key or reaches the end.',
  shortDescription: 'Follow the matching bucket chain',
  displayOrder: 20,
  useCases: ['Lookup in maps that resolve collisions with per-bucket chains', 'Compare collision behavior with open addressing'],
  complexity: {
    best: 'O(1)',
    average: 'O(1 + α) under uniform hashing',
    worst: 'O(n) when keys cluster in one bucket',
    space: 'O(m + n) for buckets and entries',
  },
  pseudocode,
  execute,
})
