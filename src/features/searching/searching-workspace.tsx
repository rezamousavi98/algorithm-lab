import { useMemo, useState, type KeyboardEvent } from 'react'
import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight, SkipForward, Shuffle } from 'lucide-react'
import type { SearchingAlgorithmDefinition, SearchingAlgorithmEvent, SearchingVisualizationState } from '@/domain/algorithms/types'
import type { SearchingExecution } from '@/domain/simulation/searching-execution'
import { createSearchingTimeline } from '@/domain/simulation/searching-timeline'
import { usePlayback } from '@/features/playback/use-playback'
import { ARRAY_SIZE_OPTIONS } from '@/domain/preferences/user-preferences'
import type { SortingPattern } from '@/domain/algorithms/sorting/input'
import { AppFooter } from '@/components/app-footer'

export type SearchingControls = Readonly<{
  valuesDraft: string; targetDraft: string; error: string | null; pattern: SortingPattern
  onValuesDraft: (value: string) => void; onTargetDraft: (value: string) => void; onApply: () => void
  onSortCopy: () => void; onGenerate: (size?: number, pattern?: SortingPattern) => void
  onPattern: (pattern: SortingPattern) => void
}>
type Props = Readonly<{ algorithm: SearchingAlgorithmDefinition<SearchingAlgorithmEvent>; execution: SearchingExecution; inputError: string | null; controls: SearchingControls; initialSpeed: number; onSpeedChange: (speed: number) => void }>

function SearchVisualizer({ state }: { state: SearchingVisualizationState }) {
  const [low, high] = state.candidateRange
  return <section className="visualization-panel search-visualization" aria-label="Search visualization">
    <div className="search-target-label">Target: <strong>{state.target}</strong><span>Step {state.metrics.steps}</span></div>
    <div className="search-array" role="list" tabIndex={0} aria-label={`Array of ${state.values.length} values. Scroll horizontally to inspect every index.`}>
      {state.values.map((value, index) => {
        const active = index >= low && index <= high
        const found = state.result.status === 'found' && state.result.index === index
        const probe = state.activeProbe === index
        const kind = found ? 'found' : probe ? 'probe' : active ? 'candidate' : 'discarded'
        return <div className={`search-cell ${kind}`} role="listitem" aria-label={`Index ${index}, value ${value}${probe ? ', current probe' : ''}${active ? ', candidate' : ', discarded'}${found ? ', target found' : ''}`} key={`${index}-${value}`}><span>{value}</span><small>{index}</small></div>
      })}
    </div>
    <div className="search-legend"><span className="candidate">Candidate range</span><span className="probe">Current probe</span><span className="discarded">Discarded</span><span className="found">Found</span></div>
    <div className={`search-result ${state.result.status}`}>{state.result.status === 'pending' ? 'Searching…' : state.result.status === 'found' ? `Target found at index ${state.result.index}` : 'Target not found'}</div>
    <div className="search-metrics"><span>Probes <b>{state.metrics.probes}</b></span><span>Comparisons <b>{state.metrics.comparisons}</b></span><span>Steps <b>{state.metrics.steps}</b></span></div>
  </section>
}

function SearchInspector({ algorithm, state }: { algorithm: Props['algorithm']; state: SearchingVisualizationState }) {
  const [tab, setTab] = useState<'overview' | 'pseudocode' | 'complexity'>('overview')
  const tabs = ['overview', 'pseudocode', 'complexity'] as const
  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const offset = event.key === 'ArrowRight' ? 1 : -1
    const nextTab = tabs[(tabs.indexOf(tab) + offset + tabs.length) % tabs.length]
    setTab(nextTab)
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-tab="${nextTab}"]`)?.focus()
  }
  return <aside className="inspector">
    <div className="inspector-tabs" role="tablist" aria-label={`${algorithm.name} learning panels`} onKeyDown={onTabKeyDown}>{tabs.map(item => <button key={item} id={`search-inspector-tab-${item}`} data-tab={item} type="button" role="tab" aria-selected={tab === item} aria-controls="search-inspector-panel" tabIndex={tab === item ? 0 : -1} className={tab === item ? 'selected' : ''} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
    <div className="inspector-content" id="search-inspector-panel" role="tabpanel" aria-labelledby={`search-inspector-tab-${tab}`}>
      {tab === 'overview' && <><h2>How It Works</h2><p>{algorithm.description}</p><ol>{algorithm.useCases.map(item => <li key={item}>{item}</li>)}</ol><h2>Search properties</h2><p>{algorithm.requiresSortedInput ? 'Requires ascending input.' : 'Works with any input order.'} Returns any matching index when duplicates exist.</p><div className="search-metrics"><span>Probes <b>{state.metrics.probes}</b></span><span>Comparisons <b>{state.metrics.comparisons}</b></span></div></>}
      {tab === 'complexity' && <><h2>Complexity</h2>{Object.entries(algorithm.complexity).map(([label, value]) => <p className="complexity-row" key={label}><span>{label}</span><strong>{value}</strong></p>)}</>}
      {tab === 'pseudocode' && <><h2>Pseudocode</h2><ol className="search-pseudocode">{algorithm.pseudocode.map((line, index) => <li className={state.currentPseudocodeLineId === line.id ? 'active' : ''} key={line.id}><span>{index + 1}</span><code>{line.code}</code></li>)}</ol></>}
    </div>
  </aside>
}

export function SearchingWorkspace({ algorithm, execution, inputError, controls, initialSpeed, onSpeedChange }: Props) {
  const timeline = useMemo(() => createSearchingTimeline(execution), [execution])
  const playback = usePlayback(timeline, initialSpeed)
  const state = playback.simulation
  const sorted = state.values.every((v, i, a) => i === 0 || a[i - 1] <= v)
  return <section className="workspace-grid" aria-label={`${algorithm.name} workspace`}>
    <div className="work-main">
      <div className="algorithm-heading"><div className="breadcrumbs"><span>Searching Algorithms</span><span aria-hidden="true">›</span><strong>{algorithm.name}</strong></div><div className="heading-row"><h1>{algorithm.name}</h1><span className={`active-pill status-${playback.state.status}`}><i />{playback.state.status === 'playing' ? 'Running' : playback.state.status === 'completed' ? 'Complete' : playback.state.status === 'paused' ? 'Paused' : 'Ready'}</span></div><p className="algorithm-description">{algorithm.description}</p></div>
      <div className="search-controls">
        <div className="search-transport"><button className="button primary" onClick={playback.state.status === 'playing' ? playback.pause : playback.play}>{playback.state.status === 'playing' ? <Pause/> : <Play/>}{playback.state.status === 'playing' ? 'Pause' : 'Play'}</button><button className="button" aria-label="Reset" onClick={playback.reset}><RotateCcw/></button><button className="button" aria-label="Step backward" onClick={playback.stepBackward}><ChevronLeft/></button><button className="button" aria-label="Step forward" onClick={playback.stepForward}><ChevronRight/></button><button className="button" aria-label="Jump to end" onClick={playback.jumpToEnd}><SkipForward/></button></div>
        <label className="control-select"><span>Speed</span><select aria-label="Playback speed" value={playback.state.speed} onChange={e => { playback.setSpeed(Number(e.target.value)); onSpeedChange(Number(e.target.value)) }}>{[0.25, 0.5, 1, 2, 4].map(x => <option key={x} value={x}>{x}×</option>)}</select></label>
        <label className="control-select"><span>Array size</span><select aria-label="Array size" value={state.values.length || 5} onChange={e => controls.onGenerate(Number(e.target.value), controls.pattern)}>{ARRAY_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}</select></label>
        <label className="control-select"><span>Pattern</span><select aria-label="Array pattern" value={controls.pattern} onChange={e => controls.onPattern(e.target.value as SortingPattern)}>{['random','nearly-sorted','reversed','few-unique'].map(x => <option key={x} value={x}>{x}</option>)}</select></label>
        <button className="button generate" onClick={() => controls.onGenerate()}><Shuffle size={16}/>Generate</button>
      </div>
      <form className="search-input-row" onSubmit={e => { e.preventDefault(); controls.onApply() }}><label>Values <input value={controls.valuesDraft} onChange={e => controls.onValuesDraft(e.target.value)} placeholder="Comma-separated values; leave empty for an empty array"/></label><label>Target <input type="number" step="any" value={controls.targetDraft} onChange={e => controls.onTargetDraft(e.target.value)}/></label><button className="button primary">Apply</button>{!sorted && algorithm.requiresSortedInput && <button className="button" type="button" onClick={controls.onSortCopy}>Sort a copy</button>}</form>
      {(inputError || controls.error || (!sorted && algorithm.requiresSortedInput)) && <p className="input-error" role="alert">{inputError ?? controls.error ?? 'This algorithm needs ascending values. Choose “Sort a copy” to continue.'}</p>}
      <SearchVisualizer state={state}/><AppFooter/>
    </div>
    <div className="workspace-aside"><SearchInspector algorithm={algorithm} state={state}/></div>
  </section>
}
