import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, BarChart3, Boxes, Check, CircleHelp,
  Command, Database, GitBranch, Grid2X2, Lightbulb, List, Moon, Search,
  SlidersHorizontal, Sun, X,
} from 'lucide-react'
import { algorithmRegistry } from '@/domain/algorithms/registry'
import type { SortingInput } from '@/domain/algorithms/types'
import { generateSortingInput, parseManualSortingInput, type SortingPattern } from '@/domain/algorithms/sorting/input'
import { createSortingExecution, type SortingExecution } from '@/domain/simulation/sorting-execution'
import { quickSort } from '@/domain/algorithms/sorting/quick-sort'
import { loadUserPreferences, saveUserPreferences } from '@/domain/preferences/user-preferences'
import { WorkspaceErrorBoundary } from '@/components/workspace-error-boundary'
import { SortingWorkspace } from '@/features/sorting/sorting-workspace'
import './App.css'

const difficultyById: Readonly<Record<string, string>> = {
  'bubble-sort': 'Easy',
  'selection-sort': 'Easy',
  'insertion-sort': 'Easy',
  'cocktail-shaker-sort': 'Easy',
  'merge-sort': 'Medium',
  'quick-sort': 'Medium',
  'heap-sort': 'Medium',
  'shell-sort': 'Medium',
  'counting-sort': 'Medium',
  'radix-sort': 'Hard',
}
const algorithms = algorithmRegistry.definitions.map((algorithm) => ({
  ...algorithm,
  level: difficultyById[algorithm.id] ?? 'Medium',
  complexityLabel: algorithm.complexity.average,
}))
const emptyExecutionResult = createSortingExecution(quickSort, [])
if (!emptyExecutionResult.ok) throw new Error(emptyExecutionResult.error.message)
const EMPTY_EXECUTION: SortingExecution = emptyExecutionResult.execution

function Brand() {
  return <div className="brand"><div className="brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 37 33H3L20 4Z"/><circle cx="20" cy="24" r="4"/></svg></div><div><strong>Algorithm Lab</strong><span>Visualize. Understand. Explore.</span></div></div>
}

function App() {
  const [preferences, setPreferences] = useState(loadUserPreferences)
  const { theme, lastAlgorithmId: selectedId, arraySize, playbackSpeed } = preferences
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [pattern, setPattern] = useState<SortingPattern>('random')
  const [input, setInput] = useState<SortingInput>(() => generateSortingInput({ size: preferences.arraySize, pattern: 'random' }))
  const [inputMode, setInputMode] = useState<'generated' | 'manual'>('generated')
  const [manualDraft, setManualDraft] = useState('8, 3, 12, 1, 7, 4')
  const [manualError, setManualError] = useState<string | null>(null)
  const [runVersion, setRunVersion] = useState(0)
  const selectedAlgorithm = algorithmRegistry.get(selectedId) ?? algorithmRegistry.definitions[0]
  const executionResult = useMemo(
    () => createSortingExecution(selectedAlgorithm, input),
    [input, selectedAlgorithm],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveUserPreferences(preferences)
  }, [preferences, theme])

  const visibleAlgorithms = algorithms.filter((algorithm) => `${algorithm.name} ${algorithm.description}`.toLowerCase().includes(query.toLowerCase()))
  const generateNew = (size = arraySize, nextPattern = pattern) => {
    setPreferences((current) => ({ ...current, arraySize: size }))
    setPattern(nextPattern)
    setInput(generateSortingInput({ size, pattern: nextPattern }))
    setInputMode('generated')
    setManualError(null)
    setRunVersion((version) => version + 1)
  }
  const toggleInputMode = (mode: 'generated' | 'manual') => {
    if (mode === 'manual') setManualDraft(input.join(', '))
    else generateNew()
    setManualError(null)
    setInputMode(mode)
  }
  const applyManualInput = () => {
    const result = parseManualSortingInput(manualDraft)
    if (!result.ok) {
      setManualError(result.message)
      return result
    }
    setInput(result.values)
    setInputMode('manual')
    setManualError(null)
    setRunVersion((version) => version + 1)
    return result
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <nav className="side-nav" aria-label="Main navigation">
          <button className="nav-item active"><SlidersHorizontal /><span>Sorting Algorithms</span></button>
          <button className="nav-item disabled" disabled><Search /><span>Searching Algorithms</span></button>
          <button className="nav-item disabled" disabled><GitBranch /><span>Graph Algorithms</span></button>
          <button className="nav-item disabled" disabled><Database /><span>Data Structures</span></button>
          <button className="nav-item disabled" disabled><Boxes /><span>Coming Soon</span></button>
        </nav>
        <div className="sidebar-note"><Lightbulb /><div><strong>Built for curious minds.</strong><p>Explore algorithms visually and build a deeper intuition for how they work.</p></div></div>
        <div className="sidebar-bottom"><span className="status-dot" /> Interactive learning lab <span>v1.0</span></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <label className="global-search"><Search size={17} /><input aria-label="Search algorithms and topics" placeholder="Search algorithms, topics..." /><kbd><Command size={11} /> K</kbd></label>
          <div className="topbar-actions"><button className="icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setPreferences((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }))}>{theme === 'dark' ? <Sun /> : <Moon />}</button><button className="avatar" aria-label="Account menu">A</button></div>
        </header>

        <WorkspaceErrorBoundary key={`${selectedId}-${runVersion}`}>
        <SortingWorkspace
          algorithm={selectedAlgorithm}
          execution={executionResult.ok ? executionResult.execution : EMPTY_EXECUTION}
          executionError={executionResult.ok ? null : executionResult.error.message}
          arraySize={arraySize}
          initialSpeed={playbackSpeed}
          pattern={pattern}
          inputMode={inputMode}
          manualDraft={manualDraft}
          manualError={manualError}
          onArraySizeChange={(size) => generateNew(size)}
          onPatternChange={(nextPattern) => generateNew(arraySize, nextPattern)}
          onInputModeChange={toggleInputMode}
          onManualDraftChange={(draft) => { setManualDraft(draft); setManualError(null) }}
          onApplyManual={applyManualInput}
          onGenerate={() => generateNew()}
          onSpeedChange={(speed) => setPreferences((current) => ({ ...current, playbackSpeed: speed }))}
        />
        </WorkspaceErrorBoundary>

        <section className="catalog-section" id="sorting-algorithms">
          <div className="catalog-heading"><div><h2>Sorting Algorithms</h2><p>Explore and visualize popular sorting algorithms.</p></div><div className="catalog-actions"><label className="catalog-search"><Search size={16} /><input aria-label="Search sorting algorithms" placeholder="Search sorting algorithms..." value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}</label><div className="view-toggle"><button aria-label="Grid view" className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')}><Grid2X2 size={17} /></button><button aria-label="List view" className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')}><List size={17} /></button></div></div></div>
          <div className={`algorithm-cards ${view === 'list' ? 'list-view' : ''}`}>
            {visibleAlgorithms.map((algorithm, index) => <button className={`algorithm-card ${selectedId === algorithm.id ? 'current' : ''}`} key={algorithm.id} onClick={() => setPreferences((current) => ({ ...current, lastAlgorithmId: algorithm.id }))}>
              <span className={`mini-chart mini-${index % 4}`}><BarChart3 size={27} strokeWidth={1.5} /></span><span className="card-copy"><strong>{algorithm.name}</strong><span>{algorithm.description}</span></span><span className={`tag level-tag level-${algorithm.level.toLowerCase()}`}>{algorithm.level}</span><span className="tag complexity-tag">{algorithm.complexityLabel}</span><span className="card-arrow"><ArrowRight size={15} /></span>
            </button>)}
            {visibleAlgorithms.length === 0 && <div className="empty-search"><CircleHelp size={18} />No sorting algorithms match “{query}”.</div>}
          </div>
          <div className="catalog-footer"><span>Showing {visibleAlgorithms.length} of {algorithms.length} algorithms</span><button>View all algorithms <ArrowRight size={14} /></button></div>
        </section>
        <footer className="page-footer"><span>Algorithm Lab <span className="footer-separator">/</span> Learn algorithms by watching them think.</span><span>Built for curious minds <Check size={13} /></span></footer>
      </main>
    </div>
  )
}

export default App
