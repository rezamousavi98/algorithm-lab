import type {
  PseudocodeLine,
  StringSearchingAlgorithmDefinition,
  StringSearchingAlgorithmEvent,
  StringSearchingInput,
} from '../../types'

export const MAX_SEARCH_TEXT_LENGTH = 250
export const MAX_SEARCH_PATTERN_LENGTH = 50
export const MAX_STRING_SEARCH_EVENTS = 50_000

export function makeStringPseudocode(lines: readonly (readonly [string, string])[]): readonly PseudocodeLine[] {
  return Object.freeze(lines.map(([id, code]) => Object.freeze({ id, code })))
}

export function defineStringSearchingAlgorithm(
  definition: Omit<StringSearchingAlgorithmDefinition, 'category'>,
): StringSearchingAlgorithmDefinition {
  return Object.freeze({
    ...definition,
    category: 'searching',
    useCases: Object.freeze([...definition.useCases]),
    complexity: Object.freeze({ ...definition.complexity }),
    pseudocode: Object.freeze([...definition.pseudocode]),
  })
}

export function validateStringSearchingInput(input: StringSearchingInput): string | null {
  if (typeof input.text !== 'string' || typeof input.pattern !== 'string') return 'Enter text and a search pattern.'
  const textLength = Array.from(input.text).length
  const patternLength = Array.from(input.pattern).length
  if (patternLength === 0) return 'The search pattern must contain at least one character.'
  if (textLength > MAX_SEARCH_TEXT_LENGTH) return `Text can contain at most ${MAX_SEARCH_TEXT_LENGTH} Unicode characters.`
  if (patternLength > MAX_SEARCH_PATTERN_LENGTH) return `Patterns can contain at most ${MAX_SEARCH_PATTERN_LENGTH} Unicode characters.`
  return null
}

export function* setStringVariable(name: string, value: number | string | readonly number[]): Generator<StringSearchingAlgorithmEvent, void, undefined> {
  yield { type: 'variable', name, value }
}

export function* align(index: number, lineId: string): Generator<StringSearchingAlgorithmEvent, void, undefined> {
  yield { type: 'pseudocode', lineId }
  yield { type: 'stringAlignment', index }
}

export function* compareAt(
  text: readonly string[], pattern: readonly string[], textIndex: number, patternIndex: number, lineId: string,
): Generator<StringSearchingAlgorithmEvent, boolean, undefined> {
  yield { type: 'pseudocode', lineId }
  const textChar = text[textIndex]
  const patternChar = pattern[patternIndex]
  yield { type: 'stringCompare', textIndex, patternIndex, textChar, patternChar }
  return textChar === patternChar
}

export function* recordMatch(index: number): Generator<StringSearchingAlgorithmEvent, void, undefined> {
  yield { type: 'stringMatch', index }
}

export function* completeStringSearch(): Generator<StringSearchingAlgorithmEvent, void, undefined> {
  yield { type: 'stringSearchComplete' }
}

export function* emitStringHash(index: number, windowHash: number, patternHash: number): Generator<StringSearchingAlgorithmEvent, void, undefined> {
  yield { type: 'stringHash', index, windowHash, patternHash }
}
