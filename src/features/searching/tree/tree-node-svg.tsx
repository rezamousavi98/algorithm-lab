import type { BinaryTreeNode } from '@/domain/structures/binary-tree'
import type { TreePoint } from './tree-layout'

export function TreeNodeSvg({ node, point, active, visited, queued, onPath, found }: {
  node: BinaryTreeNode; point: TreePoint; active: boolean; visited: boolean; queued: boolean; onPath: boolean; found: boolean
}) {
  const stateClass = [active && 'active', visited && 'visited', queued && 'queued', onPath && 'on-path', found && 'found'].filter(Boolean).join(' ')
  return <g className={`tree-node ${stateClass}`} transform={`translate(${point.x} ${point.y})`} aria-label={`Node key ${node.key}, value ${node.value}, depth ${point.depth}`}>
    <title>Key {node.key}; value {node.value}; depth {point.depth}</title>
    <circle r="25"/>
    <text className="tree-node-key" y="-2">{node.key}</text>
    <text className="tree-node-value" y="13">value {node.value}</text>
  </g>
}
