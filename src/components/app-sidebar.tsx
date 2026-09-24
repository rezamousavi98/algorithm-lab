import { Boxes, Database, GitBranch, Lightbulb, Search, SlidersHorizontal } from 'lucide-react'

function Brand() {
  return <div className="brand"><div className="brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 37 33H3L20 4Z"/><circle cx="20" cy="24" r="4"/></svg></div><div><strong>Algorithm Lab</strong><span>Visualize. Understand. Explore.</span></div></div>
}

export function AppSidebar() {
  return <aside className="sidebar">
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
}
