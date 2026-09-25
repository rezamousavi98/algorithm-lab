import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const MAX_BUCKETS = 16
const pseudocode = makePseudocode([
  ['range', 'find the normalized value range'],
  ['distribute', 'distribute values into bounded buckets'],
  ['sort', 'stably insertion-sort each bucket'],
  ['collect', 'write buckets back in order'],
])

type Entry = Readonly<{ value: number; sourceIndex: number }>

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  if (!input.length) return
  const values = [...input]
  const scale = Math.max(1, ...values.map(Math.abs))
  const normalized = values.map(value => value / scale)
  const minimum = Math.min(...normalized)
  const maximum = Math.max(...normalized)
  const count = Math.min(MAX_BUCKETS, values.length)
  const buckets: Entry[][] = Array.from({ length: count }, () => [])
  yield* setVariable('bucketCount', count)
  yield* emit({ type: 'range', role: 'active', indices: [0, values.length - 1] }, 'range')

  for (let index = 0; index < values.length; index += 1) {
    const fraction = maximum === minimum ? 0 : (normalized[index] - minimum) / (maximum - minimum)
    const bucket = Math.min(count - 1, Math.floor(fraction * count))
    buckets[bucket].push({ value: values[index], sourceIndex: index })
    yield* setVariable('bucket', bucket)
    yield* emit({ type: 'auxiliaryUpdate', panelId: `bucket-${bucket}`, label: `Bucket ${bucket + 1}`, values: buckets[bucket].map(item => item.value) }, 'distribute')
  }

  for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) {
    const bucket = buckets[bucketIndex]
    yield* setVariable('bucket', bucketIndex)
    for (let index = 1; index < bucket.length; index += 1) {
      const item = bucket[index]
      let position = index
      while (position > 0) {
        yield* emit({ type: 'compare', indices: [bucket[position - 1].sourceIndex, item.sourceIndex], values: [bucket[position - 1].value, item.value] }, 'sort')
        if (bucket[position - 1].value <= item.value) break
        bucket[position] = bucket[position - 1]
        position -= 1
      }
      bucket[position] = item
      yield* emit({ type: 'auxiliaryUpdate', panelId: `bucket-${bucketIndex}`, label: `Sorted bucket ${bucketIndex + 1}`, values: bucket.map(entry => entry.value) }, 'sort')
    }
  }

  let output = 0
  for (const bucket of buckets) for (const item of bucket) {
    values[output] = item.value
    yield* emit({ type: 'write', index: output, value: item.value }, 'collect')
    output += 1
  }
  yield { type: 'markSorted', indices: values.map((_, index) => index) }
}

export const bucketSort = defineSortingAlgorithm({
  id: 'bucket-sort', shortDescription: 'Distribute into sorted buckets', displayOrder: 17,
  name: 'Bucket Sort', description: 'Distributes finite numbers into bounded buckets, stably sorts each bucket, and collects them.',
  useCases: ['Values with a reasonably even distribution', 'Demonstrating distribution and local sorting'],
  complexity: { best: 'O(n + b)', average: 'O(n + b) expected', worst: 'O(n²)', space: 'O(n + b)' },
  stable: true, inPlace: false, pseudocode, execute,
})
