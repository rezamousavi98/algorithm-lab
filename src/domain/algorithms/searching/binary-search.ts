import type { SearchingAlgorithmEvent, SearchingInput } from '../types'
import { defineSearchingAlgorithm, found, inspect, makeSearchPseudocode, notFound, setCandidateRange, setSearchVariable, validateSearchingInput } from './shared'

const pseudocode = makeSearchPseudocode([
  ['bounds', 'set low and high to the array bounds'],
  ['probe', 'probe the middle of the candidate range'],
  ['lower', 'if the value is smaller, discard the lower half'],
  ['upper', 'if the value is larger, discard the upper half'],
  ['finish', 'report not found when the range is empty'],
])

function* execute({ values, target }: SearchingInput): Generator<SearchingAlgorithmEvent, void, undefined> {
  let low = 0
  let high = values.length - 1
  yield* setCandidateRange(low, high)
  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2)
    yield* setSearchVariable('low', low)
    yield* setSearchVariable('high', high)
    yield* setSearchVariable('middle', middle)
    if (yield* inspect(middle, values, target, 'probe')) { yield* found(middle); return }
    if (values[middle] < target) {
      low = middle + 1
      yield { type: 'pseudocode', lineId: 'lower' }
    } else {
      high = middle - 1
      yield { type: 'pseudocode', lineId: 'upper' }
    }
    yield* setCandidateRange(low, high)
  }
  yield { type: 'pseudocode', lineId: 'finish' }
  yield* notFound()
}

export const binarySearch = defineSearchingAlgorithm({
  id: 'binary-search', name: 'Binary Search', shortDescription: 'Halve a sorted range', displayOrder: 1,
  description: 'Repeatedly probes the midpoint of an ascending array and discards half the remaining range.',
  useCases: ['Repeated searches in sorted data', 'Large ordered arrays'],
  complexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
  requiresSortedInput: true, pseudocode, execute,
  validateInput: input => validateSearchingInput(input, true),
})
