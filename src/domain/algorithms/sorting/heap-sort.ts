import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['build-heap', 'build a max heap from the array'],
  ['heapify-start', 'sift down from the last parent to the root'],
  ['heapify-compare', 'compare parent with its children', 1],
  ['heapify-swap', 'swap with the largest child and continue', 1],
  ['extract', 'swap the root with the last heap value'],
  ['shrink', 'shrink the heap and sift down the new root'],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  let heapSize = values.length

  function* siftDown(rootIndex: number): Generator<AlgorithmEvent, void, undefined> {
    let root = rootIndex
    for (;;) {
      const left = root * 2 + 1
      const right = left + 1
      let largest = root
      if (left < heapSize) {
        yield* emit({ type: 'compare', indices: [largest, left], values: [values[largest], values[left]] }, 'heapify-compare')
        if (values[left] > values[largest]) largest = left
      }
      if (right < heapSize) {
        yield* emit({ type: 'compare', indices: [largest, right], values: [values[largest], values[right]] }, 'heapify-compare')
        if (values[right] > values[largest]) largest = right
      }
      if (largest === root) return
      ;[values[root], values[largest]] = [values[largest], values[root]]
      yield* emit({ type: 'swap', indices: [root, largest] }, 'heapify-swap')
      root = largest
    }
  }

  if (heapSize > 0) yield* emit({ type: 'range', role: 'heap', indices: [0, heapSize - 1] }, 'build-heap')
  for (let parent = Math.floor(heapSize / 2) - 1; parent >= 0; parent -= 1) {
    yield* setVariable('parent', parent)
    yield* emit({ type: 'range', role: 'heap', indices: [0, heapSize - 1] }, 'heapify-start')
    yield* siftDown(parent)
  }

  while (heapSize > 1) {
    yield* setVariable('heapSize', heapSize)
    ;[values[0], values[heapSize - 1]] = [values[heapSize - 1], values[0]]
    yield* emit({ type: 'swap', indices: [0, heapSize - 1] }, 'extract')
    yield* emit({ type: 'markSorted', indices: [heapSize - 1] }, 'extract')
    heapSize -= 1
    yield* emit({ type: 'range', role: 'heap', indices: [0, heapSize - 1] }, 'shrink')
    yield* siftDown(0)
  }
  if (values.length > 0) yield { type: 'markSorted', indices: [0] }
}

export const heapSort = defineSortingAlgorithm({
  id: 'heap-sort',
  name: 'Heap Sort',
  description: 'Builds a max heap, then repeatedly moves its largest value to the end.',
  useCases: ['In-place sorting with O(n log n) worst-case time', 'Priority-queue and heap learning'],
  complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' },
  stable: false,
  inPlace: true,
  pseudocode,
  execute,
})
