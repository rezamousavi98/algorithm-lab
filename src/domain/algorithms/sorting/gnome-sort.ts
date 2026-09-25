import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['start', 'index = 1'],
  ['compare', 'if index is zero or A[index - 1] ≤ A[index], move forward'],
  ['swap', 'otherwise swap neighbors and move backward'],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  let index = 1
  while (index < values.length) {
    yield* setVariable('index', index)
    if (index === 0) { index += 1; continue }
    yield* emit({ type: 'compare', indices: [index - 1, index], values: [values[index - 1], values[index]] }, 'compare')
    if (values[index - 1] <= values[index]) index += 1
    else {
      ;[values[index - 1], values[index]] = [values[index], values[index - 1]]
      yield* emit({ type: 'swap', indices: [index - 1, index] }, 'swap')
      index -= 1
    }
  }
  if (values.length) yield { type: 'markSorted', indices: values.map((_, i) => i) }
}

export const gnomeSort = defineSortingAlgorithm({
  id: 'gnome-sort', shortDescription: 'Walk forward and backward', displayOrder: 11,
  name: 'Gnome Sort', description: 'Walks through the array, swapping adjacent values and stepping back when they are out of order.',
  useCases: ['Teaching local swaps', 'Small or nearly ordered arrays'],
  complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  stable: true, inPlace: true, pseudocode, execute,
})
