import type { SortingVisualizationState } from '@/domain/algorithms/types'
import type { PlaybackState } from '@/domain/playback/types'
import { SortingVisualizer } from './sorting-visualizer'
import { CompletionBanner } from './completion-banner'
import { ExecutionTimeline, MetricsStrip } from './execution-timeline'

type ExecutionSurfaceProps = Readonly<{
  simulation: SortingVisualizationState
  state: PlaybackState
  totalSteps: number
  executionError: string | null
  onSeek: (step: number) => void
  onReplay: () => void
  onGenerate: () => void
}>

export function ExecutionSurface({ simulation, state, totalSteps, executionError, onSeek, onReplay, onGenerate }: ExecutionSurfaceProps) {
  if (executionError) return <div className="execution-error" role="alert">{executionError}</div>
  return <div className="visualizer-panel">
    <SortingVisualizer simulation={simulation} />
    {state.status === 'completed' && <CompletionBanner valueCount={simulation.values.length} totalSteps={totalSteps} onReplay={onReplay} onGenerate={onGenerate} />}
    <MetricsStrip metrics={simulation.metrics} elapsedMs={state.elapsedMs} />
    <ExecutionTimeline currentStep={state.currentStep} totalSteps={totalSteps} onSeek={onSeek} />
    <div className="playback-hint">Keyboard: <kbd>Space</kbd> play/pause <kbd>←</kbd> <kbd>→</kbd> step <kbd>R</kbd> restart</div>
  </div>
}
