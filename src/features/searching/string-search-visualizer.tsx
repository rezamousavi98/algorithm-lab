import type { StringSearchingVisualizationState, PlaybackStatus } from '@/domain/algorithms/types'

function showCharacter(character: string): string {
  if (character === ' ') return '␠'
  if (character === '\n') return '↵'
  if (character === '\t') return '⇥'
  return character
}

export function StringSearchVisualizer({ state, status }: { state: StringSearchingVisualizationState; status: PlaybackStatus }) {
  const current = state.comparedIndices ? {
    textIndex: state.comparedIndices[0], patternIndex: state.comparedIndices[1],
    textChar: state.text[state.comparedIndices[0]], patternChar: state.pattern[state.comparedIndices[1]],
  } : null
  const hashCurrent = state.activeEvent?.type === 'stringHash' ? state.activeEvent : null
  return <section className="search-visualization-content string-visualization" aria-label="String search visualization">
    <div className="string-pattern-row"><strong>Pattern</strong><div className="string-cells" role="list" tabIndex={0} aria-label="Search pattern">{state.pattern.map((character, index) => <span className={current?.patternIndex === index ? 'current' : ''} role="listitem" aria-label={`Pattern character ${index + 1}: ${character}`} key={`${index}-${character}`}>{showCharacter(character)}</span>)}</div></div>
    <div className="string-text-label"><strong>Text</strong><span>Alignment: {state.alignmentIndex ?? '—'} · {state.text.length} Unicode code points · zero-based positions</span></div>
    <div className="string-text-row" role="list" tabIndex={0} aria-label="Text characters. Scroll horizontally to inspect every position.">
      {state.text.map((character, index) => {
        const match = state.matches.some(start => index >= start && index < start + state.pattern.length)
        const compared = current?.textIndex === index
        const window = state.alignmentIndex !== null && index >= state.alignmentIndex && index < state.alignmentIndex + state.pattern.length
        const hashWindow = hashCurrent?.index === state.alignmentIndex && window
        const kind = compared ? current.textChar === current.patternChar ? 'equal' : 'mismatch' : match ? 'matched' : hashWindow ? 'hash-window' : window ? 'window' : 'text-idle'
        return <span className={`string-cell ${kind}`} role="listitem" aria-label={`Text position ${index}: ${character}${compared ? ', being compared' : ''}${match ? ', part of a match' : ''}`} key={`${index}-${character}`}><b>{showCharacter(character)}</b><small>{index}</small></span>
      })}
    </div>
    <div className="search-legend string-legend"><span className="string-window-key">Current alignment</span><span className="probe">Character comparison</span><span className="found">Matched range</span></div>
    <div className={`search-result ${state.result.status === 'pending' ? 'pending' : state.matches.length ? 'found' : 'not-found'}`} aria-live="polite">
      {state.result.status === 'pending' ? (status === 'playing' ? 'Searching…' : status === 'paused' ? 'Search paused' : 'Ready to search') : state.matches.length ? `Found ${state.matches.length} ${state.matches.length === 1 ? 'match' : 'matches'} at ${state.matches.join(', ')}` : 'No matches found'}
    </div>
    <div className="search-metrics"><span>Scan comparisons <b>{state.metrics.characterComparisons}</b></span><span>Alignments <b>{state.metrics.alignments}</b></span><span>Hash checks <b>{state.metrics.hashChecks}</b></span></div>
  </section>
}
