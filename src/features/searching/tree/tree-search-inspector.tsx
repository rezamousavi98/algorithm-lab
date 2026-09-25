import type { TreeSearchAlgorithmDefinition, TreeSearchVisualizationState } from '@/domain/algorithms/searching/tree'
import { InspectorTabs } from '@/features/workspace/inspector-tabs'
import { ComplexityView, PseudocodeView, VariablesPanel } from '@/features/workspace/learning-content'

function operation(state: TreeSearchVisualizationState): string {
  if (state.result.status === 'found') return `Found ${state.result.key} at node ${state.result.nodeId}.`
  if (state.result.status === 'not-found') return `Target ${state.target} is not in the searched tree.`
  if (state.activeNodeId) return `Inspect node ${state.activeNodeId} at depth ${state.activeDepth}.`
  return 'Start playback to follow the selected traversal.'
}
export function TreeSearchInspector({ algorithm, state }: { algorithm: TreeSearchAlgorithmDefinition; state: TreeSearchVisualizationState }) {
  return <InspectorTabs name={algorithm.name}>{tab => <>
    {tab === 'overview' && <>
      <h2>How It Works</h2><p>{algorithm.description}</p>
      <div className="operation-explanation" aria-live="polite"><span className="operation-label">Current operation</span><p>{operation(state)}</p></div>
      {state.frontierMode && <div className="inspector-subsection"><h3>{state.frontierMode === 'queue' ? 'Queue · front to back' : 'Stack · top to bottom'}</h3>{state.frontier.length ? <ol className="tree-frontier">{(state.frontierMode === 'stack' ? [...state.frontier].reverse() : state.frontier).map((item, index) => <li key={`${item.nodeId}-${index}`}>key {state.tree.nodeById[item.nodeId]?.key} · depth {item.depth}</li>)}</ol> : <p className="muted-note">Frontier is empty.</p>}</div>}
      <VariablesPanel variables={state.variables}/>
      <div className="inspector-subsection"><h3>Traversal metrics</h3><p className="muted-note">Algorithm space describes the stack or queue only. The displayed path and playback history use additional UI memory.</p><dl className="hash-metrics"><div><dt>Visits</dt><dd>{state.metrics.visits}</dd></div><div><dt>Comparisons</dt><dd>{state.metrics.comparisons}</dd></div><div><dt>Frontier peak</dt><dd>{state.metrics.frontierPeak}</dd></div></dl></div>
      <div className="inspector-subsection"><h3>Use Cases</h3><ul className="use-cases">{algorithm.useCases.map(item => <li key={item}>{item}</li>)}</ul></div>
      <p className="muted-note">Duplicate keys return the first node in this algorithm’s traversal order.</p>
    </>}
    {tab === 'pseudocode' && <PseudocodeView algorithm={algorithm} lineId={state.currentPseudocodeLineId}/>}
    {tab === 'complexity' && <><ComplexityView algorithm={algorithm}/><p className="muted-note">n is the node count, h the tree height and w the maximum level width. History and displayed paths are excluded from algorithm-space complexity.</p></>}
  </>}</InspectorTabs>
}
