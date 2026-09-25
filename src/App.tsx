import { SortingCategory } from '@/features/sorting/sorting-category'
import { SearchingCategory } from '@/features/searching/searching-category'
import { AppSidebar } from '@/components/app-sidebar'
import { AppTopbar } from '@/components/app-topbar'
import { algorithmRegistry } from '@/domain/algorithms/registry'
import { searchingAlgorithmRegistry, searchingAlgorithms, stringSearchingAlgorithmRegistry, stringSearchingAlgorithms } from '@/domain/algorithms/searching'
import { createBrowserPreferences } from '@/infrastructure/browser-preferences'
import { usePreferences } from '@/features/preferences/use-preferences'
import { StringSearchingCategory } from '@/features/searching/string-searching-category'
import './App.css'

const preferencesRepository = createBrowserPreferences((category, id) => category === 'sorting'
  ? algorithmRegistry.get(id) !== undefined
  : category === 'searching' ? searchingAlgorithmRegistry.get(id) !== undefined : stringSearchingAlgorithmRegistry.get(id) !== undefined)
const sortingAlgorithms = [...algorithmRegistry.definitions].sort((a, b) => a.displayOrder - b.displayOrder)
const searchSummaries = [...searchingAlgorithms].sort((a, b) => a.displayOrder - b.displayOrder)
const stringSearchSummaries = [...stringSearchingAlgorithms].sort((a, b) => a.displayOrder - b.displayOrder)

export default function App() {
  const { preferences, setPreferences } = usePreferences(preferencesRepository)
  const category = preferences.category
  const searchMode = preferences.searchMode
  const algorithms = category === 'sorting' ? sortingAlgorithms : searchMode === 'array' ? searchSummaries : stringSearchSummaries
  const sortingAlgorithm = algorithmRegistry.get(preferences.lastAlgorithmId) ?? sortingAlgorithms[0]
  const searchingAlgorithm = searchingAlgorithmRegistry.get(preferences.lastSearchingAlgorithmId) ?? searchSummaries[0]
  const stringSearchAlgorithm = stringSearchingAlgorithmRegistry.get(preferences.lastStringSearchAlgorithmId) ?? stringSearchSummaries[0]
  const selectedId = category === 'sorting' ? sortingAlgorithm.id : searchMode === 'array' ? searchingAlgorithm.id : stringSearchAlgorithm.id
  const selectAlgorithm = (id: string) => setPreferences(current => category === 'sorting'
    ? { ...current, lastAlgorithmId: id }
    : searchMode === 'array' ? { ...current, lastSearchingAlgorithmId: id } : { ...current, lastStringSearchAlgorithmId: id })
  const onCategoryChange = (next: 'sorting' | 'searching') => setPreferences(current => ({ ...current, category: next }))
  const onSearchModeChange = (next: 'array' | 'string') => setPreferences(current => ({ ...current, searchMode: next }))
  return <div className="app-shell">
    <AppTopbar theme={preferences.theme} category={category} onCategoryChange={onCategoryChange} onThemeToggle={() => setPreferences(current => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }))}/>
    <AppSidebar category={category} algorithms={algorithms} selectedId={selectedId} onSelect={selectAlgorithm} searchMode={searchMode} onSearchModeChange={onSearchModeChange}/>
    <main className="main-area" key={`${category}-${searchMode}`}>
      {category === 'sorting'
        ? <SortingCategory algorithm={sortingAlgorithm} arraySize={preferences.arraySize} speed={preferences.playbackSpeed} onSizeChange={arraySize => setPreferences(current => ({ ...current, arraySize }))} onSpeedChange={playbackSpeed => setPreferences(current => ({ ...current, playbackSpeed }))}/>
        : searchMode === 'array'
          ? <SearchingCategory algorithm={searchingAlgorithm} arraySize={preferences.arraySize} speed={preferences.playbackSpeed} onSizeChange={arraySize => setPreferences(current => ({ ...current, arraySize }))} onSpeedChange={playbackSpeed => setPreferences(current => ({ ...current, playbackSpeed }))}/>
          : <StringSearchingCategory algorithm={stringSearchAlgorithm} speed={preferences.playbackSpeed} onSpeedChange={playbackSpeed => setPreferences(current => ({ ...current, playbackSpeed }))}/>}
    </main>
  </div>
}
