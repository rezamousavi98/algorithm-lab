import { ARRAY_SIZE_OPTIONS } from '@/domain/preferences/user-preferences'
import { Shuffle } from 'lucide-react'
import type { FormEvent } from 'react'
import type { SortingPattern } from '@/domain/algorithms/sorting/input'

export type DatasetControlsProps = Readonly<{
  arraySize: number; pattern: SortingPattern; inputMode: 'generated' | 'manual'; manualDraft: string; manualError: string | null
  onArraySizeChange: (size: number) => void; onPatternChange: (pattern: SortingPattern) => void
  onInputModeChange: (mode: 'generated' | 'manual') => void; onManualDraftChange: (draft: string) => void
  onApplyManual: () => void; onGenerate: () => void
}>

export function DatasetControls(props: DatasetControlsProps) {
  const { arraySize, pattern, inputMode, manualDraft, manualError, onArraySizeChange, onPatternChange, onInputModeChange, onManualDraftChange, onApplyManual, onGenerate } = props
  const applyManual = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onApplyManual() }
  return <>
    <div className="dataset-controls" aria-label="Input array settings">
      {inputMode === 'generated' && <>
        <label className="control-select"><span>Pattern</span><select value={pattern} aria-label="Array pattern" onChange={(event) => onPatternChange(event.target.value as SortingPattern)}><option value="random">Random</option><option value="nearly-sorted">Nearly sorted</option><option value="reversed">Reversed</option><option value="few-unique">Few unique</option></select><span className="select-caret">⌄</span></label>
        <label className="control-select array-size-select"><span>Array Size</span><select value={arraySize} aria-label="Array size" onChange={(event) => onArraySizeChange(Number(event.target.value))}>{ARRAY_SIZE_OPTIONS.map((size) => <option key={size}>{size}</option>)}</select><span className="select-caret">⌄</span></label>
        <button className="button generate" onClick={onGenerate}><Shuffle size={16}/>Generate New</button>
      </>}
      <button className="button input-mode-button" aria-pressed={inputMode === 'manual'} onClick={() => onInputModeChange(inputMode === 'generated' ? 'manual' : 'generated')}>{inputMode === 'generated' ? 'Enter values' : 'Use generated data'}</button>
    </div>
    {inputMode === 'manual' && <form className="manual-input-panel" onSubmit={applyManual}>
      <label htmlFor="manual-array-values">Custom values</label>
      <textarea id="manual-array-values" rows={2} value={manualDraft} onChange={(event) => onManualDraftChange(event.target.value)} placeholder="8, 3, 12, 1, 7, 4" aria-describedby={manualError ? 'manual-input-error' : undefined}/>
      {manualError && <p className="input-error" id="manual-input-error" role="alert">{manualError}</p>}
      <button type="submit" className="button primary">Apply input</button><span className="input-hint">Use 1–100 comma-separated finite numbers.</span>
    </form>}
  </>
}
