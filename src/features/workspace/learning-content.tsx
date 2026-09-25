import type { AlgorithmLearningContent, VariableValue } from '@/domain/algorithms/types'

export function VariablesPanel({ variables }: { variables: Readonly<Record<string, VariableValue>> }) {
  return <div className="inspector-subsection"><h3>Runtime Variables</h3>{Object.keys(variables).length
    ? <dl className="variable-list">{Object.entries(variables).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}</dl>
    : <p className="muted-note">Variables appear here as the algorithm runs.</p>}</div>
}

export function PseudocodeView({ algorithm, lineId }: { algorithm: Pick<AlgorithmLearningContent, 'pseudocode'>; lineId: string | null }) {
  return <><h2>Execution Pseudocode</h2><p className="muted-note">The highlighted line follows the current event in the timeline.</p>
    <ol className="pseudocode-list">{algorithm.pseudocode.map((line, index) => <li key={line.id} className={lineId === line.id ? 'active' : ''} aria-current={lineId === line.id ? 'step' : undefined}><span className="line-number">{String(index + 1).padStart(2, '0')}</span><code style={{ paddingInlineStart: `${(line.indent ?? 0) * 13}px` }}>{line.code}</code></li>)}</ol>
  </>
}

export function ComplexityView({ algorithm }: { algorithm: Pick<AlgorithmLearningContent, 'complexity'> }) {
  return <><h2>Time &amp; Space Complexity</h2><p>Growth rates describe how work and memory change as the input gets larger.</p>
    <div className="complexity-grid">{(['best', 'average', 'worst', 'space'] as const).map(key => <div className={`complexity ${key}`} key={key}><span>{{ best: 'Best Case', average: 'Average Case', worst: 'Worst Case', space: 'Space Complexity' }[key]}</span><b>{algorithm.complexity[key]}</b></div>)}</div>
  </>
}
