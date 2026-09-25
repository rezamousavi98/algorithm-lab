import type { HashEntryInput } from './types'
import { MAX_HASH_TABLE_ENTRIES } from './types'

export type ParsedHashEntries =
  | Readonly<{ ok: true; entries: readonly HashEntryInput[] }>
  | Readonly<{ ok: false; error: string }>

const INTEGER = /^[+-]?\d+$/

export function parseHashEntriesDraft(draft: string): ParsedHashEntries {
  if (draft.trim() === '') return Object.freeze({ ok: true, entries: Object.freeze([]) })
  const records = draft.split(',')
  if (records.length > MAX_HASH_TABLE_ENTRIES) return Object.freeze({ ok: false, error: `Enter at most ${MAX_HASH_TABLE_ENTRIES} key:value pairs.` })
  const entries: HashEntryInput[] = []
  for (const [index, record] of records.entries()) {
    const match = /^\s*([+-]?\d+)\s*:\s*([+-]?\d+)\s*$/.exec(record)
    if (!match || !INTEGER.test(match[1]) || !INTEGER.test(match[2])) return Object.freeze({ ok: false, error: `Entry ${index + 1} must use the key:value format with whole numbers.` })
    const key = Number(match[1])
    const value = Number(match[2])
    if (!Number.isSafeInteger(key) || !Number.isSafeInteger(value)) return Object.freeze({ ok: false, error: `Entry ${index + 1} must use safe integers.` })
    entries.push(Object.freeze({ key: Object.is(key, -0) ? 0 : key, value }))
  }
  return Object.freeze({ ok: true, entries: Object.freeze(entries) })
}

export function parseHashKeyDraft(draft: string): Readonly<{ ok: true; key: number } | { ok: false; error: string }> {
  if (!/^\s*[+-]?\d+\s*$/.test(draft)) return Object.freeze({ ok: false, error: 'Enter a whole-number search key.' })
  const key = Number(draft)
  if (!Number.isSafeInteger(key)) return Object.freeze({ ok: false, error: 'The search key must be a safe integer.' })
  return Object.freeze({ ok: true, key: Object.is(key, -0) ? 0 : key })
}

export const HASH_SEARCH_PRESETS = Object.freeze({
  collisions: Object.freeze({ entries: Object.freeze([{ key: 2, value: 20 }, { key: 13, value: 130 }, { key: 24, value: 240 }, { key: 35, value: 350 }]), key: 35 }),
  mixed: Object.freeze({ entries: Object.freeze([{ key: 18, value: 180 }, { key: -4, value: 40 }, { key: 7, value: 70 }, { key: 29, value: 290 }]), key: 7 }),
  empty: Object.freeze({ entries: Object.freeze([]), key: 8 }),
})
