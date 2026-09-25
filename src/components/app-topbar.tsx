import { Moon, Sun } from 'lucide-react'
import algolabLogo from '@/assets/algolab-logo.png'
import type { AppTheme, EnabledCategory } from '@/domain/preferences/user-preferences'
import { CATEGORY_CATALOG, isEnabledCategory } from '@/features/catalog/catalog-metadata'

type AppTopbarProps = Readonly<{ theme: AppTheme; category: EnabledCategory; onCategoryChange: (category: EnabledCategory) => void; onThemeToggle: () => void }>

function Brand() {
  return <div className="brand"><div className="brand-mark"><img src={algolabLogo} alt="" aria-hidden="true"/></div><div><strong>Algorithm Lab</strong><span>Visualize. Understand. Explore.</span></div></div>
}

export function AppTopbar({ theme, category, onCategoryChange, onThemeToggle }: AppTopbarProps) {
  return <header className="topbar">
    <Brand />
    <nav className="category-nav" aria-label="Algorithm categories">
      {CATEGORY_CATALOG.map((item) => {
        const active = item.enabled && item.id === category
        const select = () => { if (isEnabledCategory(item.id)) onCategoryChange(item.id) }
        return <button key={item.id} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} disabled={!item.enabled} onClick={select}><span>{item.label}</span>{!item.enabled && <small className="soon-badge">Soon</small>}</button>
      })}
    </nav>
    <div className="topbar-actions"><button className="icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={onThemeToggle}>{theme === 'dark' ? <Moon/> : <Sun/>}</button></div>
  </header>
}
