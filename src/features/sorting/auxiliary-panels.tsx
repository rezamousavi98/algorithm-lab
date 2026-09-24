import type { SortingAuxiliaryPanel } from '@/domain/algorithms/types'

export function AuxiliaryPanels({ panels }: Readonly<{ panels: readonly SortingAuxiliaryPanel[] }>) {
  if (panels.length === 0) return null
  return <div className="auxiliary-panels" aria-label="Auxiliary algorithm state">
    {panels.map((panel) => <div className="auxiliary-panel" key={panel.id}>
      <strong>{panel.label}</strong><span className="auxiliary-count">{panel.values.length} values</span>
      <div className="auxiliary-values" aria-label={`${panel.label}, ${panel.values.length} values`}>
        {panel.values.slice(0, 80).map((value, index) => <span key={index}>{value}</span>)}
        {panel.values.length > 80 && <span className="more-values">+{panel.values.length - 80} more</span>}
      </div>
    </div>)}
  </div>
}
