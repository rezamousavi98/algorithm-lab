import type { SortingPattern } from '@/domain/algorithms/sorting/input'
import type { SortingExecution } from '@/domain/simulation/sorting-execution'
import type { useSortingPlayback } from './use-sorting-playback'
import { DatasetControls } from './dataset-controls'
import { PlaybackControls } from './playback-controls'
import { SortingVisualizer } from './sorting-visualizer'

type ExecutionSurfaceProps = Readonly<{
  execution: SortingExecution; playback: ReturnType<typeof useSortingPlayback>; arraySize: number; pattern: SortingPattern
  inputMode: 'generated' | 'manual'; manualDraft: string; manualError: string | null; executionError: string | null
  onArraySizeChange: (size: number) => void; onPatternChange: (pattern: SortingPattern) => void
  onInputModeChange: (mode: 'generated' | 'manual') => void; onManualDraftChange: (draft: string) => void
  onApplyManual: () => void; onGenerate: () => void; onSpeedChange: (speed: number) => void
}>

export function ExecutionSurface({ execution, playback, arraySize, pattern, inputMode, manualDraft, manualError, executionError, onArraySizeChange, onPatternChange, onInputModeChange, onManualDraftChange, onApplyManual, onGenerate, onSpeedChange }: ExecutionSurfaceProps) {
  return <>
    <div className="control-bar"><PlaybackControls playback={playback} onSpeedChange={onSpeedChange}/></div>
    <DatasetControls arraySize={arraySize} pattern={pattern} inputMode={inputMode} manualDraft={manualDraft} manualError={manualError} onArraySizeChange={onArraySizeChange} onPatternChange={onPatternChange} onInputModeChange={onInputModeChange} onManualDraftChange={onManualDraftChange} onApplyManual={onApplyManual} onGenerate={onGenerate}/>
    {executionError ? <div className="execution-error" role="alert">{executionError}</div> : <SortingVisualizer execution={execution} playback={playback} onGenerate={onGenerate}/>}
  </>
}
