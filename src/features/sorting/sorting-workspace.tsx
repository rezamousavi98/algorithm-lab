import type { AlgorithmDefinition, AlgorithmEvent, SortingInput } from '@/domain/algorithms/types'
import type { SortingExecution } from '@/domain/simulation/sorting-execution'
import type { ManualInputResult, SortingPattern } from '@/domain/algorithms/sorting/input'
import { ExecutionSurface } from './execution-controls'
import { LearningInspector } from './learning-inspector'
import { useSortingPlayback } from './use-sorting-playback'

type SortingWorkspaceProps = Readonly<{
  algorithm: AlgorithmDefinition<SortingInput, AlgorithmEvent>
  execution: SortingExecution
  executionError: string | null
  arraySize: number
  pattern: SortingPattern
  inputMode: 'generated' | 'manual'
  manualDraft: string
  manualError: string | null
  initialSpeed: number
  onArraySizeChange: (size: number) => void
  onPatternChange: (pattern: SortingPattern) => void
  onInputModeChange: (mode: 'generated' | 'manual') => void
  onManualDraftChange: (draft: string) => void
  onApplyManual: () => ManualInputResult
  onGenerate: () => void
  onSpeedChange: (speed: number) => void
}>

export function SortingWorkspace({
  algorithm,
  execution,
  executionError,
  arraySize,
  pattern,
  inputMode,
  manualDraft,
  manualError,
  initialSpeed,
  onArraySizeChange,
  onPatternChange,
  onInputModeChange,
  onManualDraftChange,
  onApplyManual,
  onGenerate,
  onSpeedChange,
}: SortingWorkspaceProps) {
  const playback = useSortingPlayback(execution, initialSpeed)

  return (
    <section className="workspace-grid" aria-label={`${algorithm.name} workspace`}>
      <div className="work-main">
        <div className="algorithm-heading">
          <div className="breadcrumbs"><span>Sorting Algorithms</span><span aria-hidden="true">›</span><strong>{algorithm.name}</strong></div>
          <div className="heading-row"><h1>{algorithm.name}</h1><span className={`active-pill status-${playback.state.status}`}><i />{playback.state.status === 'playing' ? 'Running' : playback.state.status === 'completed' ? 'Complete' : playback.state.status === 'paused' ? 'Paused' : 'Ready'}</span></div>
          <p className="algorithm-description">{algorithm.description}</p>
        </div>
        <ExecutionSurface
          execution={execution}
          playback={playback}
          arraySize={arraySize}
          pattern={pattern}
          inputMode={inputMode}
          manualDraft={manualDraft}
          manualError={manualError}
          executionError={executionError}
          onArraySizeChange={onArraySizeChange}
          onPatternChange={onPatternChange}
          onInputModeChange={onInputModeChange}
          onManualDraftChange={onManualDraftChange}
          onApplyManual={onApplyManual}
          onGenerate={onGenerate}
          onSpeedChange={onSpeedChange}
        />
      </div>
      <LearningInspector algorithm={algorithm} simulation={playback.simulation} status={playback.state.status} />
    </section>
  )
}
