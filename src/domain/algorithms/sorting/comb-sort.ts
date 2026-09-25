import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['gap', 'gap = floor(gap / 1.3), but never below 1'],
  ['pass', 'compare values gap positions apart'],
  ['swap', 'swap values when they are out of order'],
  ['repeat', 'repeat until gap is 1 and a pass makes no swaps'],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  if (!values.length) return
  let gap = values.length
  let swapped = true
  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / 1.3))
    swapped = false
    yield* setVariable('gap', gap)
    yield* emit({ type: 'range', role: 'active', indices: [0, Math.max(0, values.length - 1)] }, 'pass')
    for (let index = 0; index + gap < values.length; index += 1) {
      yield* setVariable('index', index)
      yield* emit({ type: 'compare', indices: [index, index + gap], values: [values[index], values[index + gap]] }, 'pass')
      if (values[index] > values[index + gap]) {
        ;[values[index], values[index + gap]] = [values[index + gap], values[index]]
        yield* emit({ type: 'swap', indices: [index, index + gap] }, 'swap')
        swapped = true
      }
    }
    yield { type: 'pseudocode', lineId: 'repeat' }
  }
  if (values.length) yield { type: 'markSorted', indices: values.map((_, index) => index) }
}

export const combSort = defineSortingAlgorithm({
  id: 'comb-sort', shortDescription: 'Shrinking comparison gaps', displayOrder: 10,
  name: 'Comb Sort',
  description: 'Compares values at decreasing gaps to move small values quickly toward the beginning.',
  useCases: ['Teaching gap-based comparisons', 'An in-place alternative to bubble sort'],
  complexity: { best: 'O(n log n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  stable: false, inPlace: true, pseudocode, execute,
})
