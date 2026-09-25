import type { SearchingAlgorithmEvent, SearchingInput } from '../types'
import { defineSearchingAlgorithm, found, inspect, makeSearchPseudocode, notFound, setCandidateRange, setSearchVariable, validateSearchingInput } from './shared'

const pseudocode = makeSearchPseudocode([
  ['bounds', 'set low and high to the candidate endpoints'],
  ['estimate', 'estimate a probe from endpoint values'],
  ['compare', 'compare the probe with the target'],
  ['narrow', 'discard the side that cannot contain the target'],
  ['finish', 'report not found when the range is exhausted'],
])

function* execute({ values, target }: SearchingInput): Generator<SearchingAlgorithmEvent, void, undefined> {
  let low = 0
  let high = values.length - 1
  yield* setCandidateRange(low, high)
  while (low <= high && target >= values[low] && target <= values[high]) {
    if (values[low] === values[high]) {
      if (yield* inspect(low, values, target, 'compare')) { yield* found(low); return }
      break
    }
    // Scaling first avoids overflow when finite endpoints have opposite signs.
    const scale = Math.max(Math.abs(values[low]), Math.abs(values[high]), Math.abs(target), 1)
    const fraction = (target / scale - values[low] / scale) / (values[high] / scale - values[low] / scale)
    const estimate = Math.max(low, Math.min(high, low + Math.floor((Number.isFinite(fraction) ? fraction : 0.5) * (high - low))))
    yield* setSearchVariable('low', low)
    yield* setSearchVariable('high', high)
    yield* setSearchVariable('probe', estimate)
    if (yield* inspect(estimate, values, target, 'estimate')) { yield* found(estimate); return }
    if (values[estimate] < target) low = estimate + 1
    else high = estimate - 1
    yield { type: 'pseudocode', lineId: 'narrow' }
    yield* setCandidateRange(low, high)
  }
  yield { type: 'pseudocode', lineId: 'finish' }
  yield* setCandidateRange(low, low - 1)
  yield* notFound()
}

export const interpolationSearch = defineSearchingAlgorithm({
  id: 'interpolation-search', name: 'Interpolation Search', shortDescription: 'Estimate the likely position', displayOrder: 4,
  description: 'Estimates a probe position from the target’s relative value between the current endpoints.',
  useCases: ['Sorted, nearly uniform numeric data', 'Teaching value-based probe estimates'],
  complexity: { best: 'O(1)', average: 'O(log log n) when values are uniform', worst: 'O(n)', space: 'O(1)' },
  requiresSortedInput: true, pseudocode, execute,
  validateInput: input => validateSearchingInput(input, true),
})
