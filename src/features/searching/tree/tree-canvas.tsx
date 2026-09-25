import { useMemo, useRef, useState } from 'react'
import type { TreeSearchVisualizationState } from '@/domain/algorithms/searching/tree'
import { layoutBinaryTree } from './tree-layout'
import { TreeNodeSvg } from './tree-node-svg'

export function TreeCanvas({ state }: { state: TreeSearchVisualizationState }) {
  const viewport = useRef<HTMLDivElement>(null)
  const layout = useMemo(() => layoutBinaryTree(state.tree), [state.tree])
  const [scale, setScale] = useState(1)
  const visited = new Set(state.visitedNodeIds)
  const queued = new Set(state.frontier.map(item => item.nodeId))
  const onPath = new Set(state.activePath)
  const moveToTop = (nextScale: number) => {
    setScale(nextScale)
    if (viewport.current) viewport.current.scrollTo({ left: 0, top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  const fitWidth = () => {
    const width = viewport.current?.clientWidth ?? layout.width
    moveToTop(Math.max(0.65, Math.min(1, width / layout.width)))
  }
  const empty = state.tree.rootId === null
  return <section className="tree-canvas-panel" aria-label="Tree visualization">
    <div className="tree-canvas-toolbar">
      <span>{state.tree.kind === 'bst' ? 'Binary Search Tree' : 'General Binary Tree'} · {state.tree.nodes.length} nodes</span>
      <div><button type="button" onClick={fitWidth}>Fit width</button><button type="button" onClick={() => moveToTop(1)}>Reset view</button></div>
    </div>
    <div ref={viewport} className="tree-canvas-viewport" role="region" tabIndex={0} aria-label="Scrollable tree canvas. Use the scroll bar, trackpad, or Page Up and Page Down when focused.">
      {empty ? <p className="tree-empty">The tree is empty. Apply a preset or enter nodes to build one.</p> : <svg className="tree-canvas-svg" role="img" aria-label={`${state.tree.kind === 'bst' ? 'Binary search tree' : 'Binary tree'} with ${state.tree.nodes.length} nodes`} width={layout.width * scale} height={layout.height * scale} viewBox={`0 0 ${layout.width} ${layout.height}`}>
        <title>{state.tree.kind === 'bst' ? 'Binary Search Tree' : 'General Binary Tree'}</title>
        {state.tree.nodes.map(node => {
          const from = layout.points[node.id]
          return (['left', 'right'] as const).map(side => {
            const childId = node[side === 'left' ? 'leftId' : 'rightId']
            if (!childId) return null
            const to = layout.points[childId]
            const activeEdge = state.activePath.includes(node.id) && state.activePath.includes(childId)
            return <line key={`${node.id}-${side}`} className={`tree-edge ${activeEdge ? 'active' : ''}`} x1={from.x} y1={from.y + 26} x2={to.x} y2={to.y - 26}/>
          })
        })}
        {state.tree.nodes.map(node => <TreeNodeSvg key={node.layoutId} node={node} point={layout.points[node.id]} active={state.activeNodeId === node.id} visited={visited.has(node.id)} queued={queued.has(node.id)} onPath={onPath.has(node.id)} found={state.result.status === 'found' && state.result.nodeId === node.id}/>)}
      </svg>}
    </div>
    <p className="tree-canvas-help">Scroll inside this canvas to explore large or skewed trees. Node positions stay fixed during playback.</p>
  </section>
}
