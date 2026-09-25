import { AppSidebar } from '@/components/app-sidebar'
import { AppTopbar } from '@/components/app-topbar'
import { algorithmRegistry } from '@/domain/algorithms/registry'
import { searchingAlgorithmRegistry, searchingAlgorithms, stringSearchingAlgorithmRegistry, stringSearchingAlgorithms, hashSearchingAlgorithmRegistry, hashSearchingAlgorithms } from '@/domain/algorithms/searching'
import { usePreferences } from '@/features/preferences/use-preferences'
import { WorkspaceComposer } from '@/features/catalog/workspace-composer'
import { getSearchModeMetadata } from '@/features/catalog/catalog-metadata'
import { createBrowserPreferences } from '@/infrastructure/browser-preferences'
import type { PreferenceAlgorithmGroup } from '@/domain/preferences/user-preferences'
import './App.css'

function isAlgorithmAvailable(group: PreferenceAlgorithmGroup, id: string) {
  switch (group) {
    case 'sorting': return algorithmRegistry.get(id) !== undefined
    case 'searching': return searchingAlgorithmRegistry.get(id) !== undefined
    case 'string-searching': return stringSearchingAlgorithmRegistry.get(id) !== undefined
    case 'hash-searching': return hashSearchingAlgorithmRegistry.get(id) !== undefined
    case 'tree-searching':
    case 'data-structures':
    case 'data-structure-operations': return false
  }
}

const preferencesRepository = createBrowserPreferences(isAlgorithmAvailable)
const sortingSummaries = [...algorithmRegistry.definitions].sort((a, b) => a.displayOrder - b.displayOrder)

export default function App() {
  const { preferences, setPreferences } = usePreferences(preferencesRepository)
  const modeMetadata = getSearchModeMetadata(preferences.searchMode)
  const algorithms = modeMetadata.id === 'array'
    ? [...searchingAlgorithms].sort((a, b) => a.displayOrder - b.displayOrder)
    : modeMetadata.id === 'string'
      ? [...stringSearchingAlgorithms].sort((a, b) => a.displayOrder - b.displayOrder)
      : modeMetadata.id === 'hash' ? [...hashSearchingAlgorithms].sort((a, b) => a.displayOrder - b.displayOrder) : []
  const displayedAlgorithms = preferences.category === 'sorting' ? sortingSummaries : algorithms
  const selectedId = preferences.category === 'sorting' ? preferences.lastAlgorithmId
    : modeMetadata.preferenceGroup === 'searching' ? preferences.lastSearchingAlgorithmId
      : modeMetadata.preferenceGroup === 'string-searching' ? preferences.lastStringSearchAlgorithmId
        : modeMetadata.preferenceGroup === 'hash-searching' ? preferences.lastHashSearchAlgorithmId : preferences.lastTreeSearchAlgorithmId

  function onSelectAlgorithm(id: string) {
    setPreferences(current => {
      if (current.category === 'sorting') return { ...current, lastAlgorithmId: id }
      if (modeMetadata.preferenceGroup === 'searching') return { ...current, lastSearchingAlgorithmId: id }
      if (modeMetadata.preferenceGroup === 'string-searching') return { ...current, lastStringSearchAlgorithmId: id }
      if (modeMetadata.preferenceGroup === 'hash-searching') return { ...current, lastHashSearchAlgorithmId: id }
      return { ...current, lastTreeSearchAlgorithmId: id }
    })
  }

  return <div className="app-shell">
    <AppTopbar theme={preferences.theme} category={preferences.category}
      onCategoryChange={category => setPreferences(current => ({ ...current, category }))}
      onThemeToggle={() => setPreferences(current => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }))}/>
    <AppSidebar category={preferences.category} title={preferences.category === 'searching' ? modeMetadata.sidebarTitle : undefined} algorithms={displayedAlgorithms} selectedId={selectedId}
      onSelect={onSelectAlgorithm} searchMode={preferences.searchMode}
      onSearchModeChange={searchMode => setPreferences(current => ({ ...current, searchMode }))}/>
    <main className="main-area" key={`${preferences.category}-${preferences.searchMode}`}>
      <WorkspaceComposer preferences={preferences} setPreferences={setPreferences}/>
    </main>
  </div>
}
