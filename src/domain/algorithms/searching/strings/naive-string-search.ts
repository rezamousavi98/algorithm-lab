import type { StringSearchingAlgorithmEvent, StringSearchingInput } from '../../types'
import { align, completeStringSearch, compareAt, defineStringSearchingAlgorithm, makeStringPseudocode, recordMatch, validateStringSearchingInput } from './shared'

const pseudocode = makeStringPseudocode([
  ['align', 'align the pattern at each possible text position'],
  ['compare', 'compare characters from left to right'],
  ['match', 'record a match when every character agrees'],
  ['advance', 'advance by one position to allow overlapping matches'],
])

function* execute({ text: rawText, pattern: rawPattern }: StringSearchingInput): Generator<StringSearchingAlgorithmEvent, void, undefined> {
  const text = Array.from(rawText)
  const pattern = Array.from(rawPattern)
  for (let start = 0; start <= text.length - pattern.length; start += 1) {
    yield* align(start, 'align')
    let matched = true
    for (let offset = 0; offset < pattern.length; offset += 1) {
      if (!(yield* compareAt(text, pattern, start + offset, offset, 'compare'))) { matched = false; break }
    }
    if (matched) yield* recordMatch(start)
    yield { type: 'pseudocode', lineId: matched ? 'match' : 'advance' }
  }
  yield* completeStringSearch()
}

export const naiveStringSearch = defineStringSearchingAlgorithm({
  id: 'naive-string-search', name: 'Naive String Search', shortDescription: 'Check each text position', displayOrder: 10,
  description: 'Aligns the pattern at every possible position and compares characters from left to right. Overlapping matches are included.',
  useCases: ['Short text or patterns', 'Baseline for comparing pattern-matching strategies'],
  complexity: { best: 'O(n)', average: 'O(nm)', worst: 'O(nm)', space: 'O(1)' },
  pseudocode, execute, validateInput: validateStringSearchingInput,
})
