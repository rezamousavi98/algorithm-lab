import type { StringSearchingAlgorithmEvent, StringSearchingInput } from '../../types'
import { align, completeStringSearch, compareAt, defineStringSearchingAlgorithm, makeStringPseudocode, recordMatch, setStringVariable, validateStringSearchingInput } from './shared'

const pseudocode = makeStringPseudocode([
  ['prefix', 'build the longest-prefix-suffix table for the pattern'],
  ['scan', 'compare the next text and pattern characters'],
  ['fallback', 'on mismatch, reuse the prefix table without moving text backward'],
  ['match', 'record a match and fall back to allow overlaps'],
])

function buildPrefixTable(pattern: readonly string[]): number[] {
  const table = new Array<number>(pattern.length).fill(0)
  let prefixLength = 0
  for (let index = 1; index < pattern.length;) {
    if (pattern[index] === pattern[prefixLength]) table[index++] = ++prefixLength
    else if (prefixLength > 0) prefixLength = table[prefixLength - 1]
    else table[index++] = 0
  }
  return table
}

function* execute({ text: rawText, pattern: rawPattern }: StringSearchingInput): Generator<StringSearchingAlgorithmEvent, void, undefined> {
  const text = Array.from(rawText)
  const pattern = Array.from(rawPattern)
  const prefix = buildPrefixTable(pattern)
  yield { type: 'pseudocode', lineId: 'prefix' }
  yield* setStringVariable('prefix table', prefix)
  let textIndex = 0
  let patternIndex = 0
  let lastAlignment = -1
  while (textIndex < text.length && textIndex - patternIndex <= text.length - pattern.length) {
    const start = textIndex - patternIndex
    if (start !== lastAlignment && start <= text.length - pattern.length) {
      yield* align(start, 'scan')
      lastAlignment = start
    }
    if (yield* compareAt(text, pattern, textIndex, patternIndex, 'scan')) {
      textIndex += 1
      patternIndex += 1
      if (patternIndex === pattern.length) {
        const matchStart = textIndex - pattern.length
        yield* recordMatch(matchStart)
        patternIndex = prefix[patternIndex - 1]
        const nextStart = textIndex - patternIndex
        if (nextStart !== lastAlignment && nextStart <= text.length - pattern.length) {
          yield* align(nextStart, 'match')
          lastAlignment = nextStart
        }
      }
    } else if (patternIndex > 0) {
      yield* setStringVariable('fallback to', prefix[patternIndex - 1])
      yield { type: 'pseudocode', lineId: 'fallback' }
      patternIndex = prefix[patternIndex - 1]
    } else textIndex += 1
  }
  yield* completeStringSearch()
}

export const knuthMorrisPratt = defineStringSearchingAlgorithm({
  id: 'knuth-morris-pratt', name: 'Knuth–Morris–Pratt', shortDescription: 'Reuse matched prefixes', displayOrder: 11,
  description: 'Uses a longest-prefix-suffix table to avoid rechecking text characters after a mismatch. Finds overlapping matches.',
  useCases: ['Long patterns with repeated prefixes', 'Linear-time exact matching'],
  complexity: { best: 'O(n + m)', average: 'O(n + m)', worst: 'O(n + m)', space: 'O(m)' },
  pseudocode, execute, validateInput: validateStringSearchingInput,
})
