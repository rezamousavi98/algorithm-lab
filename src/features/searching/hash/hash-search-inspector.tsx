import type { HashSearchAlgorithmDefinition, HashSearchVisualizationState } from '@/domain/algorithms/searching/hash/types'
import { InspectorTabs } from '@/features/workspace/inspector-tabs'
import { ComplexityView, PseudocodeView, VariablesPanel } from '@/features/workspace/learning-content'

function describeOperation(state: HashSearchVisualizationState): string {
  const locationName = state.table.strategy === 'separate-chaining' ? 'bucket' : 'slot'
  if (state.result.status === 'found') return `Key ${state.result.key} maps to value ${state.result.value} in ${locationName} ${state.result.location.index}.`
  if (state.result.status === 'not-found') return `The search path ended without key ${state.key}.`
  if (state.activeEntryId && state.activeCompared) return `Compare the current key with ${state.activeEntryId}.`
  if (state.activeLocation) return `Inspect ${locationName} ${state.activeLocation.index} for key ${state.key}.`
  return 'Build the table, then follow the selected collision strategy.'
}

function strategyName(strategy: HashSearchAlgorithmDefinition['strategy']): string {
  return strategy === 'separate-chaining' ? 'Separate Chaining'
    : strategy === 'linear-probing' ? 'Linear Probing' : 'Double Hashing'
}

export function HashSearchInspector({ algorithm, state }: { algorithm: HashSearchAlgorithmDefinition; state: HashSearchVisualizationState }) {
  return <InspectorTabs name={algorithm.name}>{tab => <>
    {tab === 'overview' && <>
      <h2>How It Works</h2><p>{algorithm.description}</p>
      <div className="operation-explanation" aria-live="polite"><span className="operation-label">Current operation</span><p>{describeOperation(state)}</p></div>
      <div className="inspector-subsection"><h3>Lookup metrics</h3><p className="muted-note">Table construction happens before playback and is excluded from lookup metrics. Probes count bucket or slot visits; comparisons count inspected entry keys. Deleted slots do not compare keys.</p>
        <dl className="hash-metrics"><div><dt>Probes</dt><dd>{state.metrics.probes}</dd></div><div><dt>Key comparisons</dt><dd>{state.metrics.comparisons}</dd></div><div><dt>Steps</dt><dd>{state.metrics.steps}</dd></div></dl>
      </div>
      <VariablesPanel variables={state.variables}/>
      <div className="inspector-subsection"><h3>Search properties</h3><p className="muted-note">{strategyName(algorithm.strategy)} · safe-integer keys · duplicate keys update values · home index uses normalized modulo. This educational hash can cluster structured keys.</p></div>
      <div className="inspector-subsection"><h3>Use Cases</h3><ul className="use-cases">{algorithm.useCases.map(item => <li key={item}>{item}</li>)}</ul></div>
    </>}
    {tab === 'pseudocode' && <PseudocodeView algorithm={algorithm} lineId={state.currentPseudocodeLineId}/>}
    {tab === 'complexity' && <ComplexityView algorithm={algorithm}/>}
  </>}</InspectorTabs>
}
