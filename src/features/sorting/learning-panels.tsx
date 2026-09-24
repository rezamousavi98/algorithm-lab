import type { AlgorithmLearningContent, SortingVisualizationState } from '@/domain/algorithms/types'

type Algorithm = AlgorithmLearningContent

function describeOperation(state: SortingVisualizationState, algorithm: Algorithm): string {
  const event = state.activeEvent
  if (!event) return 'Start the visualization to follow each operation.'
  if (event.type === 'explanation') return event.message
  switch (event.type) {
    case 'compare': {
      const [first, second] = event.values ?? (event.indices.map((index) => state.values[index]) as [number, number])
      return `Compare ${first} and ${second} to decide their next positions.`
    }
    case 'swap': return `Swap the values at positions ${event.indices[0]} and ${event.indices[1]}.`
    case 'write': return `Write ${event.value} at position ${event.index}.`
    case 'read': return `Read ${event.value} from position ${event.index}.`
    case 'markSorted': return `Mark ${event.indices.length} ${event.indices.length === 1 ? 'position' : 'positions'} as sorted.`
    case 'select': return `Select position ${event.index} as the ${event.role}.`
    case 'range': return `Work within the ${event.role} range from ${event.indices[0]} to ${event.indices[1]}.`
    case 'auxiliaryUpdate': return `Update ${event.label.toLowerCase()} with ${event.values.length} values.`
    case 'variable': return `Update the ${event.name} variable.`
    case 'pseudocode': return algorithm.pseudocode.find((line) => line.id === event.lineId)?.code ?? 'Follow the current pseudocode line.'
  }
}

function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function OverviewPanel({ algorithm, simulation, completed }: Readonly<{ algorithm: Algorithm; simulation: SortingVisualizationState; completed: boolean }>) {
  return <>
    <h2>How It Works</h2><p>{algorithm.description}</p>
    <div className={`operation-explanation ${completed ? 'complete' : ''}`} aria-live="polite"><span className="operation-label">{completed ? 'Completed' : 'Current operation'}</span><p>{completed ? `${algorithm.name} has finished sorting the input.` : describeOperation(simulation, algorithm)}</p></div>
    <div className="inspector-subsection"><h3>Runtime Variables</h3>{Object.keys(simulation.variables).length > 0
      ? <dl className="variable-list">{Object.entries(simulation.variables).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{formatValue(value)}</dd></div>)}</dl>
      : <p className="muted-note">Variables appear here as the algorithm runs.</p>}</div>
    <div className="inspector-subsection"><h3>Properties</h3><div className="property-tags"><span>{algorithm.stable ? 'Stable' : 'Unstable'}</span><span>{algorithm.inPlace ? 'In-place' : 'Uses extra space'}</span></div></div>
    <div className="inspector-subsection"><h3>Use Cases</h3><ul className="use-cases">{algorithm.useCases.map((item) => <li key={item}>{item}</li>)}</ul></div>
  </>
}

export function PseudocodePanel({ algorithm, simulation }: Readonly<{ algorithm: Algorithm; simulation: SortingVisualizationState }>) {
  return <><h2>Execution Pseudocode</h2><p className="muted-note">The highlighted line follows the current event in the timeline.</p>
    <ol className="pseudocode-list">{algorithm.pseudocode.map((line, index) => <li key={line.id} className={simulation.currentPseudocodeLineId === line.id ? 'active' : ''} aria-current={simulation.currentPseudocodeLineId === line.id ? 'step' : undefined}><span className="line-number">{String(index + 1).padStart(2, '0')}</span><code style={{ paddingInlineStart: `${(line.indent ?? 0) * 13}px` }}>{line.code}</code></li>)}</ol>
  </>
}

export function ComplexityPanel({ algorithm }: Readonly<{ algorithm: Algorithm }>) {
  return <><h2>Time &amp; Space Complexity</h2><p>Growth rates describe how work and memory change as the input gets larger.</p>
    <div className="complexity-grid"><div className="complexity best"><span>Best Case</span><b>{algorithm.complexity.best}</b></div><div className="complexity average"><span>Average Case</span><b>{algorithm.complexity.average}</b></div><div className="complexity worst"><span>Worst Case</span><b>{algorithm.complexity.worst}</b></div><div className="complexity space"><span>Space Complexity</span><b>{algorithm.complexity.space}</b></div></div>
    <div className="inspector-subsection"><h3>Algorithm Properties</h3><dl className="property-list"><div><dt>Stable</dt><dd>{algorithm.stable ? 'Yes' : 'No'}</dd></div><div><dt>In place</dt><dd>{algorithm.inPlace ? 'Yes' : 'No'}</dd></div></dl></div>
    <div className="complexity-note"><strong>{algorithm.name}</strong><p>{algorithm.description}</p></div>
  </>
}
