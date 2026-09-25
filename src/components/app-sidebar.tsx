import { BarChart3 } from 'lucide-react'
import type { AlgorithmSummary } from '@/domain/algorithms/types'

type AppSidebarProps = Readonly<{
  category: 'sorting' | 'searching'
  algorithms: readonly AlgorithmSummary[]
  selectedId: string
  onSelect: (algorithmId: string) => void
  searchMode?: 'array' | 'string'
  onSearchModeChange?: (mode: 'array' | 'string') => void
}>

export function AppSidebar({ category, algorithms, selectedId, onSelect, searchMode = 'array', onSearchModeChange }: AppSidebarProps) {
  const title = category === 'sorting' ? 'Sorting Algorithms' : 'Searching Algorithms'

  return <aside id={`${category}-algorithms`} tabIndex={-1} className="sidebar" aria-label={title}>
    <div className="sidebar-heading"><h2>{title}</h2><span>{algorithms.length}</span></div>
    {category === 'searching' && onSearchModeChange && <div className="search-mode-switch" role="group" aria-label="Search input type">
      <button className={searchMode === 'array' ? 'selected' : ''} aria-pressed={searchMode === 'array'} onClick={() => onSearchModeChange('array')}>Arrays</button>
      <button className={searchMode === 'string' ? 'selected' : ''} aria-pressed={searchMode === 'string'} onClick={() => onSearchModeChange('string')}>Strings</button>
    </div>}
    <nav className="algorithm-nav" aria-label={`Choose a ${category} algorithm`}>
      {algorithms.map((algorithm, index) => <button key={algorithm.id} className={`algorithm-nav-item ${selectedId === algorithm.id ? 'selected' : ''}`} aria-current={selectedId === algorithm.id ? 'page' : undefined} onClick={() => onSelect(algorithm.id)}>
        <span className={`algorithm-nav-icon mini-${index % 4}`}><BarChart3 size={20}/></span>
        <span className="algorithm-nav-copy"><strong>{algorithm.name}</strong><small>{algorithm.shortDescription}</small></span>
        <span className="algorithm-nav-complexity" title={`Average time complexity: ${algorithm.complexity.average}`} aria-label={`Average time complexity: ${algorithm.complexity.average}`}>{algorithm.complexity.average.split(' when ')[0]}</span>
      </button>)}
    </nav>
  </aside>
}
