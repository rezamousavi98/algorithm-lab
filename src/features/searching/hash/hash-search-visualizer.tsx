import type { HashSearchVisualizationState } from '@/domain/algorithms/searching/hash/types'
import type { PlaybackStatus } from '@/domain/algorithms/types'

const STATUS_TEXT: Record<PlaybackStatus, string> = {
  idle: 'Ready', playing: 'Searching', paused: 'Paused', completed: 'Complete',
}

export function HashSearchVisualizer({ state, status }: { state: HashSearchVisualizationState; status: PlaybackStatus }) {
  const activeBucket = state.activeLocation?.kind === 'bucket' ? state.activeLocation.index : null
  const activeSlot = state.activeLocation?.kind === 'slot' ? state.activeLocation.index : null
  const foundId = state.result.status === 'found' ? state.result.entryId : null
  const visited = (index: number) => state.visitedLocations.some(location => location.index === index)
  return <div className="hash-search-visualization-content">
    <div className="hash-search-summary"><strong>Search key: {state.key}</strong><span>{STATUS_TEXT[status]}</span></div>
    <p className="hash-search-hint">Home {state.table.strategy === 'separate-chaining' ? 'bucket' : 'slot'}: {state.homeIndex ?? '—'}{state.table.strategy === 'double-hashing' && state.stepSize !== null ? ` · step ${state.stepSize}` : ''} · {state.table.size} entries · capacity {state.table.capacity} · load factor {(state.table.size / state.table.capacity).toFixed(2)}</p>
    {state.table.strategy === 'separate-chaining' ? <div className="hash-bucket-grid" role="list" aria-label="Hash table buckets">
      {state.table.buckets.map((bucket, bucketIndex) => <section className={`hash-bucket ${activeBucket === bucketIndex ? 'active' : ''} ${visited(bucketIndex) ? 'visited' : ''}`} role="listitem" key={bucketIndex} aria-label={`Bucket ${bucketIndex}${bucket.entries.length ? `, ${bucket.entries.length} entries` : ', empty'}`}>
        <header><span>Bucket</span><b>{bucketIndex}</b></header>
        <div className="hash-chain">
          {bucket.entries.length === 0 ? <span className="hash-empty">Empty</span> : bucket.entries.map((entry, chainIndex) => {
            const comparing = activeBucket === bucketIndex && state.activeChainIndex === chainIndex && state.activeCompared
            const current = activeBucket === bucketIndex && state.activeChainIndex === chainIndex && !state.activeCompared
            const found = foundId === entry.id
            return <div className={`hash-entry ${comparing ? 'comparing' : ''} ${current ? 'current' : ''} ${found ? 'found' : ''}`} key={entry.id} aria-label={`Key ${entry.key}, value ${entry.value}${found ? ', found' : ''}`}>
              <span><small>key</small><b>{entry.key}</b></span><span><small>value</small><b>{entry.value}</b></span>
              {chainIndex < bucket.entries.length - 1 && <i aria-hidden="true">→</i>}
            </div>
          })}
        </div>
      </section>)}
    </div> : <div className="hash-slot-grid" role="list" aria-label="Open-addressed hash table slots">
      {state.table.slots.map((slot, index, slots) => {
        const active = activeSlot === index
        const found = slot.state === 'occupied' && foundId === slot.entry.id
        const clusterStart = slot.state !== 'empty' && slots[(index - 1 + slots.length) % slots.length].state === 'empty'
        const clusterEnd = slot.state !== 'empty' && slots[(index + 1) % slots.length].state === 'empty'
        return <div key={index} role="listitem" className={`hash-slot ${slot.state} ${visited(index) ? 'visited' : ''} ${active ? 'active' : ''} ${active && state.activeCompared ? 'comparing' : ''} ${found ? 'found' : ''} ${clusterStart ? 'cluster-start' : ''} ${clusterEnd ? 'cluster-end' : ''}`} aria-label={`Slot ${index}: ${slot.state === 'occupied' ? `key ${slot.entry.key}, value ${slot.entry.value}` : slot.state}${clusterStart ? ', cluster start' : ''}${clusterEnd ? ', cluster end' : ''}`}>
          <header><span>Slot</span><b>{index}</b></header>
          {slot.state === 'occupied' ? <><span><small>key</small><strong>{slot.entry.key}</strong></span><span><small>value</small><strong>{slot.entry.value}</strong></span></>
            : <em>{slot.state === 'deleted' ? 'Deleted' : 'Empty'}</em>}
        </div>
      })}
    </div>}
    {state.table.strategy !== 'separate-chaining' && <div className="hash-probe-trail" aria-label="Visited slot order">Probe trail{state.table.strategy === 'double-hashing' && state.stepSize !== null ? ` (step ${state.stepSize})` : ''}: {state.visitedLocations.map(location => location.index).join(' → ') || '—'}</div>}
    <div className="hash-search-legend" aria-label="Hash table legend"><span><i className="legend-active"/>Current bucket or slot</span><span><i className="legend-visited"/>Visited</span>{state.table.strategy !== 'separate-chaining' && <span><i className="legend-deleted"/>Deleted slot</span>}<span><i className="legend-found"/>Found</span></div>
    <div className="hash-search-result" aria-live="polite">
      <strong>{state.result.status === 'found' ? `Found ${state.result.key} → ${state.result.value}` : state.result.status === 'not-found' ? `Key ${state.key} not found` : 'Search ready'}</strong>
      <span>Probes {state.metrics.probes} · Comparisons {state.metrics.comparisons} · Steps {state.metrics.steps}</span>
    </div>
  </div>
}
