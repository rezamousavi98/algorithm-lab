import type { SortingInput } from '../types'
import { defineSortingAlgorithm, emit, explain, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['outer-loop', 'for i from 0 to n - 1'],
  ['select-minimum', 'minimum = i', 1],
  ['inner-loop', 'for j from i + 1 to n - 1', 1],
  ['compare', 'if A[j] < A[minimum]', 2],
  ['update-minimum', 'minimum = j', 3],
  ['swap', 'swap A[i] and A[minimum]', 1],
])

function* execute(input: SortingInput) {
  const values = [...input]
  for (let i = 0; i < values.length; i += 1) {
    let minimum = i
    yield* setVariable('i', i)
    yield* setVariable('minimum', minimum)
    yield* emit({ type: 'select', role: 'minimum', index: minimum }, 'select-minimum')

    for (let j = i + 1; j < values.length; j += 1) {
      yield* setVariable('j', j)
      yield* emit({ type: 'compare', indices: [j, minimum], values: [values[j], values[minimum]] }, 'compare')
      if (values[j] < values[minimum]) {
        yield* explain(`${values[j]} is smaller than the current minimum ${values[minimum]}.`)
        minimum = j
        yield* setVariable('minimum', minimum)
        yield* emit({ type: 'select', role: 'minimum', index: minimum }, 'update-minimum')
      }
    }

    if (minimum !== i) {
      ;[values[i], values[minimum]] = [values[minimum], values[i]]
      yield* emit({ type: 'swap', indices: [i, minimum] }, 'swap')
    }
    yield* emit({ type: 'markSorted', indices: [i] }, 'outer-loop')
  }
}

export const selectionSort = defineSortingAlgorithm({
  id: 'selection-sort',
  name: 'Selection Sort',
  description: 'Finds the smallest remaining value and places it at the next sorted position.',
  useCases: ['Small arrays', 'Situations where minimizing writes is useful'],
  complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  stable: false,
  inPlace: true,
  pseudocode,
  execute,
})
