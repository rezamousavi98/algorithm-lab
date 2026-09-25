import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const INSERTION_THRESHOLD = 12
const pseudocode = makePseudocode([
  ['depth', 'set depth limit to 2 × floor(log₂(n))'],
  ['partition', 'partition the active range around a pivot'],
  ['recurse', 'continue on smaller ranges with reduced depth'],
  ['heap-fallback', 'use heapsort when the depth limit is exhausted'],
  ['insertion-fallback', 'use insertion sort for small ranges'],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  if (values.length < 2) {
    if (values.length) yield { type: 'markSorted', indices: [0] }
    return
  }
  const depthLimit = 2 * Math.floor(Math.log2(values.length))
  yield* setVariable('depthLimit', depthLimit)

  function* insertion(low: number, high: number): Generator<AlgorithmEvent, void, undefined> {
    for (let index = low + 1; index <= high; index += 1) {
      const value = values[index]
      let cursor = index
      while (cursor > low) {
        yield* emit({ type: 'compare', indices: [cursor - 1, index], values: [values[cursor - 1], value] }, 'insertion-fallback')
        if (values[cursor - 1] <= value) break
        values[cursor] = values[cursor - 1]
        yield* emit({ type: 'write', index: cursor, value: values[cursor] }, 'insertion-fallback')
        cursor -= 1
      }
      values[cursor] = value
      yield* emit({ type: 'write', index: cursor, value }, 'insertion-fallback')
    }
  }

  function* heapSortRange(low: number, high: number): Generator<AlgorithmEvent, void, undefined> {
    const size = high - low + 1
    function* sift(rootStart: number, heapSize: number): Generator<AlgorithmEvent, void, undefined> {
      let root = rootStart
      for (;;) {
        let largest = root
        const left = root * 2 + 1
        const right = left + 1
        if (left < heapSize) {
          yield* emit({ type: 'compare', indices: [low + largest, low + left], values: [values[low + largest], values[low + left]] }, 'heap-fallback')
          if (values[low + left] > values[low + largest]) largest = left
        }
        if (right < heapSize) {
          yield* emit({ type: 'compare', indices: [low + largest, low + right], values: [values[low + largest], values[low + right]] }, 'heap-fallback')
          if (values[low + right] > values[low + largest]) largest = right
        }
        if (largest === root) return
        ;[values[low + root], values[low + largest]] = [values[low + largest], values[low + root]]
        yield* emit({ type: 'swap', indices: [low + root, low + largest] }, 'heap-fallback')
        root = largest
      }
    }
    for (let root = Math.floor(size / 2) - 1; root >= 0; root -= 1) yield* sift(root, size)
    for (let end = size - 1; end > 0; end -= 1) {
      ;[values[low], values[low + end]] = [values[low + end], values[low]]
      yield* emit({ type: 'swap', indices: [low, low + end] }, 'heap-fallback')
      yield* sift(0, end)
    }
  }

  function* sort(low: number, high: number, depth: number): Generator<AlgorithmEvent, void, undefined> {
    const length = high - low + 1
    if (length < 2) return
    yield* setVariable('low', low)
    yield* setVariable('high', high)
    yield* setVariable('depth', depth)
    yield* emit({ type: 'range', role: 'active', indices: [low, high] }, 'partition')
    if (length <= INSERTION_THRESHOLD) { yield* insertion(low, high); return }
    if (depth === 0) { yield* setVariable('phase', 'heap fallback'); yield* heapSortRange(low, high); return }

    const middle = low + Math.floor(length / 2)
    const first = values[low]
    const center = values[middle]
    const last = values[high]
    yield* emit({ type: 'compare', indices: [low, middle], values: [first, center] }, 'partition')
    yield* emit({ type: 'compare', indices: [middle, high], values: [center, last] }, 'partition')
    yield* emit({ type: 'compare', indices: [low, high], values: [first, last] }, 'partition')
    const pivot = Math.max(Math.min(first, center), Math.min(Math.max(first, center), last))
    let left = low
    let right = high
    while (left <= right) {
      for (;;) {
        yield* emit({ type: 'compare', indices: [left, middle], values: [values[left], pivot] }, 'partition')
        if (values[left] >= pivot) break
        left += 1
      }
      for (;;) {
        yield* emit({ type: 'compare', indices: [right, middle], values: [values[right], pivot] }, 'partition')
        if (values[right] <= pivot) break
        right -= 1
      }
      if (left <= right) {
        if (left !== right) {
          ;[values[left], values[right]] = [values[right], values[left]]
          yield* emit({ type: 'swap', indices: [left, right] }, 'partition')
        }
        left += 1; right -= 1
      }
    }
    yield* setVariable('pivot', pivot)
    if (right - low < high - left) {
      yield* sort(low, right, depth - 1)
      yield* sort(left, high, depth - 1)
    } else {
      yield* sort(left, high, depth - 1)
      yield* sort(low, right, depth - 1)
    }
  }

  yield* sort(0, values.length - 1, depthLimit)
  yield { type: 'markSorted', indices: values.map((_, i) => i) }
}

export const introSort = defineSortingAlgorithm({
  id: 'intro-sort', shortDescription: 'Quick, heap, and insertion hybrid', displayOrder: 19,
  name: 'Introsort', description: 'Combines quicksort partitioning with heapsort depth fallback and insertion sort for small ranges.',
  useCases: ['General-purpose in-memory sorting', 'Predictable O(n log n) worst-case time'],
  complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(log n)' },
  stable: false, inPlace: true, pseudocode, execute,
})
