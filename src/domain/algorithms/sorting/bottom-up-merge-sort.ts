import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['width', 'start with sorted runs of width 1'],
  ['merge', 'merge adjacent runs into a temporary buffer'],
  ['write', 'write the merged run back'],
  ['double', 'double the run width and repeat'],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  const buffer = Array<number>(values.length)
  for (let width = 1; width < values.length; width *= 2) {
    yield* setVariable('runWidth', width)
    for (let start = 0; start < values.length; start += 2 * width) {
      const middle = Math.min(start + width, values.length)
      const end = Math.min(start + 2 * width, values.length)
      if (middle >= end) continue
      yield* emit({ type: 'range', role: 'merge', indices: [start, end - 1] }, 'merge')
      let left = start
      let right = middle
      for (let out = start; out < end; out += 1) {
        if (left < middle && right < end) {
          yield* emit({ type: 'compare', indices: [left, right], values: [values[left], values[right]] }, 'merge')
        }
        if (right >= end || (left < middle && values[left] <= values[right])) buffer[out] = values[left++]
        else buffer[out] = values[right++]
        yield* emit({ type: 'auxiliaryUpdate', panelId: 'merge-buffer', label: 'Merge buffer', values: buffer.slice(start, out + 1) }, 'merge')
      }
      for (let index = start; index < end; index += 1) {
        values[index] = buffer[index]
        yield* emit({ type: 'write', index, value: values[index] }, 'write')
      }
    }
    yield { type: 'pseudocode', lineId: 'double' }
  }
  if (values.length) yield { type: 'markSorted', indices: values.map((_, i) => i) }
}

export const bottomUpMergeSort = defineSortingAlgorithm({
  id: 'bottom-up-merge-sort', shortDescription: 'Merge runs iteratively', displayOrder: 16,
  name: 'Bottom-up Merge Sort', description: 'Builds larger sorted runs by iteratively merging neighboring runs without recursion.',
  useCases: ['Teaching iterative divide and conquer', 'Predictable O(n log n) sorting'],
  complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  stable: true, inPlace: false, pseudocode, execute,
})
