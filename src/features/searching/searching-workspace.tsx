import { useMemo } from 'react'
import type { SearchingAlgorithmDefinition, SearchingAlgorithmEvent } from '@/domain/algorithms/types'
import type { SearchingExecution } from '@/domain/simulation/searching-execution'
import { createSearchingTimeline } from '@/domain/simulation/searching-timeline'
import { usePlayback } from '@/features/playback/use-playback'
import { ExecutionTimeline } from '@/features/playback/execution-timeline'
import { WorkspaceLayout } from '@/features/workspace/workspace-layout'
import { WorkspaceActions } from '@/features/workspace/workspace-actions'
import { SearchingInputControls, type SearchingControls } from './searching-input-controls'
import { SearchVisualizer } from './searching-visualizer'
import { SearchInspector } from './searching-inspector'
export type { SearchingControls } from './searching-input-controls'

type Props = Readonly<{ algorithm: SearchingAlgorithmDefinition<SearchingAlgorithmEvent>; execution: SearchingExecution; inputError: string | null; controls: SearchingControls; initialSpeed: number; onSpeedChange: (speed: number) => void }>

export function SearchingWorkspace({ algorithm, execution, inputError, controls, initialSpeed, onSpeedChange }: Props) {
  const timeline = useMemo(() => createSearchingTimeline(execution), [execution])
  const playback = usePlayback(timeline, initialSpeed)
  const state = playback.simulation
  const sorted = state.values.every((value, index, values) => index === 0 || values[index - 1] <= value)
  return <WorkspaceLayout algorithm={algorithm} categoryLabel="Searching · Arrays" status={playback.state.status}
    actions={<WorkspaceActions playback={playback} onSpeedChange={onSpeedChange}>
      <SearchingInputControls controls={controls} valueCount={state.values.length} sorted={sorted} requiresSortedInput={algorithm.requiresSortedInput} inputError={inputError}/>
    </WorkspaceActions>}
    inspector={<SearchInspector algorithm={algorithm} state={state}/>}>
    <div className="visualizer-panel">
      {inputError ? <p className="execution-error" role="alert">{inputError}</p> : <SearchVisualizer state={state} status={playback.state.status}/>}
      <ExecutionTimeline currentStep={playback.state.currentStep} totalSteps={playback.totalSteps} onSeek={playback.seek}/>
    </div>
  </WorkspaceLayout>
}
