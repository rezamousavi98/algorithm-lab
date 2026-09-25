import { useMemo } from 'react'
import type { TreeSearchAlgorithmDefinition, TreeSearchExecution } from '@/domain/algorithms/searching/tree'
import { createTreeSearchTimeline } from '@/domain/simulation/tree-search-timeline'
import { usePlayback } from '@/features/playback/use-playback'
import { ExecutionTimeline } from '@/features/playback/execution-timeline'
import { WorkspaceActions } from '@/features/workspace/workspace-actions'
import { WorkspaceLayout } from '@/features/workspace/workspace-layout'
import { TreeSearchInputControls, type TreeSearchControls } from './tree-search-input-controls'
import { TreeSearchVisualizer } from './tree-search-visualizer'
import { TreeSearchInspector } from './tree-search-inspector'

export function TreeSearchWorkspace({ algorithm, execution, inputError, controls, speed, onSpeedChange }: {
  algorithm: TreeSearchAlgorithmDefinition; execution: TreeSearchExecution; inputError: string | null
  controls: TreeSearchControls; speed: number; onSpeedChange: (speed: number) => void
}) {
  const timeline = useMemo(() => createTreeSearchTimeline(execution), [execution])
  const playback = usePlayback(timeline, speed)
  const state = playback.simulation
  return <WorkspaceLayout algorithm={algorithm} categoryLabel="Searching · Trees" status={playback.state.status}
    actions={<WorkspaceActions playback={playback} onSpeedChange={onSpeedChange}><TreeSearchInputControls controls={controls} inputError={inputError}/></WorkspaceActions>}
    inspector={<TreeSearchInspector algorithm={algorithm} state={state}/> }>
    <div className="visualizer-panel">
      {inputError && <p className="execution-error" role="alert">{inputError}</p>}
      <TreeSearchVisualizer state={state} status={playback.state.status}/>
      <ExecutionTimeline currentStep={playback.state.currentStep} totalSteps={playback.totalSteps} onSeek={playback.seek}/>
    </div>
  </WorkspaceLayout>
}
