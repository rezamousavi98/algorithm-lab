import { useState, type KeyboardEvent } from 'react'
import type { AlgorithmDefinition, AlgorithmEvent, PlaybackStatus, SortingInput, SortingVisualizationState } from '@/domain/algorithms/types'
import { ComplexityPanel, OverviewPanel, PseudocodePanel } from './learning-panels'

type InspectorTab = 'overview' | 'pseudocode' | 'complexity'
const TABS: readonly InspectorTab[] = ['overview', 'pseudocode', 'complexity']
type LearningInspectorProps = Readonly<{ algorithm: AlgorithmDefinition<SortingInput, AlgorithmEvent>; simulation: SortingVisualizationState; status: PlaybackStatus }>

export function LearningInspector({ algorithm, simulation, status }: LearningInspectorProps) {
  const [tab, setTab] = useState<InspectorTab>('overview')
  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const offset = event.key === 'ArrowRight' ? 1 : -1
    const nextTab = TABS[(TABS.indexOf(tab) + offset + TABS.length) % TABS.length]
    setTab(nextTab)
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-tab="${nextTab}"]`)?.focus()
  }

  return <aside className="inspector">
    <div className="inspector-tabs" role="tablist" aria-label={`${algorithm.name} learning panels`} onKeyDown={onTabKeyDown}>
      {TABS.map((tabId) => <button key={tabId} id={`inspector-tab-${tabId}`} data-tab={tabId} type="button" role="tab" aria-selected={tab === tabId} aria-controls="inspector-panel" tabIndex={tab === tabId ? 0 : -1} className={tab === tabId ? 'selected' : ''} onClick={() => setTab(tabId)}>{tabId[0].toUpperCase() + tabId.slice(1)}</button>)}
    </div>
    <div className="inspector-content" id="inspector-panel" role="tabpanel" aria-labelledby={`inspector-tab-${tab}`}>
      {tab === 'overview' && <OverviewPanel algorithm={algorithm} simulation={simulation} completed={status === 'completed'}/>}
      {tab === 'pseudocode' && <PseudocodePanel algorithm={algorithm} simulation={simulation}/>}
      {tab === 'complexity' && <ComplexityPanel algorithm={algorithm}/>}
    </div>
  </aside>
}
