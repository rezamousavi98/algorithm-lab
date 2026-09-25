import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['key', 'save the next value'],
  ['search', 'binary-search the sorted prefix for its upper bound'],
  ['shift', 'shift larger values right'],
  ['insert', 'write the saved value at the insertion point'],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  for (let index = 1; index < values.length; index += 1) {
    const key = values[index]
    let low = 0
    let high = index
    yield* setVariable('key', key)
    yield* emit({ type: 'read', index, value: key }, 'key')
    while (low < high) {
      const middle = low + Math.floor((high - low) / 2)
      yield* setVariable('low', low)
      yield* setVariable('high', high)
      yield* emit({ type: 'compare', indices: [middle, index], values: [values[middle], key] }, 'search')
      if (values[middle] <= key) low = middle + 1
      else high = middle
    }
    for (let cursor = index; cursor > low; cursor -= 1) {
      values[cursor] = values[cursor - 1]
      yield* emit({ type: 'write', index: cursor, value: values[cursor] }, 'shift')
    }
    values[low] = key
    yield* emit({ type: 'write', index: low, value: key }, 'insert')
    yield* emit({ type: 'markSorted', indices: values.map((_, i) => i).slice(0, index + 1) }, 'insert')
  }
  if (values.length === 1) yield { type: 'markSorted', indices: [0] }
}

export const binaryInsertionSort = defineSortingAlgorithm({
  id: 'binary-insertion-sort', shortDescription: 'Binary-search insertion positions', displayOrder: 15,
  name: 'Binary Insertion Sort', description: 'Uses binary search to find each insertion position, then shifts the sorted prefix.',
  useCases: ['Small arrays', 'Reducing comparisons while preserving stable insertion order'],
  complexity: { best: 'O(n log n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  stable: true, inPlace: true, pseudocode, execute,
})
