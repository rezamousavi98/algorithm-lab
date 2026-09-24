import type { SortingPattern } from '@/domain/algorithms/sorting/input'
import type { useSortingPlayback } from './use-sorting-playback'
import { DatasetControls } from './dataset-controls'
import { PlaybackControls } from './playback-controls'

type WorkspaceActionsProps = Readonly<{
  playback: ReturnType<typeof useSortingPlayback>; arraySize: number; pattern: SortingPattern
  inputMode: 'generated' | 'manual'; manualDraft: string; manualError: string | null
  onArraySizeChange: (size: number) => void; onPatternChange: (pattern: SortingPattern) => void
  onInputModeChange: (mode: 'generated' | 'manual') => void; onManualDraftChange: (draft: string) => void
  onApplyManual: () => void; onGenerate: () => void; onSpeedChange: (speed: number) => void
}>

export function WorkspaceActions({ playback, arraySize, pattern, inputMode, manualDraft, manualError, onArraySizeChange, onPatternChange, onInputModeChange, onManualDraftChange, onApplyManual, onGenerate, onSpeedChange }: WorkspaceActionsProps) {
  return <section className="workspace-actions" aria-label="Visualization controls">
    <div className="compact-playback"><PlaybackControls compact playback={playback} onSpeedChange={onSpeedChange}/></div>
    <DatasetControls arraySize={arraySize} pattern={pattern} inputMode={inputMode} manualDraft={manualDraft} manualError={manualError} onArraySizeChange={onArraySizeChange} onPatternChange={onPatternChange} onInputModeChange={onInputModeChange} onManualDraftChange={onManualDraftChange} onApplyManual={onApplyManual} onGenerate={onGenerate}/>
  </section>
}
