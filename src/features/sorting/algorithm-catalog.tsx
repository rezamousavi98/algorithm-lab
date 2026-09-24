import { useState } from 'react'
import { ArrowRight, BarChart3, Check, CircleHelp, Grid2X2, List, Search, X } from 'lucide-react'
import { algorithmRegistry } from '@/domain/algorithms/registry'

const difficultyById: Readonly<Record<string, string>> = {
  'bubble-sort': 'Easy', 'selection-sort': 'Easy', 'insertion-sort': 'Easy', 'cocktail-shaker-sort': 'Easy',
  'merge-sort': 'Medium', 'quick-sort': 'Medium', 'heap-sort': 'Medium', 'shell-sort': 'Medium',
  'counting-sort': 'Medium', 'radix-sort': 'Hard',
}

type AlgorithmCatalogProps = Readonly<{ selectedId: string; onSelect: (algorithmId: string) => void }>

export function AlgorithmCatalog({ selectedId, onSelect }: AlgorithmCatalogProps) {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const algorithms = algorithmRegistry.definitions.map((algorithm) => ({ ...algorithm, level: difficultyById[algorithm.id] ?? 'Medium' }))
  const visibleAlgorithms = algorithms.filter((algorithm) => `${algorithm.name} ${algorithm.description}`.toLowerCase().includes(query.toLowerCase()))

  return <section className="catalog-section" id="sorting-algorithms">
    <div className="catalog-heading"><div><h2>Sorting Algorithms</h2><p>Explore and visualize popular sorting algorithms.</p></div><div className="catalog-actions">
      <label className="catalog-search"><Search size={16}/><input aria-label="Search sorting algorithms" placeholder="Search sorting algorithms..." value={query} onChange={(event) => setQuery(event.target.value)}/>{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={14}/></button>}</label>
      <div className="view-toggle"><button aria-label="Grid view" aria-pressed={view === 'grid'} className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')}><Grid2X2 size={17}/></button><button aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')}><List size={17}/></button></div>
    </div></div>
    <div className={`algorithm-cards ${view === 'list' ? 'list-view' : ''}`}>
      {visibleAlgorithms.map((algorithm, index) => <button className={`algorithm-card ${selectedId === algorithm.id ? 'current' : ''}`} key={algorithm.id} aria-pressed={selectedId === algorithm.id} onClick={() => onSelect(algorithm.id)}>
        <span className={`mini-chart mini-${index % 4}`}><BarChart3 size={27} strokeWidth={1.5}/></span><span className="card-copy"><strong>{algorithm.name}</strong><span>{algorithm.description}</span></span><span className={`tag level-tag level-${algorithm.level.toLowerCase()}`}>{algorithm.level}</span><span className="tag complexity-tag">{algorithm.complexity.average}</span><span className="card-arrow"><ArrowRight size={15}/></span>
      </button>)}
      {visibleAlgorithms.length === 0 && <div className="empty-search"><CircleHelp size={18}/>No sorting algorithms match “{query}”.</div>}
    </div>
    <div className="catalog-footer"><span>Showing {visibleAlgorithms.length} of {algorithms.length} algorithms</span><button type="button">View all algorithms <ArrowRight size={14}/></button></div>
  </section>
}

export function AppFooter() {
  return <footer className="page-footer"><span>Algorithm Lab <span className="footer-separator">/</span> Learn algorithms by watching them think.</span><span>Built for curious minds <Check size={13}/></span></footer>
}
