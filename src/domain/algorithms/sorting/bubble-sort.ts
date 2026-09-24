import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, explain, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['outer-loop', 'for end from n - 1 down to 1'],
  ['inner-loop', 'for j from 0 to end - 1', 1],
  ['compare', 'if A[j] > A[j + 1]', 2],
  ['swap', 'swap A[j] and A[j + 1]', 3],
  ['finish-pass', 'mark the last position sorted'],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  for (let end = values.length - 1; end > 0; end -= 1) {
    yield* setVariable('end', end)
    yield* emit({ type: 'range', role: 'active', indices: [0, end] }, 'outer-loop')
    let swapped = false

    for (let j = 0; j < end; j += 1) {
      yield* setVariable('j', j)
      yield* emit({ type: 'compare', indices: [j, j + 1], values: [values[j], values[j + 1]] }, 'compare')
      if (values[j] > values[j + 1]) {
        yield* explain(`${values[j]} is greater than ${values[j + 1]}, so the adjacent values swap.`)
        ;[values[j], values[j + 1]] = [values[j + 1], values[j]]
        yield* emit({ type: 'swap', indices: [j, j + 1] }, 'swap')
        swapped = true
      } else {
        yield* explain(`${values[j]} is already in order before ${values[j + 1]}; no swap is needed.`)
      }
    }

    yield* emit({ type: 'markSorted', indices: [end] }, 'finish-pass')
    if (!swapped) break
  }
  if (values.length > 0) {
    yield { type: 'markSorted', indices: Array.from({ length: values.length }, (_, index) => index) }
  }
}

export const bubbleSort = defineSortingAlgorithm({
  id: 'bubble-sort',
  shortDescription: 'Simple comparison',
  displayOrder: 3,
  name: 'Bubble Sort',
  description: 'Repeatedly compares adjacent values and moves larger values toward the end.',
  useCases: ['Teaching adjacent comparisons and swaps', 'Small or nearly sorted arrays'],
  complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  stable: true,
  inPlace: true,
  pseudocode,
  execute,
})
