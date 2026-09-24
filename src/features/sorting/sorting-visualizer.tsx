import { ArrowRight } from 'lucide-react'
import type { SortingExecution } from '@/domain/simulation/sorting-execution'
import type { useSortingPlayback } from './use-sorting-playback'
import { ExecutionTimeline, MetricsStrip } from './execution-timeline'

type SortingVisualizerProps = Readonly<{ execution: SortingExecution; playback: ReturnType<typeof useSortingPlayback>; onGenerate: () => void }>

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

export function SortingVisualizer({ execution, playback, onGenerate }: SortingVisualizerProps) {
  const { simulation, state, totalSteps, seek, reset, play } = playback
  const minValue = Math.min(...simulation.values, 0)
  const maxValue = Math.max(...simulation.values, 1)
  const valueRange = maxValue - minValue || 1
  return <div className="visualizer-panel">
    <div className="chart-topline"><div className="legend"><span><i className="legend-swatch comparing"/>Comparing</span><span><i className="legend-swatch pivot"/>Pivot</span><span><i className="legend-swatch swapping"/>Swapping</span><span><i className="legend-swatch sorted"/>Sorted</span><span><i className="legend-swatch unsorted"/>Unsorted</span></div><div className="step-counter">Step <strong>{state.currentStep.toLocaleString()}</strong><span>/</span>{totalSteps.toLocaleString()}</div></div>
    <div className="bars" role="list" aria-label="Array visualization">
      {simulation.values.map((value, index) => {
        const barState = getBarState(index, execution, state.currentStep)
        const height = `${Math.max(7, ((value - minValue) / valueRange) * 91 + 6)}%`
        return <div key={index} role="listitem" aria-label={`Index ${index}, value ${value}, ${barState}`} title={`Index ${index} · ${value} · ${barState}`} className={`bar bar-${barState}`} style={{ height }}/>
      })}
    </div>
    {simulation.auxiliaryPanels.length > 0 && <div className="auxiliary-panels" aria-label="Auxiliary algorithm state">{simulation.auxiliaryPanels.map((panel) => <div className="auxiliary-panel" key={panel.id}><strong>{panel.label}</strong><span className="auxiliary-count">{panel.values.length} values</span><div className="auxiliary-values" aria-label={`${panel.label}, ${panel.values.length} values`}>{panel.values.slice(0, 80).map((value, index) => <span key={`${index}-${value}`}>{value}</span>)}{panel.values.length > 80 && <span className="more-values">+{panel.values.length - 80} more</span>}</div></div>)}</div>}
    {state.status === 'completed' && <div className="completion-banner" role="status"><div><strong>Sorted successfully</strong><span>{simulation.values.length} values · {totalSteps.toLocaleString()} execution steps</span></div><button className="button" onClick={() => { reset(); play() }}>Replay</button><button className="button" onClick={onGenerate}>New array</button><a href="#sorting-algorithms">Try another algorithm <ArrowRight size={13}/></a></div>}
    <MetricsStrip metrics={simulation.metrics}/><ExecutionTimeline currentStep={state.currentStep} totalSteps={totalSteps} onSeek={seek}/>
    <div className="playback-hint">Keyboard: <kbd>Space</kbd> play/pause <kbd>←</kbd> <kbd>→</kbd> step <kbd>R</kbd> restart</div>
  </div>
}
