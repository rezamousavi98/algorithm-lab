import type { StringSearchingAlgorithmEvent, StringSearchingInput } from '../../types'
import { align, completeStringSearch, compareAt, defineStringSearchingAlgorithm, makeStringPseudocode, recordMatch, setStringVariable, validateStringSearchingInput } from './shared'

const pseudocode = makeStringPseudocode([
  ['table', 'store each pattern character’s last position'],
  ['align', 'align the pattern and compare from right to left'],
  ['shift', 'on mismatch, shift using the bad-character rule'],
  ['match', 'record a match and shift to include overlaps'],
])

function* execute({ text: rawText, pattern: rawPattern }: StringSearchingInput): Generator<StringSearchingAlgorithmEvent, void, undefined> {
  const text = Array.from(rawText)
  const pattern = Array.from(rawPattern)
  const lastPosition = new Map<string, number>()
  pattern.forEach((character, index) => lastPosition.set(character, index))
  yield { type: 'pseudocode', lineId: 'table' }
  yield* setStringVariable('bad-character table', pattern.map(character => lastPosition.get(character) ?? -1))
  let start = 0
  const finalStart = text.length - pattern.length
  while (start <= finalStart) {
    yield* align(start, 'align')
    let patternIndex = pattern.length - 1
    while (patternIndex >= 0 && (yield* compareAt(text, pattern, start + patternIndex, patternIndex, 'align'))) patternIndex -= 1
    if (patternIndex < 0) {
      yield* recordMatch(start)
      const nextStart = start + 1
      yield* setStringVariable('shift', 1)
      yield { type: 'pseudocode', lineId: 'match' }
      start = nextStart
    } else {
      const badCharacterPosition = lastPosition.get(text[start + patternIndex]) ?? -1
      const shift = Math.max(1, patternIndex - badCharacterPosition)
      yield* setStringVariable('bad character', text[start + patternIndex])
      yield* setStringVariable('shift', shift)
      yield { type: 'pseudocode', lineId: 'shift' }
      start += shift
    }
  }
  yield* completeStringSearch()
}

export const boyerMoore = defineStringSearchingAlgorithm({
  id: 'boyer-moore', name: 'Boyer–Moore (Bad Character)', shortDescription: 'Skip using mismatched characters', displayOrder: 12,
  description: 'Compares the pattern from right to left and shifts by the bad-character rule after a mismatch. Matches are reported from left to right.',
  useCases: ['Searching longer patterns in text', 'Patterns whose characters are selective'],
  complexity: { best: 'O(m + n / m)', average: 'O(n + m) with varied characters', worst: 'O(nm)', space: 'O(k)' },
  pseudocode, execute, validateInput: validateStringSearchingInput,
})
