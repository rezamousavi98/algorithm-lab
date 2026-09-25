import type { AlgorithmLearningContent, PlaybackStatus, SortingVisualizationState } from '@/domain/algorithms/types'
import { ComplexityPanel, OverviewPanel, PseudocodePanel } from './learning-panels'
import { InspectorTabs } from '@/features/workspace/inspector-tabs'

export function LearningInspector({ algorithm, simulation, status }: Readonly<{ algorithm: AlgorithmLearningContent; simulation: SortingVisualizationState; status: PlaybackStatus }>) {
  return <InspectorTabs name={algorithm.name}>{tab => <>
    {tab === 'overview' && <OverviewPanel algorithm={algorithm} simulation={simulation} completed={status === 'completed'}/>}
    {tab === 'pseudocode' && <PseudocodePanel algorithm={algorithm} simulation={simulation}/>}
    {tab === 'complexity' && <ComplexityPanel algorithm={algorithm}/>}
  </>}</InspectorTabs>
}
