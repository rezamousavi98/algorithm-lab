import { useId, useState, type ReactNode, type KeyboardEvent } from 'react'

const TABS = ['overview', 'pseudocode', 'complexity'] as const
export type InspectorTab = typeof TABS[number]

export function InspectorTabs({ name, children }: Readonly<{ name: string; children: (tab: InspectorTab) => ReactNode }>) {
  const id = useId()
  const [tab, setTab] = useState<InspectorTab>('overview')
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? TABS[0] : event.key === 'End' ? TABS[2]
      : TABS[(TABS.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length]
    setTab(next)
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)?.focus()
  }
  return <aside className="inspector">
    <div className="inspector-tabs" role="tablist" aria-label={`${name} learning panels`} onKeyDown={onKeyDown}>
      {TABS.map(item => <button key={item} id={`${id}-${item}`} data-tab={item} type="button" role="tab" aria-selected={tab === item} aria-controls={`${id}-panel`} tabIndex={tab === item ? 0 : -1} className={tab === item ? 'selected' : ''} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
    </div>
    <div className="inspector-content" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`}>{children(tab)}</div>
  </aside>
}
