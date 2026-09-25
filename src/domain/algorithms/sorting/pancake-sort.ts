import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['maximum', 'find the maximum in the unsorted prefix'],
  ['flip-top', 'if needed, flip it to the front'],
  ['flip-end', 'flip the prefix to place the maximum at its end'],
])

function* flip(values: number[], end: number): Generator<AlgorithmEvent, void, undefined> {
  yield* emit({ type: 'range', role: 'active', indices: [0, end] }, 'flip-end')
  for (let left = 0, right = end; left < right; left += 1, right -= 1) {
    ;[values[left], values[right]] = [values[right], values[left]]
    yield* emit({ type: 'swap', indices: [left, right] }, 'flip-end')
  }
}

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  for (let end = values.length - 1; end > 0; end -= 1) {
    let maximum = 0
    for (let index = 1; index <= end; index += 1) {
      yield* emit({ type: 'compare', indices: [maximum, index], values: [values[maximum], values[index]] }, 'maximum')
      if (values[index] > values[maximum]) maximum = index
    }
    yield* setVariable('maximumIndex', maximum)
    yield* setVariable('prefixEnd', end)
    if (maximum === end) continue
    if (maximum > 0) yield* flip(values, maximum)
    yield* flip(values, end)
    yield* emit({ type: 'markSorted', indices: [end] }, 'flip-end')
  }
  if (values.length) yield { type: 'markSorted', indices: values.map((_, i) => i) }
}

export const pancakeSort = defineSortingAlgorithm({
  id: 'pancake-sort', shortDescription: 'Sort using prefix reversals', displayOrder: 14,
  name: 'Pancake Sort', description: 'Uses prefix reversals to move the largest remaining value to its final position.',
  useCases: ['Teaching reversals and prefix operations', 'Sorting when prefix flips are the allowed operation'],
  complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  stable: false, inPlace: true, pseudocode, execute,
})
