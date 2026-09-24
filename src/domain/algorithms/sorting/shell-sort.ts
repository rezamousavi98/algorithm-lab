import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['gap-start', 'gap = floor(n / 2)'],
  ['gap-loop', 'while gap > 0'],
  ['outer-loop', 'for i from gap to n - 1', 1],
  ['save-value', 'value = A[i]', 2],
  ['compare', 'while j ≥ gap and A[j - gap] > value', 2],
  ['shift', 'A[j] = A[j - gap]', 3],
  ['insert', 'A[j] = value', 2],
  ['reduce-gap', 'gap = floor(gap / 2)', 1],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  let gap = Math.floor(values.length / 2)
  while (gap > 0) {
    yield* setVariable('gap', gap)
    yield* emit({ type: 'range', role: 'active', indices: [0, values.length - 1] }, 'gap-loop')
    for (let index = gap; index < values.length; index += 1) {
      const value = values[index]
      let position = index
      yield* setVariable('i', index)
      yield* setVariable('value', value)
      yield* emit({ type: 'select', role: 'current', index }, 'save-value')

      while (position >= gap) {
        const previous = position - gap
        yield* setVariable('j', position)
        yield* emit({
          type: 'compare',
          indices: [previous, index],
          values: [values[previous], value],
        }, 'compare')
        if (values[previous] <= value) break
        values[position] = values[previous]
        yield* emit({ type: 'write', index: position, value: values[previous] }, 'shift')
        position = previous
      }
      values[position] = value
      yield* emit({ type: 'write', index: position, value }, 'insert')
    }
    const nextGap = Math.floor(gap / 2)
    yield { type: 'pseudocode', lineId: 'reduce-gap' }
    gap = nextGap
  }
  if (values.length > 0) yield { type: 'markSorted', indices: Array.from({ length: values.length }, (_, index) => index) } as const
}

export const shellSort = defineSortingAlgorithm({
  id: 'shell-sort',
  name: 'Shell Sort',
  description: 'Moves values across shrinking gaps before finishing with insertion sort.',
  useCases: ['Medium-sized arrays', 'In-place sorting with a compact implementation'],
  complexity: { best: 'O(n log n)', average: 'O(n^1.5)', worst: 'O(n²)', space: 'O(1)' },
  stable: false,
  inPlace: true,
  pseudocode,
  execute,
})
