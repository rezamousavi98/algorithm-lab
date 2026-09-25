import { BarChart3 } from 'lucide-react'
import type { AlgorithmSummary } from '@/domain/algorithms/types'
import type { EnabledCategory, SearchMode } from '@/domain/preferences/user-preferences'
import { getCategoryMetadata, SEARCH_MODE_CATALOG } from '@/features/catalog/catalog-metadata'

type AppSidebarProps = Readonly<{
  category: EnabledCategory
  title?: string
  algorithms: readonly AlgorithmSummary[]
  selectedId: string
  onSelect: (algorithmId: string) => void
  searchMode?: SearchMode
  onSearchModeChange?: (mode: SearchMode) => void
}>

export function AppSidebar({ category, title, algorithms, selectedId, onSelect, searchMode = 'array', onSearchModeChange }: AppSidebarProps) {
  const categoryMetadata = getCategoryMetadata(category)
  const modes = category === 'searching' ? SEARCH_MODE_CATALOG.filter(mode => mode.enabled) : []

  const sidebarTitle = title ?? categoryMetadata.sidebarTitle
  return <aside id={`${category}-algorithms`} tabIndex={-1} className="sidebar" aria-label={sidebarTitle}>
    <div className="sidebar-heading"><h2>{sidebarTitle}</h2><span>{algorithms.length}</span></div>
    {modes.length > 0 && onSearchModeChange && <div className="search-mode-switch" role="group" aria-label="Search input type">
      {modes.map(mode => <button key={mode.id} className={searchMode === mode.id ? 'selected' : ''} aria-pressed={searchMode === mode.id} onClick={() => onSearchModeChange(mode.id)}>{mode.label}</button>)}
    </div>}
    <nav className="algorithm-nav" aria-label={`Choose a ${category} algorithm`}>
      {algorithms.map((algorithm, index) => <button key={algorithm.id} className={`algorithm-nav-item ${selectedId === algorithm.id ? 'selected' : ''}`} aria-current={selectedId === algorithm.id ? 'page' : undefined} onClick={() => onSelect(algorithm.id)}>
        <span className={`algorithm-nav-icon mini-${index % 4}`}><BarChart3 size={20}/></span>
        <span className="algorithm-nav-copy"><strong>{algorithm.name}</strong><small>{algorithm.shortDescription}</small></span>
        {algorithm.complexity && <span className="algorithm-nav-complexity" title={`Average time complexity: ${algorithm.complexity.average}`} aria-label={`Average time complexity: ${algorithm.complexity.average}`}>{algorithm.complexity.average.split(' when ')[0]}</span>}
      </button>)}
    </nav>
  </aside>
}
