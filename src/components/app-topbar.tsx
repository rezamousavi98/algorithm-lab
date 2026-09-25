import { Moon, Sun } from 'lucide-react'
import type { AppTheme } from '@/domain/preferences/user-preferences'

const categories = [
  { label: 'Sorting', value: 'sorting', enabled: true },
  { label: 'Searching', value: 'searching', enabled: true },
  { label: 'Graphs', value: 'graphs', enabled: false },
  { label: 'Trees', value: 'trees', enabled: false },
  { label: 'Dynamic Programming', value: 'dynamic-programming', enabled: false },
  { label: 'Data Structures', value: 'data-structures', enabled: false },
] as const
type AppTopbarProps = Readonly<{ theme: AppTheme; category: 'sorting' | 'searching'; onCategoryChange: (category: 'sorting' | 'searching') => void; onThemeToggle: () => void }>

function Brand() {
  return <div className="brand"><div className="brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 37 33H3L20 4Z"/><circle cx="20" cy="24" r="4"/></svg></div><div><strong>Algorithm Lab</strong><span>Visualize. Understand. Explore.</span></div></div>
}

export function AppTopbar({ theme, category, onCategoryChange, onThemeToggle }: AppTopbarProps) {
  return <header className="topbar">
    <Brand />
    <nav className="category-nav" aria-label="Algorithm categories">
      {categories.map((item) => { const active = item.enabled && item.value === category; return <button key={item.value} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} disabled={!item.enabled} onClick={() => item.enabled && onCategoryChange(item.value)}><span>{item.label}</span>{!item.enabled && <small className="soon-badge">Soon</small>}</button> })}
    </nav>
    <div className="topbar-actions"><button className="icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={onThemeToggle}>{theme === 'dark' ? <Moon/> : <Sun/>}</button></div>
  </header>
}
