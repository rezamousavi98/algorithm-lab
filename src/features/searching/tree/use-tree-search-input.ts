import { useState } from 'react'
import { buildBinarySearchTree, buildLevelOrderBinaryTree, BST_SEARCH_PRESETS, BINARY_TREE_SEARCH_PRESETS, parseLevelOrderTreeDraft, parseTreeEntriesDraft } from '@/domain/structures/binary-tree'
import type { TreeSearchInput } from '@/domain/algorithms/searching/tree'
import type { TreeInputKind, TreeSearchControls } from './tree-search-input-controls'

const firstPreset = BST_SEARCH_PRESETS.balanced
const initialBuild = buildBinarySearchTree(firstPreset.entries)
const initialTree = (() => { if (initialBuild.ok) return initialBuild.tree; throw new Error(initialBuild.error) })()
export function useTreeSearchInput() {
  const [input, setInput] = useState<TreeSearchInput>(() => ({ tree: initialTree, target: firstPreset.target }))
  const [inputKind, setInputKind] = useState<TreeInputKind>('bst')
  const [draft, setDraft] = useState(firstPreset.entries.map(item => `${item.key}:${item.value}`).join(', '))
  const [targetDraft, setTargetDraft] = useState(String(firstPreset.target))
  const [preset, setPreset] = useState('balanced')
  const [error, setError] = useState<string | null>(null)
  const [runVersion, setRunVersion] = useState(0)

  function commit(kind: TreeInputKind, source: string, target: number): string | null {
    if (kind === 'bst') {
      const parsed = parseTreeEntriesDraft(source)
      if (!parsed.ok) return parsed.error
      const result = buildBinarySearchTree(parsed.value)
      if (!result.ok) return result.error
      setInput(Object.freeze({ tree: result.tree, target }))
    } else {
      const parsed = parseLevelOrderTreeDraft(source)
      if (!parsed.ok) return parsed.error
      const result = buildLevelOrderBinaryTree(parsed.value)
      if (!result.ok) return result.error
      setInput(Object.freeze({ tree: result.tree, target }))
    }
    setRunVersion(version => version + 1)
    return null
  }
  function apply() {
    if (!targetDraft.trim()) { setError('Target must be a safe integer.'); return }
    const target = Number(targetDraft.trim())
    if (!Number.isSafeInteger(target)) { setError('Target must be a safe integer.'); return }
    const nextError = commit(inputKind, draft, target)
    setError(nextError)
  }
  function selectPreset(id: string) {
    if (id === 'custom') { setPreset(id); return }
    if (inputKind === 'bst' && id in BST_SEARCH_PRESETS) {
      const selected = BST_SEARCH_PRESETS[id]
      const source = selected.entries.map(item => `${item.key}:${item.value}`).join(', ')
      setDraft(source); setTargetDraft(String(selected.target)); setPreset(id)
      setError(commit('bst', source, selected.target))
      return
    }
    if (id in BINARY_TREE_SEARCH_PRESETS) {
      const selected = BINARY_TREE_SEARCH_PRESETS[id]
      const source = selected.tokens.map(item => item === null ? 'null' : `${item.key}:${item.value}`).join(', ')
      setInputKind('binary-tree'); setDraft(source); setTargetDraft(String(selected.target)); setPreset(id)
      setError(commit('binary-tree', source, selected.target))
    }
  }
  const controls: TreeSearchControls = {
    inputKind, draft, targetDraft, preset,
    onInputKindChange: kind => { setInputKind(kind); setPreset('custom'); setError(null) },
    onDraftChange: value => { setDraft(value); setPreset('custom'); setError(null) },
    onTargetChange: value => { setTargetDraft(value); setError(null) },
    onPresetChange: selectPreset,
    onApply: apply,
  }
  return { input, inputError: error, runVersion, controls }
}
