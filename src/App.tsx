import { useEffect, useState } from 'react'
import {
  ArrowRight, BarChart3, Boxes, Check, ChevronDown, ChevronRight, CircleHelp,
  Command, Database, GitBranch, Grid2X2, Lightbulb, List, Moon,
  Pause, Play, RotateCcw, Search, Shuffle, SlidersHorizontal, Sun, X,
} from 'lucide-react'
import './App.css'

const barValues = [48, 66, 39, 72, 57, 48, 28, 18, 42, 22, 50, 33, 27, 61, 11, 15, 36, 9, 22, 50, 75, 37, 24, 12, 23, 9, 35, 23, 31, 20, 14, 39, 41, 31, 27, 25, 41, 35, 27, 34, 38, 40, 37, 31]
const algorithms = [
  { name: 'Bubble Sort', description: 'Repeatedly steps through the array and swaps adjacent elements.', level: 'Easy', complexity: 'O(n²)' },
  { name: 'Selection Sort', description: 'Finds the minimum element and places it at the beginning.', level: 'Easy', complexity: 'O(n²)' },
  { name: 'Insertion Sort', description: 'Builds the sorted array one element at a time.', level: 'Easy', complexity: 'O(n²)' },
  { name: 'Merge Sort', description: 'Divides the array and conquers by merging sorted subarrays.', level: 'Medium', complexity: 'O(n log n)' },
  { name: 'Quick Sort', description: 'Divide and conquer using a pivot element.', level: 'Medium', complexity: 'O(n log n)' },
  { name: 'Heap Sort', description: 'Uses a binary heap data structure.', level: 'Medium', complexity: 'O(n log n)' },
  { name: 'Counting Sort', description: 'Uses counting of elements in a limited range.', level: 'Medium', complexity: 'O(n + k)' },
  { name: 'Radix Sort', description: 'Sorts digit by digit.', level: 'Hard', complexity: 'O(nk)' },
  { name: 'Bucket Sort', description: 'Distributes elements into buckets.', level: 'Medium', complexity: 'O(n + k)' },
  { name: 'Shell Sort', description: 'Improved insertion sort with gaps.', level: 'Medium', complexity: 'O(n log n)' },
]

function Brand() {
  return <div className="brand"><div className="brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 37 33H3L20 4Z"/><circle cx="20" cy="24" r="4"/></svg></div><div><strong>Algorithm Lab</strong><span>Visualize. Understand. Explore.</span></div></div>
}

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => localStorage.getItem('algorithm-lab-theme') === 'light' ? 'light' : 'dark')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('Quick Sort')
  const [playing, setPlaying] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('algorithm-lab-theme', theme)
  }, [theme])

  const visibleAlgorithms = algorithms.filter((algorithm) => `${algorithm.name} ${algorithm.description}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <nav className="side-nav" aria-label="Main navigation">
          <button className="nav-item active"><SlidersHorizontal /><span>Sorting Algorithms</span></button>
          <button className="nav-item"><Search /><span>Searching Algorithms</span></button>
          <button className="nav-item"><GitBranch /><span>Graph Algorithms</span></button>
          <button className="nav-item"><Database /><span>Data Structures</span></button>
          <button className="nav-item disabled" disabled><Boxes /><span>Coming Soon</span></button>
        </nav>
        <div className="sidebar-note"><Lightbulb /><div><strong>Built for curious minds.</strong><p>Explore algorithms visually and build a deeper intuition for how they work.</p></div></div>
        <div className="sidebar-bottom"><span className="status-dot" /> Interactive learning lab <span>v1.0</span></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <label className="global-search"><Search size={17} /><input aria-label="Search algorithms and topics" placeholder="Search algorithms, topics..." /><kbd><Command size={11} /> K</kbd></label>
          <div className="topbar-actions"><button className="icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun /> : <Moon />}</button><button className="avatar" aria-label="Account menu">A</button></div>
        </header>

        <section className="workspace-grid" aria-label={`${selected} workspace`}>
          <div className="work-main">
            <div className="algorithm-heading">
              <div className="breadcrumbs"><span>Sorting Algorithms</span><ChevronRight size={14} /><strong>{selected}</strong></div>
              <div className="heading-row"><h1>{selected}</h1><span className="active-pill"><i /> Active</span></div>
              <p className="algorithm-description">A divide-and-conquer algorithm that picks a pivot element and partitions the array into elements less than and greater than the pivot.</p>
            </div>

            <div className="control-bar">
              <button className="button primary" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}{playing ? 'Pause' : 'Play'}</button>
              <button className="button" onClick={() => setPlaying(false)}><RotateCcw size={16} />Reset</button>
              <button className="button generate"><Shuffle size={16} />Generate New</button>
              <label className="control-select"><span>Array Size</span><select defaultValue="50" aria-label="Array size"><option>20</option><option>30</option><option>50</option><option>80</option></select><ChevronDown size={14} /></label>
              <label className="control-select speed-select"><span>Speed</span><select defaultValue="Medium" aria-label="Playback speed"><option>Slow</option><option>Medium</option><option>Fast</option></select><ChevronDown size={14} /></label>
            </div>

            <div className="visualizer-panel">
              <div className="chart-topline"><div className="legend"><span><i className="legend-swatch comparing"/>Comparing</span><span><i className="legend-swatch pivot"/>Pivot</span><span><i className="legend-swatch swapping"/>Swapping</span><span><i className="legend-swatch sorted"/>Sorted</span><span><i className="legend-swatch unsorted"/>Unsorted</span></div><div className="step-counter">Step <strong>124</strong><span>/</span>386</div></div>
              <div className="bars" role="img" aria-label="Sorting visualization. Bars show values in the array; orange bars are being compared, purple is the pivot, and green bars are sorted.">
                {barValues.map((height, index) => <div key={index} className={`bar ${index === 9 || index === 20 ? 'comparing' : ''} ${index === 21 ? 'pivot' : ''} ${index >= 38 ? 'sorted' : ''}`} style={{ height: `${height}%` }} />)}
              </div>
              <div className="chart-footer"><div className="chart-baseline"/><span>Array index</span></div>
            </div>
          </div>

          <aside className="inspector">
            <div className="inspector-tabs"><button className="selected">Overview</button><button>Pseudocode</button><button>Complexity</button></div>
            <div className="inspector-content">
              <h2>How It Works</h2>
              <p>Quick Sort picks a pivot element, partitions the array into elements less than and greater than the pivot, and then recursively sorts the subarrays.</p>
              <ol className="steps-list"><li><b>1</b><span>Choose a pivot element from the array.</span></li><li><b>2</b><span>Partition the array into two subarrays: elements less than the pivot and elements greater than the pivot.</span></li><li><b>3</b><span>Recursively apply the same process to the subarrays.</span></li><li><b>4</b><span>Combine the sorted subarrays (in-place).</span></li></ol>
              <h2 className="complexity-title">Time &amp; Space Complexity</h2>
              <div className="complexity-grid"><div className="complexity best"><span>Best Case</span><b>O(n log n)</b></div><div className="complexity average"><span>Average Case</span><b>O(n log n)</b></div><div className="complexity worst"><span>Worst Case</span><b>O(n²)</b></div><div className="complexity space"><span>Space Complexity</span><b>O(log n)</b></div></div>
              <h2 className="uses-title">Use Cases</h2><ul className="use-cases"><li>General-purpose sorting</li><li>Efficient for large datasets</li><li>Often used in standard libraries (e.g., std::sort)</li></ul>
            </div>
          </aside>
        </section>

        <section className="catalog-section">
          <div className="catalog-heading"><div><h2>Sorting Algorithms</h2><p>Explore and visualize popular sorting algorithms.</p></div><div className="catalog-actions"><label className="catalog-search"><Search size={16} /><input aria-label="Search sorting algorithms" placeholder="Search sorting algorithms..." value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}</label><div className="view-toggle"><button aria-label="Grid view" className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')}><Grid2X2 size={17} /></button><button aria-label="List view" className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')}><List size={17} /></button></div></div></div>
          <div className={`algorithm-cards ${view === 'list' ? 'list-view' : ''}`}>
            {visibleAlgorithms.map((algorithm, index) => <button className={`algorithm-card ${selected === algorithm.name ? 'current' : ''}`} key={algorithm.name} onClick={() => setSelected(algorithm.name)}>
              <span className={`mini-chart mini-${index % 4}`}><BarChart3 size={27} strokeWidth={1.5} /></span><span className="card-copy"><strong>{algorithm.name}</strong><span>{algorithm.description}</span></span><span className={`tag level-tag level-${algorithm.level.toLowerCase()}`}>{algorithm.level}</span><span className="tag complexity-tag">{algorithm.complexity}</span><span className="card-arrow"><ArrowRight size={15} /></span>
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
