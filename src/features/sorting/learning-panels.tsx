import { VariablesPanel, PseudocodeView, ComplexityView } from '@/features/workspace/learning-content'
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

export function OverviewPanel({ algorithm, simulation, completed }: Readonly<{ algorithm: Algorithm; simulation: SortingVisualizationState; completed: boolean }>) {
  return <>
    <h2>How It Works</h2><p>{algorithm.description}</p>
    <div className={`operation-explanation ${completed ? 'complete' : ''}`} aria-live="polite"><span className="operation-label">{completed ? 'Completed' : 'Current operation'}</span><p>{completed ? `${algorithm.name} has finished sorting the input.` : describeOperation(simulation, algorithm)}</p></div>
    <VariablesPanel variables={simulation.variables}/>
    <div className="inspector-subsection"><h3>Properties</h3><div className="property-tags"><span>{algorithm.stable ? 'Stable' : 'Unstable'}</span><span>{algorithm.inPlace ? 'In-place' : 'Uses extra space'}</span></div></div>
    <div className="inspector-subsection"><h3>Use Cases</h3><ul className="use-cases">{algorithm.useCases.map((item) => <li key={item}>{item}</li>)}</ul></div>
  </>
}

export function PseudocodePanel({ algorithm, simulation }: Readonly<{ algorithm: Algorithm; simulation: SortingVisualizationState }>) {
  return <PseudocodeView algorithm={algorithm} lineId={simulation.currentPseudocodeLineId}/>
}

export function ComplexityPanel({ algorithm }: Readonly<{ algorithm: Algorithm }>) {
  return <><ComplexityView algorithm={algorithm}/>
    <div className="inspector-subsection"><h3>Algorithm Properties</h3><dl className="property-list"><div><dt>Stable</dt><dd>{algorithm.stable ? 'Yes' : 'No'}</dd></div><div><dt>In place</dt><dd>{algorithm.inPlace ? 'Yes' : 'No'}</dd></div></dl></div>
    <div className="complexity-note"><strong>{algorithm.name}</strong><p>{algorithm.description}</p></div>
  </>
}
