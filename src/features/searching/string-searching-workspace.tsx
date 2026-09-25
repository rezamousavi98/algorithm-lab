import { useMemo } from 'react'
import type { StringSearchingAlgorithmDefinition } from '@/domain/algorithms/types'
import { createStringSearchingTimeline } from '@/domain/simulation/string-searching-timeline'
import type { StringSearchingExecution } from '@/domain/simulation/string-searching-execution'
import { usePlayback } from '@/features/playback/use-playback'
import { WorkspaceActions } from '@/features/workspace/workspace-actions'
import { StringInputControls, type StringSearchControls } from './string-input-controls'
import { ExecutionTimeline } from '@/features/playback/execution-timeline'
import { WorkspaceLayout } from '@/features/workspace/workspace-layout'
import { StringSearchVisualizer } from './string-search-visualizer'
import { StringSearchInspector } from './string-search-inspector'


type StringSearchingWorkspaceProps = Readonly<{
  algorithm: StringSearchingAlgorithmDefinition
  execution: StringSearchingExecution
  inputError: string | null
  controls: StringSearchControls
  speed: number
  onSpeedChange: (speed: number) => void
}>

export function StringSearchingWorkspace({ algorithm, execution, inputError, controls, speed, onSpeedChange }: StringSearchingWorkspaceProps) {
  const timeline = useMemo(() => createStringSearchingTimeline(execution), [execution])
  const playback = usePlayback(timeline, speed)
  const state = playback.simulation
  return <WorkspaceLayout algorithm={algorithm} categoryLabel="Searching · Strings" status={playback.state.status}
    actions={<WorkspaceActions playback={playback} onSpeedChange={onSpeedChange}><StringInputControls controls={controls} inputError={inputError}/></WorkspaceActions>}
    inspector={<StringSearchInspector algorithm={algorithm} state={state}/>}>
    <div className="visualizer-panel">
      {inputError ? <p className="execution-error" role="alert">{inputError}</p> : <StringSearchVisualizer state={state} status={playback.state.status}/>}
      <ExecutionTimeline currentStep={playback.state.currentStep} totalSteps={playback.totalSteps} onSeek={playback.seek}/>
    </div>
  </WorkspaceLayout>
}
