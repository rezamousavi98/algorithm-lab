import { useMemo, useState } from 'react'
import { buildHashTable } from '@/domain/structures/hash-table'
import { HASH_SEARCH_PRESETS, parseHashEntriesDraft, parseHashKeyDraft } from '@/domain/structures/hash-table/input'
import type { HashCollisionStrategy, HashEntryInput } from '@/domain/structures/hash-table/types'
import type { HashSearchInput } from '@/domain/algorithms/searching/hash/types'

type HashPreset = keyof typeof HASH_SEARCH_PRESETS | 'custom'
const DEFAULT_PRESET = HASH_SEARCH_PRESETS.collisions
const DEFAULT_ENTRIES = [...DEFAULT_PRESET.entries]

export function useHashSearchInput(strategy: HashCollisionStrategy) {
  const initialTable = useMemo(() => buildHashTable(DEFAULT_ENTRIES, strategy), [strategy])
  if (!initialTable.ok) throw new Error(initialTable.error)

  const [entriesDraft, setEntriesDraft] = useState(DEFAULT_ENTRIES.map(entry => `${entry.key}:${entry.value}`).join(', '))
  const [keyDraft, setKeyDraft] = useState(String(DEFAULT_PRESET.key))
  const [preset, setPreset] = useState<HashPreset>('collisions')
  const [input, setInput] = useState<HashSearchInput>(() => ({ table: initialTable.table, key: DEFAULT_PRESET.key }))
  const [error, setError] = useState<string | null>(null)
  const [runVersion, setRunVersion] = useState(0)

  function commit(entries: readonly HashEntryInput[], key: number) {
    const result = buildHashTable(entries, strategy)
    if (!result.ok) { setError(result.error); return }
    setInput({ table: result.table, key })
    setError(null)
    setRunVersion(version => version + 1)
  }

  function apply() {
    const parsedEntries = parseHashEntriesDraft(entriesDraft)
    if (!parsedEntries.ok) { setError(parsedEntries.error); return }
    const parsedKey = parseHashKeyDraft(keyDraft)
    if (!parsedKey.ok) { setError(parsedKey.error); return }
    commit(parsedEntries.entries, parsedKey.key)
  }

  function selectPreset(nextPreset: HashPreset) {
    setPreset(nextPreset)
    if (nextPreset === 'custom') return
    const selected = HASH_SEARCH_PRESETS[nextPreset]
    setEntriesDraft(selected.entries.map(entry => `${entry.key}:${entry.value}`).join(', '))
    setKeyDraft(String(selected.key))
    commit(selected.entries, selected.key)
  }

  return {
    input,
    error,
    runVersion,
    controls: {
      entriesDraft,
      keyDraft,
      preset,
      error,
      onEntriesChange: (value: string) => { setEntriesDraft(value); setPreset('custom'); setError(null) },
      onKeyChange: (value: string) => { setKeyDraft(value); setError(null) },
      onPresetChange: selectPreset,
      onApply: apply,
    },
  }
}
