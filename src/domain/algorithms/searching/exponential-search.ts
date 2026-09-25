import type { SearchingAlgorithmEvent, SearchingInput } from '../types'
import { defineSearchingAlgorithm, found, inspect, makeSearchPseudocode, notFound, setCandidateRange, setSearchVariable, validateSearchingInput } from './shared'

const pseudocode = makeSearchPseudocode([
  ['first', 'check the first value'],
  ['expand', 'double the upper bound until it reaches or passes the target'],
  ['binary', 'binary-search the bounded interval'],
  ['finish', 'report not found when the interval is empty'],
])

function* execute({ values, target }: SearchingInput): Generator<SearchingAlgorithmEvent, void, undefined> {
  if (!values.length) { yield* notFound(); return }
  if (yield* inspect(0, values, target, 'first')) { yield* found(0); return }
  if (values[0] > target || values.length === 1) { yield* setCandidateRange(values.length, values.length - 1); yield* notFound(); return }
  let bound = 1
  let low = 0
  while (bound < values.length) {
    yield* setSearchVariable('bound', bound)
    if (yield* inspect(bound, values, target, 'expand')) break
    if (values[bound] > target) break
    low = bound + 1
    yield* setCandidateRange(low, values.length - 1)
    if (bound === values.length - 1) { yield* notFound(); return }
    bound = Math.min(bound * 2, values.length - 1)
  }
  let high = Math.min(bound, values.length - 1)
  yield* setCandidateRange(low, high)
  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2)
    yield* setSearchVariable('low', low)
    yield* setSearchVariable('high', high)
    if (yield* inspect(middle, values, target, 'binary')) { yield* found(middle); return }
    if (values[middle] < target) low = middle + 1
    else high = middle - 1
    yield* setCandidateRange(low, high)
  }
  yield { type: 'pseudocode', lineId: 'finish' }
  yield* setCandidateRange(values.length, values.length - 1)
  yield* notFound()
}

export const exponentialSearch = defineSearchingAlgorithm({
  id: 'exponential-search', name: 'Exponential Search', shortDescription: 'Double bounds, then halve', displayOrder: 3,
  description: 'Expands an upper bound exponentially, then binary-searches the bounded interval.',
  useCases: ['Sorted arrays', 'Targets near the beginning of a large array'],
  complexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
  requiresSortedInput: true, pseudocode, execute,
  validateInput: input => validateSearchingInput(input, true),
})
