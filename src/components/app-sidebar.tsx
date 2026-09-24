import { BarChart3 } from 'lucide-react'
import { algorithmRegistry } from '@/domain/algorithms/registry'

const subtitleById: Readonly<Record<string, string>> = {
  'quick-sort': 'Divide and conquer', 'merge-sort': 'Divide and conquer', 'heap-sort': 'Binary heap',
  'bubble-sort': 'Simple comparison', 'selection-sort': 'Find minimum', 'insertion-sort': 'Build sorted array',
  'shell-sort': 'Gap insertion', 'counting-sort': 'Count occurrences', 'radix-sort': 'Sort by digits',
  'cocktail-shaker-sort': 'Bidirectional bubble',
}
const sidebarOrder = ['quick-sort', 'merge-sort', 'heap-sort', 'bubble-sort', 'selection-sort', 'insertion-sort', 'shell-sort', 'counting-sort', 'radix-sort', 'cocktail-shaker-sort']

type AppSidebarProps = Readonly<{ selectedId: string; onSelect: (algorithmId: string) => void }>

export function AppSidebar({ selectedId, onSelect }: AppSidebarProps) {
  const algorithms = [...algorithmRegistry.definitions].sort((first, second) => sidebarOrder.indexOf(first.id) - sidebarOrder.indexOf(second.id))
  return <aside className="sidebar" aria-label="Sorting algorithms">
    <div className="sidebar-heading"><h2>Sorting Algorithms</h2><span>{algorithms.length}</span></div>
    <nav className="algorithm-nav" aria-label="Choose a sorting algorithm">
      {algorithms.map((algorithm, index) => <button key={algorithm.id} className={`algorithm-nav-item ${selectedId === algorithm.id ? 'selected' : ''}`} aria-current={selectedId === algorithm.id ? 'page' : undefined} onClick={() => onSelect(algorithm.id)}>
        <span className={`algorithm-nav-icon mini-${index % 4}`}><BarChart3 size={20}/></span>
        <span className="algorithm-nav-copy"><strong>{algorithm.name}</strong><small>{subtitleById[algorithm.id] ?? algorithm.category}</small></span>
        <span className="algorithm-nav-complexity">{algorithm.complexity.average}</span>
      </button>)}
    </nav>
  </aside>
}
