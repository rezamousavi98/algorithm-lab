export type TreeInputKind = 'bst' | 'binary-tree'
export type TreeSearchPreset = string | 'custom'
export type TreeSearchControls = Readonly<{
  inputKind: TreeInputKind; draft: string; targetDraft: string; preset: TreeSearchPreset
  onInputKindChange: (kind: TreeInputKind) => void; onDraftChange: (value: string) => void
  onTargetChange: (value: string) => void; onPresetChange: (preset: string) => void; onApply: () => void
}>
export function TreeSearchInputControls({ controls, inputError }: { controls: TreeSearchControls; inputError: string | null }) {
  const isBst = controls.inputKind === 'bst'
  const presets = isBst
    ? [['balanced', 'Balanced insertion'], ['skewed', 'Skewed insertion'], ['empty', 'Empty tree'], ['missing', 'Missing target'], ['duplicates', 'Duplicate update']]
    : [['balanced', 'Balanced'], ['skewed', 'Skewed 31 nodes'], ['sparse', 'Sparse'], ['duplicates', 'Duplicate keys'], ['missing', 'Missing target']]
  return <>
    <form className="tree-search-input-form" onSubmit={event => { event.preventDefault(); controls.onApply() }}>
      <label>Input type<select value={controls.inputKind} onChange={event => controls.onInputKindChange(event.target.value as TreeInputKind)}><option value="bst">BST insertion order</option><option value="binary-tree">General level order</option></select></label>
      <label>Preset<select value={controls.preset} onChange={event => controls.onPresetChange(event.target.value)}><option value="custom">Custom</option>{presets.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label className="tree-draft-label">{isBst ? 'Insertion entries' : 'Level-order tokens'}<textarea value={controls.draft} onChange={event => controls.onDraftChange(event.target.value)} placeholder={isBst ? '40:400, 20:200, 60:600' : '40:400, 20:200, 60:600, null, 30:300'} rows={3}/></label>
      <small className="tree-input-help">{isBst ? 'Use key:value entries. Insertion order determines tree shape; duplicates update values in place.' : 'Use key:value or null tokens. Null occupies a child slot; tokens after all parent slots are rejected.'} Maximum 63 nodes.</small>
      <label>Target<input inputMode="numeric" value={controls.targetDraft} onChange={event => controls.onTargetChange(event.target.value)}/></label>
      <button className="button primary" type="submit">Build &amp; Search</button>
      <small className="tree-input-help">Build applies the draft explicitly. Current playback resets to the beginning.</small>
    </form>
    {inputError && <p className="input-error" role="alert">{inputError}</p>}
  </>
}
