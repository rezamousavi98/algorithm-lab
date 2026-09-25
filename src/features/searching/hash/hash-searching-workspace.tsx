import { useMemo } from 'react'
import type { HashSearchAlgorithmDefinition, HashSearchExecution } from '@/domain/algorithms/searching/hash/types'
import { createHashSearchTimeline } from '@/domain/simulation/hash-search-timeline'
import { usePlayback } from '@/features/playback/use-playback'
import { ExecutionTimeline } from '@/features/playback/execution-timeline'
import { WorkspaceActions } from '@/features/workspace/workspace-actions'
import { WorkspaceLayout } from '@/features/workspace/workspace-layout'
import { HashSearchInputControls, type HashSearchControls } from './hash-search-input-controls'
import { HashSearchVisualizer } from './hash-search-visualizer'
import { HashSearchInspector } from './hash-search-inspector'

export type { HashSearchControls } from './hash-search-input-controls'

export function HashSearchingWorkspace({ algorithm, execution, inputError, controls, speed, onSpeedChange }: {
  algorithm: HashSearchAlgorithmDefinition
  execution: HashSearchExecution
  inputError: string | null
  controls: HashSearchControls
  speed: number
  onSpeedChange: (speed: number) => void
}) {
  const timeline = useMemo(() => createHashSearchTimeline(execution), [execution])
  const playback = usePlayback(timeline, speed)
  const state = playback.simulation
  return <WorkspaceLayout algorithm={algorithm} categoryLabel="Searching · Hash Tables" status={playback.state.status}
    actions={<WorkspaceActions playback={playback} onSpeedChange={onSpeedChange}><HashSearchInputControls controls={controls} inputError={inputError}/></WorkspaceActions>}
    inspector={<HashSearchInspector algorithm={algorithm} state={state}/> }>
    <div className="visualizer-panel">
      {inputError ? <p className="execution-error" role="alert">{inputError}</p> : <HashSearchVisualizer state={state} status={playback.state.status}/>}
      <ExecutionTimeline currentStep={playback.state.currentStep} totalSteps={playback.totalSteps} onSeek={playback.seek}/>
    </div>
  </WorkspaceLayout>
}
