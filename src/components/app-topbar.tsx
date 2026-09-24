import { Command, Moon, Search, Sun } from 'lucide-react'
import type { AppTheme } from '@/domain/preferences/user-preferences'

type AppTopbarProps = Readonly<{ theme: AppTheme; onThemeToggle: () => void }>

export function AppTopbar({ theme, onThemeToggle }: AppTopbarProps) {
  return <header className="topbar">
    <label className="global-search"><Search size={17}/><input aria-label="Search algorithms and topics" placeholder="Search algorithms, topics..."/><kbd><Command size={11}/> K</kbd></label>
    <div className="topbar-actions"><button className="icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={onThemeToggle}>{theme === 'dark' ? <Sun/> : <Moon/>}</button><button className="avatar" aria-label="Account menu">A</button></div>
  </header>
}
