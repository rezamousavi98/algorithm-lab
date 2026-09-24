import {
  ArrowRight, FastForward, Pause, Play, RotateCcw, Shuffle, StepBack, StepForward,
} from 'lucide-react'
import type { ChangeEvent, CSSProperties } from 'react'
import type { SortingMetrics } from '@/domain/algorithms/types'
import type { SortingPattern } from '@/domain/algorithms/sorting/input'
import type { SortingExecution } from '@/domain/simulation/sorting-execution'
import { useSortingPlayback } from './use-sorting-playback'

const SPEEDS = [0.25, 0.5, 1, 2, 4]

type PlaybackControlsProps = Readonly<{
  playback: ReturnType<typeof useSortingPlayback>
  onSpeedChange: (speed: number) => void
}>

export function PlaybackControls({ playback, onSpeedChange }: PlaybackControlsProps) {
  const { state, play, pause, reset, stepBackward, stepForward, jumpToEnd, setSpeed } = playback
  const playing = state.status === 'playing'

  return (
    <>
      <div className="playback-buttons" role="group" aria-label="Playback controls">
        <button className="button primary" onClick={playing ? pause : play} aria-label={playing ? 'Pause visualization' : 'Play visualization'}>
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}{playing ? 'Pause' : 'Play'}
        </button>
        <button className="button" onClick={reset} aria-label="Restart visualization"><RotateCcw size={16} />Reset</button>
        <button className="button step-control" onClick={stepBackward} disabled={state.currentStep === 0} aria-label="Previous step"><StepBack size={16} />Previous</button>
        <button className="button step-control" onClick={stepForward} disabled={state.currentStep >= playback.totalSteps} aria-label="Next step"><StepForward size={16} />Next</button>
        <button className="button end-control" onClick={jumpToEnd} disabled={state.currentStep >= playback.totalSteps} aria-label="Jump to end"><FastForward size={16} />End</button>
      </div>
      <label className="control-select speed-select"><span>Speed</span><select value={state.speed} aria-label="Playback speed" onChange={(event) => { const speed = Number(event.target.value); setSpeed(speed); onSpeedChange(speed) }}>{SPEEDS.map((speed) => <option value={speed} key={speed}>{speed}×</option>)}</select><span className="select-caret">⌄</span></label>
    </>
  )
}

type ExecutionTimelineProps = Readonly<{
  currentStep: number
  totalSteps: number
  onSeek: (step: number) => void
}>

export function ExecutionTimeline({ currentStep, totalSteps, onSeek }: ExecutionTimelineProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => onSeek(Number(event.target.value))

  return (
    <div className="execution-timeline">
      <div className="timeline-labels"><span>Execution timeline</span><span>Step <strong>{currentStep.toLocaleString()}</strong> / {totalSteps.toLocaleString()}</span></div>
      <input
        aria-label="Seek execution timeline"
        type="range"
        min={0}
        max={Math.max(totalSteps, 1)}
        value={currentStep}
        disabled={totalSteps === 0}
        onChange={onChange}
        style={{ '--timeline-progress': `${totalSteps ? (currentStep / totalSteps) * 100 : 0}%` } as CSSProperties}
      />
      <div className="timeline-markers"><span>Start</span><span>Step {Math.ceil(totalSteps / 2).toLocaleString()}</span><span>End</span></div>
    </div>
  )
}

type MetricsStripProps = Readonly<{ metrics: SortingMetrics }>

export function MetricsStrip({ metrics }: MetricsStripProps) {
  return (
      <div className="metrics-strip" role="group" aria-label="Operation metrics">
      <span><b>{metrics.comparisons.toLocaleString()}</b> comparisons</span>
      <span><b>{metrics.swaps.toLocaleString()}</b> swaps</span>
      <span><b>{metrics.reads.toLocaleString()}</b> reads</span>
      <span><b>{metrics.writes.toLocaleString()}</b> writes</span>
    </div>
  )
}

type ExecutionSurfaceProps = Readonly<{
  execution: SortingExecution
  playback: ReturnType<typeof useSortingPlayback>
  arraySize: number
  pattern: SortingPattern
  inputMode: 'generated' | 'manual'
  manualDraft: string
  manualError: string | null
  executionError: string | null
  onArraySizeChange: (size: number) => void
  onPatternChange: (pattern: SortingPattern) => void
  onInputModeChange: (mode: 'generated' | 'manual') => void
  onManualDraftChange: (draft: string) => void
  onApplyManual: () => void
  onGenerate: () => void
  onSpeedChange: (speed: number) => void
}>

function getBarState(index: number, execution: SortingExecution, currentStep: number) {
  const state = execution.snapshots[currentStep]
  const event = state.activeEvent
  if (event?.type === 'swap' && event.indices.includes(index)) return 'swapping'
  if (event?.type === 'write' && event.index === index) return 'writing'
  if (event?.type === 'compare' && state.comparedIndices.includes(index)) return 'comparing'
  if (state.pivotIndex === index) return 'pivot'
  if (state.selectedIndices.includes(index)) return 'selected'
  if (state.sortedIndices.includes(index)) return 'sorted'
  return 'unsorted'
}

export function ExecutionSurface({
  execution,
  playback,
  arraySize,
  pattern,
  inputMode,
  manualDraft,
  manualError,
  executionError,
  onArraySizeChange,
  onPatternChange,
  onInputModeChange,
  onManualDraftChange,
  onApplyManual,
  onGenerate,
  onSpeedChange,
}: ExecutionSurfaceProps) {
  const { simulation, state, totalSteps, seek } = playback
  const minValue = Math.min(...simulation.values, 0)
  const maxValue = Math.max(...simulation.values, 1)
  const valueRange = maxValue - minValue || 1

  return (
    <>
      <div className="control-bar">
        <PlaybackControls playback={playback} onSpeedChange={onSpeedChange} />
      </div>
      <div className="dataset-controls" aria-label="Input array settings">
        {inputMode === 'generated' && <>
          <label className="control-select"><span>Pattern</span><select value={pattern} aria-label="Array pattern" onChange={(event) => onPatternChange(event.target.value as SortingPattern)}><option value="random">Random</option><option value="nearly-sorted">Nearly sorted</option><option value="reversed">Reversed</option><option value="few-unique">Few unique</option></select><span className="select-caret">⌄</span></label>
        <label className="control-select array-size-select"><span>Array Size</span><select value={arraySize} aria-label="Array size" onChange={(event) => onArraySizeChange(Number(event.target.value))}>{[5, 20, 30, 50, 80, 100].map((size) => <option key={size}>{size}</option>)}</select><span className="select-caret">⌄</span></label>
          <button className="button generate" onClick={onGenerate}><Shuffle size={16} />Generate New</button>
        </>}
        <button className="button input-mode-button" aria-pressed={inputMode === 'manual'} onClick={() => onInputModeChange(inputMode === 'generated' ? 'manual' : 'generated')}>{inputMode === 'generated' ? 'Enter values' : 'Use generated data'}</button>
      </div>
      {inputMode === 'manual' && <form className="manual-input-panel" onSubmit={(event) => { event.preventDefault(); onApplyManual() }}>
        <label htmlFor="manual-array-values">Custom values</label>
        <textarea id="manual-array-values" rows={2} value={manualDraft} onChange={(event) => onManualDraftChange(event.target.value)} placeholder="8, 3, 12, 1, 7, 4" aria-describedby={manualError ? 'manual-input-error' : undefined} />
        {manualError && <p className="input-error" id="manual-input-error" role="alert">{manualError}</p>}
        <button type="submit" className="button primary">Apply input</button>
        <span className="input-hint">Use 1–100 comma-separated finite numbers.</span>
      </form>}
      {executionError ? <div className="execution-error" role="alert">{executionError}</div> : <div className="visualizer-panel">
        <div className="chart-topline"><div className="legend"><span><i className="legend-swatch comparing"/>Comparing</span><span><i className="legend-swatch pivot"/>Pivot</span><span><i className="legend-swatch swapping"/>Swapping</span><span><i className="legend-swatch sorted"/>Sorted</span><span><i className="legend-swatch unsorted"/>Unsorted</span></div><div className="step-counter">Step <strong>{state.currentStep.toLocaleString()}</strong><span>/</span>{totalSteps.toLocaleString()}</div></div>
        <div className="bars" role="list" aria-label="Array visualization">
          {simulation.values.map((value, index) => {
            const barState = getBarState(index, execution, state.currentStep)
            const height = `${Math.max(7, ((value - minValue) / valueRange) * 91 + 6)}%`
            return <div key={index} role="listitem" aria-label={`Index ${index}, value ${value}, ${barState}`} title={`Index ${index} · ${value} · ${barState}`} className={`bar bar-${barState}`} style={{ height }} />
          })}
        </div>
        {simulation.auxiliaryPanels.length > 0 && <div className="auxiliary-panels" aria-label="Auxiliary algorithm state">{simulation.auxiliaryPanels.map((panel) => <div className="auxiliary-panel" key={panel.id}><strong>{panel.label}</strong><span className="auxiliary-count">{panel.values.length} values</span><div className="auxiliary-values" aria-label={`${panel.label}, ${panel.values.length} values`}>{panel.values.slice(0, 80).map((value, index) => <span key={`${index}-${value}`}>{value}</span>)}{panel.values.length > 80 && <span className="more-values">+{panel.values.length - 80} more</span>}</div></div>)}</div>}
        {state.status === 'completed' && <div className="completion-banner" role="status"><div><strong>Sorted successfully</strong><span>{simulation.values.length} values · {totalSteps.toLocaleString()} execution steps</span></div><button className="button" onClick={() => { playback.reset(); playback.play() }}>Replay</button><button className="button" onClick={onGenerate}>New array</button><a href="#sorting-algorithms">Try another algorithm <ArrowRight size={13} /></a></div>}
        <MetricsStrip metrics={simulation.metrics} />
        <ExecutionTimeline currentStep={state.currentStep} totalSteps={totalSteps} onSeek={seek} />
        <div className="playback-hint">Keyboard: <kbd>Space</kbd> play/pause <kbd>←</kbd> <kbd>→</kbd> step <kbd>R</kbd> restart</div>
      </div>}
    </>
  )
}
