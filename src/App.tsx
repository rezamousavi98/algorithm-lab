import { useMemo } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { AppTopbar } from '@/components/app-topbar'
import { WorkspaceErrorBoundary } from '@/components/workspace-error-boundary'
import { algorithmRegistry } from '@/domain/algorithms/registry'
import { searchingAlgorithmRegistry, searchingAlgorithms } from '@/domain/algorithms/searching'
import { createSearchingExecution, type SearchingExecution } from '@/domain/simulation/searching-execution'
import { createInitialSearchingState } from '@/domain/simulation/searching-reducer'
import { createSortingExecution } from '@/domain/simulation/sorting-execution'
import { createBrowserPreferences } from '@/infrastructure/browser-preferences'
import { usePreferences } from '@/features/preferences/use-preferences'
import { useSortingInput } from '@/features/sorting/use-sorting-input'
import { SortingWorkspace } from '@/features/sorting/sorting-workspace'
import { useSearchingInput } from '@/features/searching/use-searching-input'
import { SearchingWorkspace, type SearchingControls } from '@/features/searching/searching-workspace'
import type { SearchingInput } from '@/domain/algorithms/types'
import './App.css'

const preferencesRepository = createBrowserPreferences((category, id) => category === 'sorting' ? algorithmRegistry.get(id) !== undefined : searchingAlgorithmRegistry.get(id) !== undefined)
const sortingAlgorithms = [...algorithmRegistry.definitions].sort((a, b) => a.displayOrder - b.displayOrder)
const searchSummaries = [...searchingAlgorithms].sort((a, b) => a.displayOrder - b.displayOrder)

function SortingCategory({ algorithm, arraySize, speed, onSizeChange, onSpeedChange }: { algorithm: typeof sortingAlgorithms[number]; arraySize: number; speed: number; onSizeChange: (size: number) => void; onSpeedChange: (speed: number) => void }) {
  const dataset = useSortingInput(arraySize, onSizeChange)
  const result = useMemo(() => createSortingExecution(algorithm, dataset.input), [algorithm, dataset.input])
  return <WorkspaceErrorBoundary category="sorting" key={`${algorithm.id}-${dataset.runVersion}`}><SortingWorkspace algorithm={algorithm} execution={result.ok ? result.execution : null} executionError={result.ok ? null : result.error.message} dataset={dataset.controls} initialSpeed={speed} onSpeedChange={onSpeedChange}/></WorkspaceErrorBoundary>
}

function SearchingCategory({ algorithm, arraySize, speed, onSizeChange, onSpeedChange }: { algorithm: typeof searchSummaries[number]; arraySize: number; speed: number; onSizeChange: (size: number) => void; onSpeedChange: (speed: number) => void }) {
  const data = useSearchingInput(arraySize, onSizeChange)
  const result = useMemo(() => createSearchingExecution(algorithm, data.input), [algorithm, data.input])
  const safeExecution: SearchingExecution = result.ok ? result.execution : { input: data.input as SearchingInput, events: [], snapshots: [createInitialSearchingState(data.input)] }
  const controls: SearchingControls = {
    valuesDraft: data.valuesDraft, targetDraft: data.targetDraft, error: data.error, pattern: data.pattern,
    onValuesDraft: data.setValuesDraft, onTargetDraft: data.setTargetDraft, onApply: data.apply, onSortCopy: data.sortCopy,
    onGenerate: data.generate, onPattern: data.setPattern,
  }
  return <WorkspaceErrorBoundary category="searching" key={`${algorithm.id}-${data.runVersion}`}><SearchingWorkspace algorithm={algorithm} execution={safeExecution} inputError={result.ok ? null : result.error.message} controls={controls} initialSpeed={speed} onSpeedChange={onSpeedChange}/></WorkspaceErrorBoundary>
}

export default function App() {
  const { preferences, setPreferences } = usePreferences(preferencesRepository)
  const category = preferences.category
  const algorithms = category === 'sorting' ? sortingAlgorithms : searchSummaries
  const sortingAlgorithm = algorithmRegistry.get(preferences.lastAlgorithmId) ?? sortingAlgorithms[0]
  const searchingAlgorithm = searchingAlgorithmRegistry.get(preferences.lastSearchingAlgorithmId) ?? searchSummaries[0]
  const selectedId = category === 'sorting' ? sortingAlgorithm.id : searchingAlgorithm.id
  const selectAlgorithm = (id: string) => setPreferences(current => category === 'sorting' ? { ...current, lastAlgorithmId: id } : { ...current, lastSearchingAlgorithmId: id })
  const onCategoryChange = (next: 'sorting' | 'searching') => setPreferences(current => ({ ...current, category: next }))
  return <div className="app-shell">
    <AppTopbar theme={preferences.theme} category={category} onCategoryChange={onCategoryChange} onThemeToggle={() => setPreferences(current => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }))}/>
    <AppSidebar category={category} algorithms={algorithms} selectedId={selectedId} onSelect={selectAlgorithm}/>
    <main className="main-area" key={category}>
      {category === 'sorting' ? <SortingCategory algorithm={sortingAlgorithm} arraySize={preferences.arraySize} speed={preferences.playbackSpeed} onSizeChange={arraySize => setPreferences(current => ({ ...current, arraySize }))} onSpeedChange={playbackSpeed => setPreferences(current => ({ ...current, playbackSpeed }))}/> : <SearchingCategory algorithm={searchingAlgorithm} arraySize={preferences.arraySize} speed={preferences.playbackSpeed} onSizeChange={arraySize => setPreferences(current => ({ ...current, arraySize }))} onSpeedChange={playbackSpeed => setPreferences(current => ({ ...current, playbackSpeed }))}/>}
    </main>
  </div>
}
