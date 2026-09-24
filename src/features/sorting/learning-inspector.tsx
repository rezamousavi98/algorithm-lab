import { useState, type KeyboardEvent } from 'react'
import type { AlgorithmDefinition, AlgorithmEvent, PlaybackStatus, SortingInput, SortingVisualizationState } from '@/domain/algorithms/types'

type InspectorTab = 'overview' | 'pseudocode' | 'complexity'
const TABS: readonly InspectorTab[] = ['overview', 'pseudocode', 'complexity']

function describeOperation(
  state: SortingVisualizationState,
  algorithm: AlgorithmDefinition<SortingInput, AlgorithmEvent>,
): string {
  const event = state.activeEvent
  if (!event) return 'Start the visualization to follow each operation.'
  if (event.type === 'explanation') return event.message

  switch (event.type) {
    case 'compare': {
      const [first, second] = event.values ?? (event.indices.map((index) => state.values[index]) as [number, number])
      return `Compare ${first} and ${second} to decide their next positions.`
    }
    case 'swap':
      return `Swap the values at positions ${event.indices[0]} and ${event.indices[1]}.`
    case 'write':
      return `Write ${event.value} at position ${event.index}.`
    case 'read':
      return `Read ${event.value} from position ${event.index}.`
    case 'markSorted':
      return `Mark ${event.indices.length} ${event.indices.length === 1 ? 'position' : 'positions'} as sorted.`
    case 'select':
      return `Select position ${event.index} as the ${event.role}.`
    case 'range':
      return `Work within the ${event.role} range from ${event.indices[0]} to ${event.indices[1]}.`
    case 'auxiliaryUpdate':
      return `Update ${event.label.toLowerCase()} with ${event.values.length} values.`
    case 'variable':
      return `Update the ${event.name} variable.`
    case 'pseudocode':
      return algorithm.pseudocode.find((line) => line.id === event.lineId)?.code ?? 'Follow the current pseudocode line.'
  }
}

type LearningInspectorProps = Readonly<{
  algorithm: AlgorithmDefinition<SortingInput, AlgorithmEvent>
  simulation: SortingVisualizationState
  status: PlaybackStatus
}>

export function LearningInspector({ algorithm, simulation, status }: LearningInspectorProps) {
  const [tab, setTab] = useState<InspectorTab>('overview')

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const offset = event.key === 'ArrowRight' ? 1 : -1
    const tabIndex = TABS.indexOf(tab)
    const nextTab = TABS[(tabIndex + offset + TABS.length) % TABS.length]
    setTab(nextTab)
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-tab="${nextTab}"]`)?.focus()
  }

  return (
    <aside className="inspector">
      <div className="inspector-tabs" role="tablist" aria-label={`${algorithm.name} learning panels`} onKeyDown={onTabKeyDown}>
        {TABS.map((tabId) => <button
          key={tabId}
          id={`inspector-tab-${tabId}`}
          data-tab={tabId}
          type="button"
          role="tab"
          aria-selected={tab === tabId}
          aria-controls="inspector-panel"
          tabIndex={tab === tabId ? 0 : -1}
          className={tab === tabId ? 'selected' : ''}
          onClick={() => setTab(tabId)}
        >{tabId === 'overview' ? 'Overview' : tabId === 'pseudocode' ? 'Pseudocode' : 'Complexity'}</button>)}
      </div>

      <div className="inspector-content" id="inspector-panel" role="tabpanel" aria-labelledby={`inspector-tab-${tab}`}>
        {tab === 'overview' && <>
          <h2>How It Works</h2>
          <p>{algorithm.description}</p>
          <div className={`operation-explanation ${status === 'completed' ? 'complete' : ''}`} aria-live="polite">
            <span className="operation-label">{status === 'completed' ? 'Completed' : 'Current operation'}</span>
            <p>{status === 'completed' ? `${algorithm.name} has finished sorting the input.` : describeOperation(simulation, algorithm)}</p>
          </div>
          <div className="inspector-subsection">
            <h3>Runtime Variables</h3>
            {Object.keys(simulation.variables).length > 0
              ? <dl className="variable-list">{Object.entries(simulation.variables).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{formatValue(value)}</dd></div>)}</dl>
              : <p className="muted-note">Variables appear here as the algorithm runs.</p>}
          </div>
          <div className="inspector-subsection">
            <h3>Properties</h3>
            <div className="property-tags"><span>{algorithm.stable ? 'Stable' : 'Unstable'}</span><span>{algorithm.inPlace ? 'In-place' : 'Uses extra space'}</span></div>
          </div>
          <div className="inspector-subsection">
            <h3>Use Cases</h3>
            <ul className="use-cases">{algorithm.useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul>
          </div>
        </>}

        {tab === 'pseudocode' && <>
          <h2>Execution Pseudocode</h2>
          <p className="muted-note">The highlighted line follows the current event in the timeline.</p>
          <ol className="pseudocode-list">{algorithm.pseudocode.map((line, index) => <li
            key={line.id}
            className={simulation.currentPseudocodeLineId === line.id ? 'active' : ''}
            aria-current={simulation.currentPseudocodeLineId === line.id ? 'step' : undefined}
          ><span className="line-number">{String(index + 1).padStart(2, '0')}</span><code style={{ paddingInlineStart: `${(line.indent ?? 0) * 13}px` }}>{line.code}</code></li>)}</ol>
        </>}

        {tab === 'complexity' && <>
          <h2>Time &amp; Space Complexity</h2>
          <p>Growth rates describe how work and memory change as the input gets larger.</p>
          <div className="complexity-grid"><div className="complexity best"><span>Best Case</span><b>{algorithm.complexity.best}</b></div><div className="complexity average"><span>Average Case</span><b>{algorithm.complexity.average}</b></div><div className="complexity worst"><span>Worst Case</span><b>{algorithm.complexity.worst}</b></div><div className="complexity space"><span>Space Complexity</span><b>{algorithm.complexity.space}</b></div></div>
          <div className="inspector-subsection">
            <h3>Algorithm Properties</h3>
            <dl className="property-list"><div><dt>Stable</dt><dd>{algorithm.stable ? 'Yes' : 'No'}</dd></div><div><dt>In place</dt><dd>{algorithm.inPlace ? 'Yes' : 'No'}</dd></div></dl>
          </div>
          <div className="complexity-note"><strong>{algorithm.name}</strong><p>{algorithm.description}</p></div>
        </>}
      </div>
    </aside>
  )
}

function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
