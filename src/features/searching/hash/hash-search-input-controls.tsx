export type HashSearchControls = Readonly<{
  entriesDraft: string
  keyDraft: string
  preset: 'collisions' | 'mixed' | 'empty' | 'custom'
  error: string | null
  onEntriesChange: (value: string) => void
  onKeyChange: (value: string) => void
  onPresetChange: (value: 'collisions' | 'mixed' | 'empty' | 'custom') => void
  onApply: () => void
}>

export function HashSearchInputControls({ controls, inputError }: { controls: HashSearchControls; inputError: string | null }) {
  return <>
    <form className="hash-search-input-form" onSubmit={event => { event.preventDefault(); controls.onApply() }}>
      <label>Entries <input value={controls.entriesDraft} onChange={event => controls.onEntriesChange(event.target.value)} placeholder="key:value, key:value" aria-describedby="hash-input-hint"/></label>
      <label>Search key <input inputMode="numeric" value={controls.keyDraft} onChange={event => controls.onKeyChange(event.target.value)}/></label>
      <label>Preset <select value={controls.preset} onChange={event => controls.onPresetChange(event.target.value as HashSearchControls['preset'])}>
        <option value="collisions">Collisions</option><option value="mixed">Mixed keys</option><option value="empty">Empty table</option><option value="custom">Custom entries</option>
      </select></label>
      <button className="button primary" type="submit">Build &amp; Search</button>
      <small id="hash-input-hint">Enter up to 32 safe-integer pairs as key:value. Duplicate keys update their value; capacity is chosen to keep load at or below 0.5.</small>
    </form>
    {(inputError || controls.error) && <p className="input-error" role="alert">{inputError ?? controls.error}</p>}
  </>
}
