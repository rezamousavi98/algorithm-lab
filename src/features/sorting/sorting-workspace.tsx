import type { AlgorithmLearningContent } from '@/domain/algorithms/types'
import type { SortingExecution } from '@/domain/simulation/sorting-execution'
import type { DatasetControlsProps } from './dataset-controls'
import { ExecutionSurface } from './execution-controls'
import { LearningInspector } from './learning-inspector'
import { WorkspaceActions } from './workspace-actions'
import { AppFooter } from '@/components/app-footer'
import { useMemo } from 'react'
import { usePlayback } from '../playback/use-playback'
import { createSortingTimeline } from '@/domain/simulation/sorting-timeline'

type SortingWorkspaceProps = Readonly<{
  algorithm: AlgorithmLearningContent
  execution: SortingExecution | null
  executionError: string | null
  dataset: DatasetControlsProps
  initialSpeed: number
  onSpeedChange: (speed: number) => void
}>

export function SortingWorkspace({
  algorithm,
  execution,
  executionError,
  dataset,
  initialSpeed,
  onSpeedChange,
}: SortingWorkspaceProps) {
  const timeline = useMemo(() => createSortingTimeline(execution), [execution])
  const playback = usePlayback(timeline, initialSpeed)

  return (
    <section className="workspace-grid" aria-label={`${algorithm.name} workspace`}>
      <div className="work-main">
        <div className="algorithm-heading">
          <div className="breadcrumbs"><span>Sorting Algorithms</span><span aria-hidden="true">›</span><strong>{algorithm.name}</strong></div>
          <div className="heading-row"><h1>{algorithm.name}</h1><span className={`active-pill status-${playback.state.status}`}><i />{playback.state.status === 'playing' ? 'Running' : playback.state.status === 'completed' ? 'Complete' : playback.state.status === 'paused' ? 'Paused' : 'Ready'}</span></div>
          <p className="algorithm-description">{algorithm.description}</p>
        </div>
        <ExecutionSurface
          simulation={playback.simulation}
          state={playback.state}
          totalSteps={playback.totalSteps}
          onSeek={playback.seek}
          onReplay={playback.play}
          executionError={executionError}
          onGenerate={dataset.onGenerate}
        />
        <AppFooter />
      </div>
      <div className="workspace-aside">
        <WorkspaceActions playback={playback} dataset={dataset} onSpeedChange={onSpeedChange} />
        <LearningInspector algorithm={algorithm} simulation={playback.simulation} status={playback.state.status}/>
      </div>
    </section>
  )
}
