export type StringSearchControls = Readonly<{
  textDraft: string
  patternDraft: string
  error: string | null
  onTextChange: (value: string) => void
  onPatternChange: (value: string) => void
  onApply: () => void
}>


export function StringInputControls({ controls, inputError }: { controls: StringSearchControls; inputError: string | null }) {
  return <>
      <form className="string-input-form" onSubmit={event => { event.preventDefault(); controls.onApply() }}>
        <label>Text <textarea rows={2} value={controls.textDraft} onChange={event => controls.onTextChange(event.target.value)} maxLength={1000} aria-describedby="string-input-hint"/></label>
        <label>Pattern <input value={controls.patternDraft} onChange={event => controls.onPatternChange(event.target.value)} maxLength={100} /></label>
        <button className="button primary" type="submit">Apply</button>
        <small id="string-input-hint">Text up to 250 characters; pattern up to 50. Matching uses Unicode code points.</small>
      </form>
      {(inputError || controls.error) && <p className="input-error" role="alert">{inputError ?? controls.error}</p>}
  </>
}
