import { Moon, Sun } from 'lucide-react'
import type { AppTheme } from '@/domain/preferences/user-preferences'

const categories = ['Sorting', 'Searching', 'Graphs', 'Trees', 'Dynamic Programming', 'Data Structures'] as const
type AppTopbarProps = Readonly<{ theme: AppTheme; onThemeToggle: () => void }>

function Brand() {
  return <div className="brand"><div className="brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 37 33H3L20 4Z"/><circle cx="20" cy="24" r="4"/></svg></div><div><strong>Algorithm Lab</strong><span>Visualize. Understand. Explore.</span></div></div>
}

export function AppTopbar({ theme, onThemeToggle }: AppTopbarProps) {
  return <header className="topbar">
    <Brand />
    <nav className="category-nav" aria-label="Algorithm categories">
      {categories.map((category, index) => <button key={category} className={index === 0 ? 'active' : ''} aria-current={index === 0 ? 'page' : undefined} disabled={index !== 0}><span>{category}</span>{index !== 0 && <small className="soon-badge">Soon</small>}</button>)}
    </nav>
    <div className="topbar-actions"><button className="icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={onThemeToggle}>{theme === 'dark' ? <Moon/> : <Sun/>}</button></div>
  </header>
}
