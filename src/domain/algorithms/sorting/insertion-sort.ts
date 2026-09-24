import type { SortingInput } from '../types'
import { defineSortingAlgorithm, emit, explain, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['outer-loop', 'for i from 1 to n - 1'],
  ['save-key', 'key = A[i]', 1],
  ['scan-left', 'j = i - 1', 1],
  ['compare', 'while j ≥ 0 and A[j] > key', 1],
  ['shift', 'A[j + 1] = A[j]', 2],
  ['move-left', 'j = j - 1', 2],
  ['insert-key', 'A[j + 1] = key', 1],
])

function* execute(input: SortingInput) {
  const values = [...input]
  for (let i = 1; i < values.length; i += 1) {
    const key = values[i]
    let j = i - 1
    yield* setVariable('i', i)
    yield* setVariable('key', key)
    yield* emit({ type: 'select', role: 'current', index: i }, 'save-key')
    yield* emit({ type: 'read', index: i, value: key }, 'save-key')

    while (j >= 0) {
      yield* setVariable('j', j)
      yield* emit({ type: 'compare', indices: [j, i], values: [values[j], key] }, 'compare')
      if (values[j] <= key) {
        yield* explain(`${values[j]} belongs before the saved value ${key}; the sorted prefix stays in place.`)
        break
      }

      yield* explain(`${values[j]} is greater than ${key}, so it shifts one position to the right.`)
      values[j + 1] = values[j]
      yield* emit({ type: 'write', index: j + 1, value: values[j] }, 'shift')
      j -= 1
      yield* setVariable('j', j)
    }

    values[j + 1] = key
    yield* emit({ type: 'write', index: j + 1, value: key }, 'insert-key')
    yield* emit({ type: 'markSorted', indices: Array.from({ length: i + 1 }, (_, index) => index) }, 'outer-loop')
  }
  if (input.length === 1) yield { type: 'markSorted', indices: [0] } as const
}

export const insertionSort = defineSortingAlgorithm({
  id: 'insertion-sort',
  shortDescription: 'Build sorted array',
  displayOrder: 5,
  name: 'Insertion Sort',
  description: 'Grows a sorted prefix by inserting each next value into its correct position.',
  useCases: ['Small arrays', 'Nearly sorted or continuously updated data'],
  complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  stable: true,
  inPlace: true,
  pseudocode,
  execute,
})
