import { Shuffle } from 'lucide-react'
import { ARRAY_SIZE_OPTIONS } from '@/domain/preferences/user-preferences'
import type { SortingPattern } from '@/domain/algorithms/sorting/input'

export type SearchingControls = Readonly<{
  valuesDraft: string; targetDraft: string; error: string | null; pattern: SortingPattern
  onValuesDraft: (value: string) => void; onTargetDraft: (value: string) => void; onApply: () => void
  onSortCopy: () => void; onGenerate: (size?: number, pattern?: SortingPattern) => void
  onPattern: (pattern: SortingPattern) => void
}>

export function SearchingInputControls({ controls, valueCount, sorted, requiresSortedInput, inputError }: {
  controls: SearchingControls; valueCount: number; sorted: boolean; requiresSortedInput: boolean; inputError: string | null
}) {
  return <><div className="dataset-controls">
        <label className="control-select"><span>Array size</span><select aria-label="Array size" value={valueCount} onChange={e => controls.onGenerate(Number(e.target.value), controls.pattern)}>{!ARRAY_SIZE_OPTIONS.includes(valueCount) && <option value={valueCount}>{valueCount} (custom)</option>}{ARRAY_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}</select></label>
        <label className="control-select"><span>Pattern</span><select aria-label="Array pattern" value={controls.pattern} onChange={e => controls.onPattern(e.target.value as SortingPattern)}>{['random','few-unique'].map(x => <option key={x} value={x}>{x}</option>)}</select></label>
        <button className="button generate" onClick={() => controls.onGenerate()}><Shuffle size={16}/>Generate</button>
      </div>
      <form className="search-input-row" onSubmit={e => { e.preventDefault(); controls.onApply() }}><label>Values <input value={controls.valuesDraft} onChange={e => controls.onValuesDraft(e.target.value)} placeholder="Comma-separated values; leave empty for an empty array"/></label><label>Target <input type="number" step="any" value={controls.targetDraft} onChange={e => controls.onTargetDraft(e.target.value)}/></label><button className="button primary">Apply</button>{!sorted && requiresSortedInput && <button className="button" type="button" onClick={controls.onSortCopy}>Sort a copy</button>}</form>
      {(inputError || controls.error || (!sorted && requiresSortedInput)) && <p className="input-error" role="alert">{inputError ?? controls.error ?? 'This algorithm needs ascending values. Choose “Sort a copy” to continue.'}</p>}
<p className="input-hint">Generated data is ascending. Sort a copy prepares the displayed array; its indices refer to that copy. Preparation is excluded from search counts.</p></>
}
