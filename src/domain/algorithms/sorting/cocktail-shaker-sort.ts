import type { SortingInput } from '../types'
import { defineSortingAlgorithm, emit, explain, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['bounds', 'start = 0; end = n - 1'],
  ['forward', 'compare neighbors from start to end'],
  ['forward-swap', 'swap out-of-order neighbors'],
  ['shrink-end', 'end = end - 1'],
  ['backward', 'compare neighbors from end to start'],
  ['backward-swap', 'swap out-of-order neighbors'],
  ['shrink-start', 'start = start + 1'],
])

function* execute(input: SortingInput) {
  const values = [...input]
  let start = 0
  let end = values.length - 1

  while (start < end) {
    let swapped = false
    yield* setVariable('start', start)
    yield* setVariable('end', end)
    yield* emit({ type: 'range', role: 'active', indices: [start, end] }, 'bounds')

    for (let index = start; index < end; index += 1) {
      yield* emit({ type: 'compare', indices: [index, index + 1], values: [values[index], values[index + 1]] }, 'forward')
      if (values[index] > values[index + 1]) {
        yield* explain(`${values[index]} moves right because it is larger than its neighbor.`)
        ;[values[index], values[index + 1]] = [values[index + 1], values[index]]
        yield* emit({ type: 'swap', indices: [index, index + 1] }, 'forward-swap')
        swapped = true
      }
    }
    yield* emit({ type: 'markSorted', indices: [end] }, 'shrink-end')
    end -= 1
    if (!swapped) break

    swapped = false
    for (let index = end; index > start; index -= 1) {
      yield* emit({ type: 'compare', indices: [index - 1, index], values: [values[index - 1], values[index]] }, 'backward')
      if (values[index - 1] > values[index]) {
        yield* explain(`${values[index]} moves left because it is smaller than its neighbor.`)
        ;[values[index - 1], values[index]] = [values[index], values[index - 1]]
        yield* emit({ type: 'swap', indices: [index - 1, index] }, 'backward-swap')
        swapped = true
      }
    }
    yield* emit({ type: 'markSorted', indices: [start] }, 'shrink-start')
    start += 1
    if (!swapped) break
  }
  if (values.length > 0) yield { type: 'markSorted', indices: Array.from({ length: values.length }, (_, index) => index) } as const
}

export const cocktailShakerSort = defineSortingAlgorithm({
  id: 'cocktail-shaker-sort',
  shortDescription: 'Bidirectional bubble',
  displayOrder: 9,
  name: 'Cocktail Shaker Sort',
  description: 'Bubble sort in both directions, moving small and large values toward their ends.',
  useCases: ['Teaching bidirectional passes', 'Small arrays with values misplaced near either end'],
  complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  stable: true,
  inPlace: true,
  pseudocode,
  execute,
})
