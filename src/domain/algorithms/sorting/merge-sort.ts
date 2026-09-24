import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['base-case', 'if start ≥ end, return'],
  ['split', 'middle = floor((start + end) / 2)'],
  ['left', 'mergeSort(start, middle)'],
  ['right', 'mergeSort(middle + 1, end)'],
  ['merge-start', 'merge the two sorted ranges'],
  ['merge-compare', 'compare the next left and right values', 1],
  ['merge-write', 'append the smaller value to the merge buffer', 1],
  ['copy-rest', 'append any remaining values to the merge buffer', 1],
  ['write-back', 'write the merged values back to the array', 1],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]

  function* sort(start: number, end: number): Generator<AlgorithmEvent, void, undefined> {
    yield { type: 'pseudocode', lineId: 'base-case' }
    if (start >= end) return
    const middle = Math.floor((start + end) / 2)
    yield* setVariable('start', start)
    yield* setVariable('middle', middle)
    yield* setVariable('end', end)
    yield* emit({ type: 'range', role: 'active', indices: [start, end] }, 'split')
    yield { type: 'pseudocode', lineId: 'left' }
    yield* sort(start, middle)
    yield { type: 'pseudocode', lineId: 'right' }
    yield* sort(middle + 1, end)

    const left = values.slice(start, middle + 1)
    const right = values.slice(middle + 1, end + 1)
    let leftIndex = 0
    let rightIndex = 0
    const merged: number[] = []
    yield* emit({ type: 'range', role: 'merge', indices: [start, end] }, 'merge-start')

    while (leftIndex < left.length && rightIndex < right.length) {
      const leftPosition = start + leftIndex
      const rightPosition = middle + 1 + rightIndex
      yield* emit(
        {
          type: 'compare',
          indices: [leftPosition, rightPosition],
          values: [left[leftIndex], right[rightIndex]],
        },
        'merge-compare',
      )
      if (left[leftIndex] <= right[rightIndex]) {
        merged.push(left[leftIndex])
        yield* emit(
          { type: 'auxiliaryUpdate', panelId: 'merge-buffer', label: 'Merge buffer', values: merged },
          'merge-write',
        )
        leftIndex += 1
      } else {
        merged.push(right[rightIndex])
        yield* emit(
          { type: 'auxiliaryUpdate', panelId: 'merge-buffer', label: 'Merge buffer', values: merged },
          'merge-write',
        )
        rightIndex += 1
      }
    }

    while (leftIndex < left.length) {
      merged.push(left[leftIndex])
      yield* emit(
        { type: 'auxiliaryUpdate', panelId: 'merge-buffer', label: 'Merge buffer', values: merged },
        'copy-rest',
      )
      leftIndex += 1
    }
    while (rightIndex < right.length) {
      merged.push(right[rightIndex])
      yield* emit(
        { type: 'auxiliaryUpdate', panelId: 'merge-buffer', label: 'Merge buffer', values: merged },
        'copy-rest',
      )
      rightIndex += 1
    }
    for (let offset = 0; offset < merged.length; offset += 1) {
      values[start + offset] = merged[offset]
      yield* emit({ type: 'write', index: start + offset, value: merged[offset] }, 'write-back')
    }
  }

  yield* sort(0, values.length - 1)
  if (values.length > 0) {
    yield { type: 'markSorted', indices: Array.from({ length: values.length }, (_, index) => index) }
  }
}

export const mergeSort = defineSortingAlgorithm({
  id: 'merge-sort',
  shortDescription: 'Divide and conquer',
  displayOrder: 1,
  name: 'Merge Sort',
  description: 'Divides the array into halves, sorts each half, then merges them in order.',
  useCases: ['Stable sorting', 'Large inputs that need predictable O(n log n) time'],
  complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  stable: true,
  inPlace: false,
  pseudocode,
  execute,
})
