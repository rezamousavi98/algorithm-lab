import { BarChart3 } from 'lucide-react'
import type { AlgorithmSummary } from '@/domain/algorithms/types'

type AppSidebarProps = Readonly<{ algorithms: readonly AlgorithmSummary[]; selectedId: string; onSelect: (algorithmId: string) => void }>

export function AppSidebar({ algorithms, selectedId, onSelect }: AppSidebarProps) {

  return <aside id="sorting-algorithms" tabIndex={-1} className="sidebar" aria-label="Sorting algorithms">
    <div className="sidebar-heading"><h2>Sorting Algorithms</h2><span>{algorithms.length}</span></div>
    <nav className="algorithm-nav" aria-label="Choose a sorting algorithm">
      {algorithms.map((algorithm, index) => <button key={algorithm.id} className={`algorithm-nav-item ${selectedId === algorithm.id ? 'selected' : ''}`} aria-current={selectedId === algorithm.id ? 'page' : undefined} onClick={() => onSelect(algorithm.id)}>
        <span className={`algorithm-nav-icon mini-${index % 4}`}><BarChart3 size={20}/></span>
        <span className="algorithm-nav-copy"><strong>{algorithm.name}</strong><small>{algorithm.shortDescription}</small></span>
        <span className="algorithm-nav-complexity">{algorithm.complexity.average}</span>
      </button>)}
    </nav>
  </aside>
}
