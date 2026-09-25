import type { StringSearchingAlgorithmEvent, StringSearchingInput } from '../../types'
import { align, completeStringSearch, compareAt, defineStringSearchingAlgorithm, emitStringHash, makeStringPseudocode, recordMatch, setStringVariable, validateStringSearchingInput } from './shared'

const BASE = 257
const MODULUS = 1_000_003
const pseudocode = makeStringPseudocode([
  ['hash', 'hash the pattern and first text window'],
  ['compare-hash', 'compare the current window hash with the pattern hash'],
  ['verify', 'when hashes agree, verify the characters to rule out collisions'],
  ['roll', 'remove the leading character and add the next one'],
])

function codePoint(character: string): number { return character.codePointAt(0) ?? 0 }
function hash(chars: readonly string[]): number {
  let result = 0
  for (const character of chars) result = (result * BASE + codePoint(character)) % MODULUS
  return result
}

function* execute({ text: rawText, pattern: rawPattern }: StringSearchingInput): Generator<StringSearchingAlgorithmEvent, void, undefined> {
  const text = Array.from(rawText)
  const pattern = Array.from(rawPattern)
  const windowCount = text.length - pattern.length + 1
  if (windowCount <= 0) { yield* completeStringSearch(); return }
  let highPower = 1
  for (let exponent = 1; exponent < pattern.length; exponent += 1) highPower = (highPower * BASE) % MODULUS
  const patternHash = hash(pattern)
  let windowHash = hash(text.slice(0, pattern.length))
  yield* setStringVariable('pattern hash', patternHash)
  yield* setStringVariable('high power', highPower)
  for (let start = 0; start < windowCount; start += 1) {
    yield* align(start, 'compare-hash')
    yield* emitStringHash(start, windowHash, patternHash)
    yield* setStringVariable('window hash', windowHash)
    if (windowHash === patternHash) {
      let matches = true
      for (let offset = 0; offset < pattern.length; offset += 1) {
        if (!(yield* compareAt(text, pattern, start + offset, offset, 'verify'))) { matches = false; break }
      }
      if (matches) yield* recordMatch(start)
    }
    if (start + 1 < windowCount) {
      const leading = codePoint(text[start])
      const trailing = codePoint(text[start + pattern.length])
      windowHash = (((windowHash - leading * highPower) % MODULUS + MODULUS) * BASE + trailing) % MODULUS
      yield* setStringVariable('next hash', windowHash)
      yield { type: 'pseudocode', lineId: 'roll' }
    }
  }
  yield* completeStringSearch()
}

export const rabinKarp = defineStringSearchingAlgorithm({
  id: 'rabin-karp', name: 'Rabin–Karp', shortDescription: 'Compare rolling hashes', displayOrder: 13,
  description: 'Compares a rolling text-window hash with the pattern hash, then checks characters when hashes agree. This prevents false matches from collisions.',
  useCases: ['Searching many patterns of similar length', 'Teaching rolling hashes and collision verification'],
  complexity: { best: 'O(n + m)', average: 'O(n + m)', worst: 'O(nm)', space: 'O(1)' },
  pseudocode, execute, validateInput: validateStringSearchingInput,
})
