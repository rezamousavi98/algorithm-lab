import type { SearchingInput } from '../types'
import { validateSearchingInput } from './shared'

export function parseSearchingInput(valuesDraft: string, targetDraft: string):
  { ok: true; input: SearchingInput } | { ok: false; message: string } {
  if (!targetDraft.trim()) return { ok: false, message: 'Enter a finite numeric target.' }
  const tokens = valuesDraft.trim() ? valuesDraft.trim().split(/\s*,\s*|\s+/) : []
  if (tokens.some(token => !token)) return { ok: false, message: 'Separate values with commas or spaces; do not leave missing values.' }
  const input = { values: tokens.map(Number), target: Number(targetDraft) }
  const message = validateSearchingInput(input, false)
  return message ? { ok: false, message } : { ok: true, input: Object.freeze({ ...input, values: Object.freeze(input.values) }) }
}
