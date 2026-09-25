import type { AlgorithmLearningContent } from '@/domain/algorithms/types'
import type { SortingExecution } from '@/domain/simulation/sorting-execution'
import type { DatasetControlsProps } from './dataset-controls'
import { ExecutionSurface } from './execution-controls'
import { LearningInspector } from './learning-inspector'
import { WorkspaceActions } from './workspace-actions'
import { WorkspaceLayout } from '@/features/workspace/workspace-layout'
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

  return <WorkspaceLayout algorithm={algorithm} categoryLabel="Sorting Algorithms" status={playback.state.status}
    actions={<WorkspaceActions playback={playback} dataset={dataset} onSpeedChange={onSpeedChange}/>}
    inspector={<LearningInspector algorithm={algorithm} simulation={playback.simulation} status={playback.state.status}/>}>
    <ExecutionSurface simulation={playback.simulation} state={playback.state} totalSteps={playback.totalSteps}
      onSeek={playback.seek} onReplay={playback.play} executionError={executionError} onGenerate={dataset.onGenerate}/>
  </WorkspaceLayout>
}
