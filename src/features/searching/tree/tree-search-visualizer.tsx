import type { TreeSearchVisualizationState } from '@/domain/algorithms/searching/tree'
import type { PlaybackStatus } from '@/domain/algorithms/types'
import { TreeCanvas } from './tree-canvas'

const STATUS: Record<PlaybackStatus, string> = { idle: 'Ready', playing: 'Searching', paused: 'Paused', completed: 'Complete' }
export function TreeSearchVisualizer({ state, status }: { state: TreeSearchVisualizationState; status: PlaybackStatus }) {
  const order = state.visitedNodeIds.map(id => state.tree.nodeById[id]?.key).filter((key): key is number => key !== undefined)
  const result = state.result.status === 'found' ? `Found ${state.result.key} → ${state.result.value}` : state.result.status === 'not-found' ? `Target ${state.target} not found` : `Target ${state.target}`
  return <div className="tree-search-visualization-content">
    <div className="tree-search-summary"><strong>{result}</strong><span>{STATUS[status]}</span></div>
    <TreeCanvas state={state}/>
    <div className="tree-search-legend"><span className="legend-frontier">Frontier</span><span className="legend-visited">Visited</span><span className="legend-active">Current</span><span className="legend-found">Found</span></div>
    <p className="tree-traversal-summary" aria-live="polite">Visit order: {order.length ? order.join(' → ') : '—'}{state.result.status === 'found' ? ` · path: ${state.result.path.map(id => state.tree.nodeById[id]?.key).join(' → ')}` : ''}</p>
    <div className="tree-search-metrics"><span>Visits <b>{state.metrics.visits}</b></span><span>Comparisons <b>{state.metrics.comparisons}</b></span><span>Frontier peak <b>{state.metrics.frontierPeak}</b></span><span>Steps <b>{state.metrics.steps}</b></span></div>
  </div>
}
