import type { SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const MAX_COUNT_RANGE = 10_000

const pseudocode = makePseudocode([
  ['range', 'find the minimum and maximum values'],
  ['initialize', 'create a count array for the value range'],
  ['count', 'count each input value'],
  ['prefix', 'convert counts to cumulative positions'],
  ['place', 'place values into the output from right to left'],
  ['write-back', 'write the output into the array'],
])

function validateInput(input: SortingInput): string | null {
  if (!input.every(Number.isSafeInteger)) return 'Counting Sort requires safe integer values.'
  if (input.length === 0) return null
  const range = Math.max(...input) - Math.min(...input) + 1
  return range <= MAX_COUNT_RANGE
    ? null
    : `Counting Sort supports a value range of at most ${MAX_COUNT_RANGE} distinct integers.`
}

function* execute(input: SortingInput) {
  if (input.length === 0) return
  const minimum = Math.min(...input)
  const maximum = Math.max(...input)
  const counts = Array<number>(maximum - minimum + 1).fill(0)
  const output = Array<number>(input.length)
  yield* setVariable('minimum', minimum)
  yield* setVariable('maximum', maximum)
  yield* emit({ type: 'range', role: 'active', indices: [0, input.length - 1] }, 'range')
  yield* emit({ type: 'auxiliaryUpdate', panelId: 'count-array', label: 'Count array', values: counts }, 'initialize')

  for (let index = 0; index < input.length; index += 1) {
    const value = input[index]
    const countIndex = value - minimum
    yield* setVariable('value', value)
    yield* emit({ type: 'read', index, value }, 'count')
    counts[countIndex] += 1
    yield* setVariable('frequency', counts[countIndex])
  }
  yield* emit({ type: 'auxiliaryUpdate', panelId: 'count-array', label: 'Count array', values: counts }, 'count')

  for (let index = 1; index < counts.length; index += 1) {
    counts[index] += counts[index - 1]
    yield* setVariable('countIndex', index)
  }
  yield* emit({ type: 'auxiliaryUpdate', panelId: 'count-array', label: 'Cumulative positions', values: counts }, 'prefix')

  for (let index = input.length - 1; index >= 0; index -= 1) {
    const value = input[index]
    const countIndex = value - minimum
    counts[countIndex] -= 1
    output[counts[countIndex]] = value
  }
  yield* emit({ type: 'auxiliaryUpdate', panelId: 'count-array', label: 'Output positions', values: counts }, 'place')

  for (let index = 0; index < output.length; index += 1) {
    yield* setVariable('index', index)
    yield* emit({ type: 'write', index, value: output[index] }, 'write-back')
  }
  yield { type: 'markSorted', indices: Array.from({ length: input.length }, (_, index) => index) } as const
}

export const countingSort = defineSortingAlgorithm({
  id: 'counting-sort',
  name: 'Counting Sort',
  description: 'Counts integer frequencies, then uses cumulative positions to order the values.',
  useCases: ['Integer values in a small, bounded range', 'Sorting without comparisons'],
  complexity: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n + k)', space: 'O(n + k)' },
  stable: true,
  inPlace: false,
  pseudocode,
  validateInput,
  execute,
})
