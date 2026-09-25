import type { StringSearchingAlgorithmDefinition, StringSearchingVisualizationState } from '@/domain/algorithms/types'
import { InspectorTabs } from '@/features/workspace/inspector-tabs'
import { ComplexityView, PseudocodeView, VariablesPanel } from '@/features/workspace/learning-content'

function describeOperation(state: StringSearchingVisualizationState): string {
  if (state.result.status === 'completed') return `Search complete: ${state.matches.length} matches.`
  const event = state.activeEvent
  if (event?.type === 'stringCompare') return `Compare text[${event.textIndex}] (${event.textChar}) with pattern[${event.patternIndex}] (${event.patternChar}).`
  if (event?.type === 'stringHash') return `Window hash ${event.windowHash}; pattern hash ${event.patternHash}. Equal hashes require character verification.`
  if (state.alignmentIndex !== null) return `Pattern aligned at text position ${state.alignmentIndex}.`
  return 'Start the visualization to follow each operation.'
}

export function StringSearchInspector({ algorithm, state }: { algorithm: StringSearchingAlgorithmDefinition; state: StringSearchingVisualizationState }) {
  return <InspectorTabs name={algorithm.name}>{tab => <>
    {tab === 'overview' && <>
      <h2>How It Works</h2><p>{algorithm.description}</p>
      <div className="operation-explanation" aria-live="polite"><span className="operation-label">Current operation</span><p>{describeOperation(state)}</p></div>
      <VariablesPanel variables={state.variables}/>
      <div className="inspector-subsection"><h3>Use Cases</h3><ul className="use-cases">{algorithm.useCases.map(item => <li key={item}>{item}</li>)}</ul></div>
      <p className="muted-note">Matching is case-sensitive and uses Unicode code points, without normalization. All overlapping matches are reported. Scan comparisons exclude preprocessing.</p>
    </>}
    {tab === 'pseudocode' && <PseudocodeView algorithm={algorithm} lineId={state.currentPseudocodeLineId}/>}
    {tab === 'complexity' && <><ComplexityView algorithm={algorithm}/><p className="muted-note">n is text length, m is pattern length, and k is the number of distinct pattern characters. Algorithm space excludes the shared Unicode input representation and visualization history.</p></>}
  </>}</InspectorTabs>
}
