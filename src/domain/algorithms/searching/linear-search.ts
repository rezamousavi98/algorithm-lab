import type { SearchingAlgorithmEvent, SearchingInput } from '../types'
import { defineSearchingAlgorithm, found, inspect, makeSearchPseudocode, notFound, setCandidateRange, setSearchVariable, validateSearchingInput } from './shared'

const pseudocode = makeSearchPseudocode([
  ['start', 'start at the first position'],
  ['compare', 'compare the current value with the target'],
  ['advance', 'advance to the next position'],
  ['finish', 'report not found after the array ends'],
])

function* execute({ values, target }: SearchingInput): Generator<SearchingAlgorithmEvent, void, undefined> {
  for (let index = 0; index < values.length; index += 1) {
    yield* setSearchVariable('index', index)
    if (yield* inspect(index, values, target, 'compare')) { yield* found(index); return }
    yield* setCandidateRange(index + 1, values.length - 1)
    yield { type: 'pseudocode', lineId: 'advance' }
  }
  yield { type: 'pseudocode', lineId: 'finish' }
  yield* notFound()
}

export const linearSearch = defineSearchingAlgorithm({
  id: 'linear-search', name: 'Linear Search', shortDescription: 'Check values one by one', displayOrder: 0,
  description: 'Checks each value in order and returns the first matching position.',
  useCases: ['Unsorted data', 'Small arrays or one-off searches'],
  complexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(1)' },
  requiresSortedInput: false, pseudocode, execute,
  validateInput: input => validateSearchingInput(input, false),
})
