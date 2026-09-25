import { MAX_BINARY_TREE_NODES, MAX_BINARY_TREE_TOKENS, type TreeEntryInput, type TreeToken } from './types'

export type ParseTreeInputResult<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; error: string }>
function parsePair(token: string, index: number): ParseTreeInputResult<TreeEntryInput> {
  const match = token.trim().match(/^(-?\d+)\s*:\s*(-?\d+)$/)
  if (!match) return { ok: false, error: `Tree item ${index + 1} must use key:value format.` }
  const key = Number(match[1]); const value = Number(match[2])
  if (!Number.isSafeInteger(key) || !Number.isSafeInteger(value)) return { ok: false, error: `Tree item ${index + 1} must contain safe integers.` }
  return { ok: true, value: Object.freeze({ key, value }) }
}
export function parseTreeEntriesDraft(draft: string): ParseTreeInputResult<readonly TreeEntryInput[]> {
  if (!draft.trim()) return { ok: true, value: Object.freeze([]) }
  const tokens = draft.split(',').map(token => token.trim())
  if (tokens.length > MAX_BINARY_TREE_NODES) return { ok: false, error: `Enter at most ${MAX_BINARY_TREE_NODES} BST entries.` }
  const result: TreeEntryInput[] = []
  for (const [index, token] of tokens.entries()) {
    const parsed = parsePair(token, index)
    if (!parsed.ok) return parsed
    result.push(parsed.value)
  }
  return { ok: true, value: Object.freeze(result) }
}
export function parseLevelOrderTreeDraft(draft: string): ParseTreeInputResult<readonly TreeToken[]> {
  if (!draft.trim()) return { ok: true, value: Object.freeze([]) }
  const tokens = draft.split(',').map(token => token.trim())
  if (tokens.length > MAX_BINARY_TREE_TOKENS) return { ok: false, error: `Enter at most ${MAX_BINARY_TREE_TOKENS} level-order tokens.` }
  const result: TreeToken[] = []
  for (const [index, token] of tokens.entries()) {
    if (token.toLowerCase() === 'null' || token === '∅') { result.push(null); continue }
    const parsed = parsePair(token, index)
    if (!parsed.ok) return parsed
    result.push(parsed.value)
  }
  return { ok: true, value: Object.freeze(result) }
}
