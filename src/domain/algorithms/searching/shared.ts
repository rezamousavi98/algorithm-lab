import type {
  PseudocodeLine,
  SearchingAlgorithmDefinition,
  SearchingAlgorithmEvent,
  SearchingInput,
} from '../types'

export const MAX_SEARCH_ARRAY_SIZE = 100

export function makeSearchPseudocode(lines: readonly (readonly [string, string, number?])[]): readonly PseudocodeLine[] {
  return Object.freeze(lines.map(([id, code, indent]) => Object.freeze({ id, code, indent })))
}

export function defineSearchingAlgorithm(
  definition: Omit<SearchingAlgorithmDefinition<SearchingAlgorithmEvent>, 'category' | 'matchPolicy'>,
): SearchingAlgorithmDefinition<SearchingAlgorithmEvent> {
  return Object.freeze({
    ...definition,
    category: 'searching',
    requiresSortedInput: definition.requiresSortedInput,
    matchPolicy: 'any-match',
    useCases: Object.freeze([...definition.useCases]),
    complexity: Object.freeze({ ...definition.complexity }),
    pseudocode: Object.freeze([...definition.pseudocode]),
  })
}

export function validateSearchingInput(input: SearchingInput, requiresSorted: boolean): string | null {
  if (!Array.isArray(input.values)) return 'Search values must be an array.'
  if (input.values.length > MAX_SEARCH_ARRAY_SIZE) return `Search arrays can contain at most ${MAX_SEARCH_ARRAY_SIZE} values.`
  if (!Number.isFinite(input.target)) return 'Enter a finite number to search for.'
  if (input.values.some(value => !Number.isFinite(value))) return 'Search values must all be finite numbers.'
  if (requiresSorted && input.values.some((value, index, values) => index > 0 && value < values[index - 1])) {
    return 'This algorithm requires values in ascending order. Sort a copy of the array to continue.'
  }
  return null
}

export function* inspect(
  index: number,
  values: readonly number[],
  target: number,
  lineId: string,
): Generator<SearchingAlgorithmEvent, boolean, undefined> {
  yield { type: 'pseudocode', lineId }
  yield { type: 'searchProbe', index }
  const value = values[index]
  yield { type: 'searchCompare', index, value, target }
  return value === target
}

export function* setSearchVariable(name: string, value: number | string): Generator<SearchingAlgorithmEvent, void, undefined> {
  yield { type: 'variable', name, value }
}

export function* setCandidateRange(low: number, high: number): Generator<SearchingAlgorithmEvent, void, undefined> {
  yield { type: 'candidateRange', low, high }
}

export function* found(index: number): Generator<SearchingAlgorithmEvent, void, undefined> {
  yield { type: 'searchResult', result: 'found', index }
}

export function* notFound(): Generator<SearchingAlgorithmEvent, void, undefined> {
  yield { type: 'searchResult', result: 'not-found' }
}

export type SearchExecutor = (input: SearchingInput) => Generator<SearchingAlgorithmEvent, void, undefined>
