import type { SortingVisualizationState } from '@/domain/algorithms/types'
import { AuxiliaryPanels } from './auxiliary-panels'

function getBarState(index: number, state: SortingVisualizationState) {
  const event = state.activeEvent
  if (event?.type === 'swap' && event.indices.includes(index)) return 'swapping'
  if (event?.type === 'write' && event.index === index) return 'writing'
  if (event?.type === 'compare' && state.comparedIndices.includes(index)) return 'comparing'
  if (state.sortedIndices.includes(index)) return 'sorted'
  if (state.pivotIndex === index) return 'pivot'
  if (state.selectedIndices.includes(index)) return 'selected'
  return 'unsorted'
}

const STATES = ['comparing', 'pivot', 'swapping', 'selected', 'sorted', 'unsorted'] as const

/** Renders a single simulation state, independently of its timeline storage. */
export function SortingVisualizer({ simulation }: Readonly<{ simulation: SortingVisualizationState }>) {
  const minValue = Math.min(...simulation.values, 0)
  const maxValue = Math.max(...simulation.values, 1)
  // Scale before subtraction so finite values near Number.MAX_VALUE do not overflow.
  const scale = Math.max(Math.abs(minValue), Math.abs(maxValue), 1)
  const minimum = minValue / scale
  const range = maxValue / scale - minimum || 1
  const activeRange = simulation.activeRange
  return <>
    <div className="legend">
      {STATES.map((name) => <span key={name}><i className={`legend-swatch ${name}`} />{name === 'swapping' ? 'Swapping / writing' : name[0].toUpperCase() + name.slice(1)}</span>)}
    </div>
    {activeRange && <p className="active-range" role="status">Active range: positions {activeRange[0]}–{activeRange[1]}</p>}
    <div className="bars" role="list" aria-label="Array visualization">
      {simulation.values.map((value, index) => {
        const barState = getBarState(index, simulation)
        const inRange = activeRange !== null && index >= activeRange[0] && index <= activeRange[1]
        const height = `${Math.max(7, ((value / scale - minimum) / range) * 91 + 6)}%`
        const label = `Index ${index}, value ${value}, ${barState}${inRange ? ', in active range' : ''}`
        return <div key={index} role="listitem" aria-label={label} title={label}
          className={`bar bar-${barState}${inRange ? ' in-active-range' : ''}`} style={{ height }} />
      })}
    </div>
    <AuxiliaryPanels panels={simulation.auxiliaryPanels} />
  </>
}
