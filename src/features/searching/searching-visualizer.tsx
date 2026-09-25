import type { SearchingVisualizationState, PlaybackStatus } from '@/domain/algorithms/types'

export function SearchVisualizer({ state, status }: { state: SearchingVisualizationState; status: PlaybackStatus }) {
  const [low, high] = state.candidateRange
  return <section className="search-visualization-content" aria-label="Search visualization">
    <div className="search-target-label">Target: <strong>{state.target}</strong><span>Step {state.metrics.steps}</span></div>
    <p className="muted-note">{low <= high ? `Candidate indices: ${low}–${high}` : 'No remaining candidates'}</p>
    {!state.values.length && <p className="muted-note">The array is empty.</p>}
    <div className="search-array" role="list" tabIndex={0} aria-label={`Array of ${state.values.length} values. Scroll horizontally to inspect every index.`}>
      {state.values.map((value, index) => {
        const active = index >= low && index <= high
        const found = state.result.status === 'found' && state.result.index === index
        const probe = state.result.status === 'pending' && active && state.activeProbe === index
        const kind = found ? 'found' : probe ? 'probe' : active ? 'candidate' : 'discarded'
        return <div className={`search-cell ${kind}`} role="listitem" aria-label={`Index ${index}, value ${value}${probe ? ', current probe' : ''}${found ? ', target found' : active ? ', candidate' : ', discarded'}`} key={`${index}-${value}`}><span>{value}</span><small>{index}</small></div>
      })}
    </div>
    <div className="search-legend"><span className="candidate">Candidate range</span><span className="probe">Current probe</span><span className="discarded">Discarded</span><span className="found">Found</span></div>
    <div className={`search-result ${state.result.status}`}>{state.result.status === 'pending' ? (status === 'playing' ? 'Searching…' : status === 'paused' ? 'Search paused' : 'Ready to search') : state.result.status === 'found' ? `Target found at index ${state.result.index}` : 'Target not found'}</div>
    <div className="search-metrics"><span>Probes <b>{state.metrics.probes}</b></span><span>Comparisons <b>{state.metrics.comparisons}</b></span><span>Steps <b>{state.metrics.steps}</b></span></div>
  </section>
}

