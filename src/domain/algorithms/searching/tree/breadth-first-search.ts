import { defineTreeSearchAlgorithm, makeTreeSearchPseudocode } from './shared'
import type { TreeSearchEvent, TreeSearchInput } from './types'

const pseudocode = makeTreeSearchPseudocode([
  ['enqueue-root', 'enqueue(root)'], ['while', 'while queue is not empty'], ['dequeue', 'node = dequeue()'], ['visit', 'visit(node)'],
  ['compare', 'if node.key == target, return node'], ['left', 'enqueue(node.left)'], ['right', 'enqueue(node.right)'], ['missing', 'return not found'],
])
function* execute({ tree, target }: TreeSearchInput): Generator<TreeSearchEvent, void, undefined> {
  const rootId = tree.rootId
  if (rootId === null) {
    yield { type: 'explanation', message: 'The binary tree is empty.' }
    yield { type: 'pseudocode', lineId: 'missing' }
    yield { type: 'treeResult', result: 'not-found' }
    return
  }
  const queue: { nodeId: string; depth: number }[] = [{ nodeId: rootId, depth: 0 }]
  const parent = new Map<string, string>()
  let head = 0
  yield { type: 'pseudocode', lineId: 'enqueue-root' }
  yield { type: 'treeFrontier', action: 'push', mode: 'queue', ...queue[0] }
  while (head < queue.length) {
    yield { type: 'pseudocode', lineId: 'while' }
    const item = queue[head++]
    yield { type: 'pseudocode', lineId: 'dequeue' }
    yield { type: 'treeFrontier', action: 'pop', mode: 'queue', ...item }
    const node = tree.nodeById[item.nodeId]
    const path: string[] = []
    for (let id: string | undefined = item.nodeId; id; id = parent.get(id)) path.push(id)
    path.reverse()
    yield { type: 'treePath', nodeIds: path }
    yield { type: 'pseudocode', lineId: 'visit' }
    yield { type: 'treeVisit', nodeId: item.nodeId, depth: item.depth }
    yield { type: 'treeCompare', nodeId: item.nodeId, key: node.key, target }
    yield { type: 'variable', name: 'nodeKey', value: node.key }
    yield { type: 'variable', name: 'depth', value: item.depth }
    yield { type: 'variable', name: 'queueHead', value: head - 1 }
    yield { type: 'variable', name: 'queueBack', value: queue.length - 1 }
    if (node.key === target) {
      yield { type: 'pseudocode', lineId: 'compare' }
      yield { type: 'explanation', message: `Found ${target} at depth ${item.depth}. Breadth-first search visits the tree level by level.` }
      yield { type: 'treeResult', result: 'found', nodeId: item.nodeId }
      return
    }
    for (const side of ['left', 'right'] as const) {
      const childId = node[side === 'left' ? 'leftId' : 'rightId']
      if (childId === null) continue
      yield { type: 'pseudocode', lineId: side }
      yield { type: 'treeFollow', fromId: item.nodeId, toId: childId, side }
      parent.set(childId, item.nodeId)
      const child = { nodeId: childId, depth: item.depth + 1 }
      queue.push(child)
      yield { type: 'treeFrontier', action: 'push', mode: 'queue', ...child }
    }
  }
  yield { type: 'explanation', message: 'Every reachable node was visited in level order without finding the target.' }
  yield { type: 'pseudocode', lineId: 'missing' }
  yield { type: 'treeResult', result: 'not-found' }
}
export const breadthFirstTreeSearch = defineTreeSearchAlgorithm({
  id: 'tree-bfs-search', name: 'Breadth-First Search', shortDescription: 'Search level by level with a queue', displayOrder: 30,
  description: 'Searches arbitrary binary trees level by level, enqueueing left children before right children. It does not require key ordering.', requiresTree: 'binary-tree',
  useCases: ['Find the shallowest occurrence', 'Inspect level-order behavior in sparse and wide trees'],
  complexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(w) queue for maximum width w; excludes history and path display' }, pseudocode, execute,
})
