import type { SearchableTree } from '@/domain/structures/binary-tree'

export type TreePoint = Readonly<{ x: number; y: number; depth: number }>
export type TreeLayout = Readonly<{ width: number; height: number; points: Readonly<Record<string, TreePoint>> }>

/** Stable inorder x positions and depth-based y positions, independent of playback state. */
export function layoutBinaryTree(tree: SearchableTree): TreeLayout {
  const points: Record<string, TreePoint> = {}
  let inorderIndex = 0
  let maxDepth = 0
  function place(id: string | null, depth: number): void {
    if (id === null) return
    const node = tree.nodeById[id]
    place(node.leftId, depth + 1)
    points[id] = Object.freeze({ x: 72 + inorderIndex * 150, y: 58 + depth * 88, depth })
    inorderIndex += 1
    maxDepth = Math.max(maxDepth, depth)
    place(node.rightId, depth + 1)
  }
  place(tree.rootId, 0)
  return Object.freeze({ width: Math.max(720, 144 + Math.max(0, inorderIndex - 1) * 150), height: Math.max(300, 116 + maxDepth * 88), points: Object.freeze(points) })
}
