import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['base-case', 'if low ≥ high, return'],
  ['choose-pivot', 'pivot = A[high]'],
  ['partition-start', 'store = low'],
  ['partition-loop', 'for current from low to high - 1', 1],
  ['partition-compare', 'if A[current] ≤ pivot', 2],
  ['partition-swap', 'swap A[store] and A[current]', 3],
  ['partition-advance', 'store = store + 1', 3],
  ['place-pivot', 'swap A[store] and A[high]'],
  ['recurse', 'sort the ranges on each side of the pivot'],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]

  function* partition(low: number, high: number): Generator<AlgorithmEvent, number, undefined> {
    const pivot = values[high]
    let store = low
    yield* setVariable('low', low)
    yield* setVariable('high', high)
    yield* setVariable('pivot', pivot)
    yield* emit({ type: 'range', role: 'partition', indices: [low, high] }, 'partition-start')
    yield* emit({ type: 'select', role: 'pivot', index: high }, 'choose-pivot')

    for (let current = low; current < high; current += 1) {
      yield* setVariable('current', current)
      yield* emit({ type: 'compare', indices: [current, high], values: [values[current], pivot] }, 'partition-compare')
      if (values[current] <= pivot) {
        if (store !== current) {
          ;[values[store], values[current]] = [values[current], values[store]]
          yield* emit({ type: 'swap', indices: [store, current] }, 'partition-swap')
        }
        store += 1
        yield* setVariable('store', store)
      }
    }

    ;[values[store], values[high]] = [values[high], values[store]]
    yield* emit({ type: 'swap', indices: [store, high] }, 'place-pivot')
    yield* emit({ type: 'select', role: 'pivot', index: store }, 'place-pivot')
    return store
  }

  function* sort(low: number, high: number): Generator<AlgorithmEvent, void, undefined> {
    if (low >= high) return
    const pivotIndex = yield* partition(low, high)
    yield { type: 'pseudocode', lineId: 'recurse' }
    yield* sort(low, pivotIndex - 1)
    yield* sort(pivotIndex + 1, high)
  }

  yield* sort(0, values.length - 1)
  if (values.length > 0) {
    yield { type: 'markSorted', indices: Array.from({ length: values.length }, (_, index) => index) }
  }
}

export const quickSort = defineSortingAlgorithm({
  id: 'quick-sort',
  name: 'Quick Sort',
  description: 'Partitions values around a pivot and recursively sorts the two resulting ranges.',
  useCases: ['General-purpose in-memory sorting', 'Large arrays when average-case speed matters'],
  complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
  stable: false,
  inPlace: true,
  pseudocode,
  execute,
})
