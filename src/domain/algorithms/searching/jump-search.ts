import type { SearchingAlgorithmEvent, SearchingInput } from '../types'
import { defineSearchingAlgorithm, found, inspect, makeSearchPseudocode, notFound, setCandidateRange, setSearchVariable, validateSearchingInput } from './shared'

const pseudocode = makeSearchPseudocode([
  ['step', 'choose a block size near square root of n'],
  ['jump', 'probe the end of each block'],
  ['scan', 'scan the block that may contain the target'],
  ['finish', 'report not found when no block contains it'],
])

function* execute({ values, target }: SearchingInput): Generator<SearchingAlgorithmEvent, void, undefined> {
  const size = Math.max(1, Math.floor(Math.sqrt(values.length)))
  let start = 0
  let end = Math.min(size, values.length) - 1
  yield* setSearchVariable('blockSize', size)
  while (start < values.length) {
    yield* setSearchVariable('blockStart', start)
    yield* setSearchVariable('blockEnd', end)
    if (yield* inspect(end, values, target, 'jump')) {
      yield* found(end); return
    }
    if (values[end] > target) {
      yield* setCandidateRange(start, end)
      for (let index = start; index < end; index += 1) {
        yield* setSearchVariable('index', index)
        if (yield* inspect(index, values, target, 'scan')) { yield* found(index); return }
        yield* setCandidateRange(index + 1, end)
      }
      yield* setCandidateRange(end + 1, end)
      yield* notFound(); return
    }
    start = end + 1
    end = Math.min(start + size, values.length) - 1
    yield* setCandidateRange(start, end)
  }
  yield* setCandidateRange(values.length, values.length - 1)
  yield* notFound()
}

export const jumpSearch = defineSearchingAlgorithm({
  id: 'jump-search', name: 'Jump Search', shortDescription: 'Jump by square-root blocks', displayOrder: 2,
  description: 'Jumps through an ascending array by fixed-size blocks, then scans the candidate block.',
  useCases: ['Sorted arrays', 'Comparing block search with binary search'],
  complexity: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)', space: 'O(1)' },
  requiresSortedInput: true, pseudocode, execute,
  validateInput: input => validateSearchingInput(input, true),
})
