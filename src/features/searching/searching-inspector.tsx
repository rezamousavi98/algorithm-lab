import type { SearchingAlgorithmDefinition, SearchingAlgorithmEvent, SearchingVisualizationState } from '@/domain/algorithms/types'
import { InspectorTabs } from '@/features/workspace/inspector-tabs'
import { ComplexityView, PseudocodeView, VariablesPanel } from '@/features/workspace/learning-content'

function describeOperation(state: SearchingVisualizationState): string {
  if (state.result.status === 'found') return `Target ${state.target} found at index ${state.result.index}.`
  if (state.result.status === 'not-found') return `The array does not contain ${state.target}.`
  if (state.activeProbe !== null) return `Inspect index ${state.activeProbe}: compare ${state.values[state.activeProbe]} with target ${state.target}.`
  return 'Start the visualization to follow each operation.'
}

export function SearchInspector({ algorithm, state }: { algorithm: SearchingAlgorithmDefinition<SearchingAlgorithmEvent>; state: SearchingVisualizationState }) {
  return <InspectorTabs name={algorithm.name}>{tab => <>
    {tab === 'overview' && <>
      <h2>How It Works</h2><p>{algorithm.description}</p>
      <div className="operation-explanation" aria-live="polite"><span className="operation-label">Current operation</span><p>{describeOperation(state)}</p></div>
      <VariablesPanel variables={state.variables}/>
      <div className="inspector-subsection"><h3>Search properties</h3><p className="muted-note">{algorithm.requiresSortedInput ? 'Requires ascending input.' : 'Works with any input order.'} Returns any matching index when duplicates exist.</p></div>
      <div className="inspector-subsection"><h3>Use Cases</h3><ul className="use-cases">{algorithm.useCases.map(item => <li key={item}>{item}</li>)}</ul></div>
    </>}
    {tab === 'pseudocode' && <PseudocodeView algorithm={algorithm} lineId={state.currentPseudocodeLineId}/>}
    {tab === 'complexity' && <ComplexityView algorithm={algorithm}/>}
  </>}</InspectorTabs>
}
