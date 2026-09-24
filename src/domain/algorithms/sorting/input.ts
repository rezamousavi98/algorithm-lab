import type { SortingInput } from '../types'

export const MIN_GENERATED_ARRAY_SIZE = 5
export const MAX_SORTING_ARRAY_SIZE = 100

export type SortingPattern = 'random' | 'nearly-sorted' | 'reversed' | 'few-unique'

export type DatasetOptions = Readonly<{
  size: number
  pattern: SortingPattern
  seed?: number
}>

export type ManualInputResult =
  | Readonly<{ ok: true; values: SortingInput }>
  | Readonly<{ ok: false; message: string }>

/** A small seeded PRNG so callers can reproduce a generated dataset when given a seed. */
export function createSeededRandom(seed: number): () => number {
  if (!Number.isSafeInteger(seed)) throw new RangeError('The random seed must be a safe integer.')
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

export function validateSortingInput(values: SortingInput): string | null {
  if (values.length > MAX_SORTING_ARRAY_SIZE) {
    return `Arrays can contain at most ${MAX_SORTING_ARRAY_SIZE} values.`
  }
  if (values.some((value) => !Number.isFinite(value))) {
    return 'Enter finite numbers only.'
  }
  return null
}

/** Generates a new dataset. Reusing a seed and options produces the same values. */
export function generateSortingInput({ size, pattern, seed }: DatasetOptions): SortingInput {
  if (!Number.isInteger(size) || size < MIN_GENERATED_ARRAY_SIZE || size > MAX_SORTING_ARRAY_SIZE) {
    throw new RangeError(
      `Generated array size must be an integer from ${MIN_GENERATED_ARRAY_SIZE} to ${MAX_SORTING_ARRAY_SIZE}.`,
    )
  }

  const random = seed === undefined ? Math.random : createSeededRandom(seed)
  let values: number[]

  switch (pattern) {
    case 'random':
      values = Array.from({ length: size }, () => Math.floor(random() * 100) + 1)
      break
    case 'nearly-sorted': {
      values = Array.from({ length: size }, (_, index) => index + 1)
      const nearbySwaps = Math.max(1, Math.floor(size * 0.08))
      for (let swap = 0; swap < nearbySwaps; swap += 1) {
        const index = Math.floor(random() * (size - 1))
        ;[values[index], values[index + 1]] = [values[index + 1], values[index]]
      }
      break
    }
    case 'reversed':
      values = Array.from({ length: size }, (_, index) => size - index)
      break
    case 'few-unique': {
      const choices = [12, 35, 65, 90]
      values = Array.from({ length: size }, () => choices[Math.floor(random() * choices.length)])
      break
    }
    default: {
      const unsupportedPattern: never = pattern
      throw new Error(`Unsupported dataset pattern: ${String(unsupportedPattern)}`)
    }
  }

  return Object.freeze(values)
}

const NUMBER_TOKEN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i

/** Parses comma-separated decimal numbers and returns precise, actionable errors. */
export function parseManualSortingInput(
  raw: string,
  maximumItems = MAX_SORTING_ARRAY_SIZE,
): ManualInputResult {
  if (!Number.isInteger(maximumItems) || maximumItems < 1 || maximumItems > MAX_SORTING_ARRAY_SIZE) {
    throw new RangeError(`The maximum item count must be from 1 to ${MAX_SORTING_ARRAY_SIZE}.`)
  }
  if (!raw.trim()) return Object.freeze({ ok: false, message: 'Enter at least one number.' })

  const tokens = raw.split(',').map((token) => token.trim())
  if (tokens.length > maximumItems) {
    return Object.freeze({ ok: false, message: `Enter no more than ${maximumItems} values.` })
  }

  const values: number[] = []
  for (const [index, token] of tokens.entries()) {
    if (!token) {
      return Object.freeze({ ok: false, message: `Value ${index + 1} is empty. Add a number or remove the extra comma.` })
    }
    if (!NUMBER_TOKEN.test(token)) {
      return Object.freeze({ ok: false, message: `“${token}” is not a valid number. Use comma-separated numbers.` })
    }
    const value = Number(token)
    if (!Number.isFinite(value)) {
      return Object.freeze({ ok: false, message: `Value ${index + 1} must be a finite number.` })
    }
    values.push(value)
  }

  return Object.freeze({ ok: true, values: Object.freeze(values) })
}
