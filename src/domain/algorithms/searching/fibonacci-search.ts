import type { SearchingAlgorithmEvent, SearchingInput } from '../types'
import { defineSearchingAlgorithm, found, inspect, makeSearchPseudocode, notFound, setCandidateRange, setSearchVariable, validateSearchingInput } from './shared'

const pseudocode = makeSearchPseudocode([
  ['fib', 'find the smallest Fibonacci number covering the array'],
  ['probe', 'probe using the Fibonacci offset'],
  ['lower', 'move the offset right when the probe is too small'],
  ['upper', 'reduce the Fibonacci window when the probe is too large'],
  ['finish', 'check the final remaining position'],
])

function* execute({ values, target }: SearchingInput): Generator<SearchingAlgorithmEvent, void, undefined> {
  let fib2 = 0
  let fib1 = 1
  let fib = fib1 + fib2
  while (fib < values.length) { fib2 = fib1; fib1 = fib; fib = fib1 + fib2 }
  let offset = -1
  let low = 0
  let high = values.length - 1
  yield* setCandidateRange(low, high)
  while (fib > 1) {
    const index = Math.min(offset + fib2, values.length - 1)
    yield* setSearchVariable('fib', fib)
    yield* setSearchVariable('offset', offset)
    if (yield* inspect(index, values, target, 'probe')) { yield* found(index); return }
    if (values[index] < target) {
      low = index + 1
      fib = fib1
      fib1 = fib2
      fib2 = fib - fib1
      offset = index
      yield { type: 'pseudocode', lineId: 'lower' }
    } else {
      high = index - 1
      fib = fib2
      fib1 -= fib2
      fib2 = fib - fib1
      yield { type: 'pseudocode', lineId: 'upper' }
    }
    yield* setCandidateRange(low, high)
  }
  const finalIndex = offset + 1
  if (finalIndex < values.length && finalIndex >= 0 && low <= finalIndex && finalIndex <= high) {
    if (yield* inspect(finalIndex, values, target, 'finish')) { yield* found(finalIndex); return }
  }
  yield* setCandidateRange(values.length, values.length - 1)
  yield* notFound()
}

export const fibonacciSearch = defineSearchingAlgorithm({
  id: 'fibonacci-search', name: 'Fibonacci Search', shortDescription: 'Narrow by Fibonacci offsets', displayOrder: 5,
  description: 'Searches an ascending array using Fibonacci-sized offsets to shrink the candidate range.',
  useCases: ['Sorted arrays', 'Teaching alternative ordered range partitioning'],
  complexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
  requiresSortedInput: true, pseudocode, execute,
  validateInput: input => validateSearchingInput(input, true),
})
