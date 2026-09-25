import { defineTreeSearchAlgorithm, makeTreeSearchPseudocode } from './shared'
import type { TreeSearchEvent, TreeSearchInput } from './types'

const pseudocode = makeTreeSearchPseudocode([
  ['push-root', 'push(root)'], ['while', 'while stack is not empty'], ['pop', 'node = pop()'], ['visit', 'visit(node)'],
  ['compare', 'if node.key == target, return node'], ['push-right', 'push(node.right)'], ['push-left', 'push(node.left)'], ['missing', 'return not found'],
])
function* execute({ tree, target }: TreeSearchInput): Generator<TreeSearchEvent, void, undefined> {
  const rootId = tree.rootId
  if (rootId === null) {
    yield { type: 'explanation', message: 'The binary tree is empty.' }
    yield { type: 'pseudocode', lineId: 'missing' }
    yield { type: 'treeResult', result: 'not-found' }
    return
  }
  const stack: { nodeId: string; depth: number }[] = [{ nodeId: rootId, depth: 0 }]
  const parent = new Map<string, string>()
  yield { type: 'pseudocode', lineId: 'push-root' }
  yield { type: 'treeFrontier', action: 'push', mode: 'stack', ...stack[0] }
  while (stack.length > 0) {
    yield { type: 'pseudocode', lineId: 'while' }
    const item = stack.pop()!
    yield { type: 'pseudocode', lineId: 'pop' }
    yield { type: 'treeFrontier', action: 'pop', mode: 'stack', ...item }
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
    if (node.key === target) {
      yield { type: 'pseudocode', lineId: 'compare' }
      yield { type: 'explanation', message: `Found ${target} in preorder. A general binary tree has no key ordering to prune branches.` }
      yield { type: 'treeResult', result: 'found', nodeId: item.nodeId }
      return
    }
    for (const side of ['right', 'left'] as const) {
      const childId = node[side === 'left' ? 'leftId' : 'rightId']
      if (childId === null) continue
      yield { type: 'pseudocode', lineId: side === 'left' ? 'push-left' : 'push-right' }
      yield { type: 'treeFollow', fromId: item.nodeId, toId: childId, side }
      parent.set(childId, item.nodeId)
      const child = { nodeId: childId, depth: item.depth + 1 }
      stack.push(child)
      yield { type: 'treeFrontier', action: 'push', mode: 'stack', ...child }
    }
  }
  yield { type: 'explanation', message: 'Every reachable node was visited in preorder without finding the target.' }
  yield { type: 'pseudocode', lineId: 'missing' }
  yield { type: 'treeResult', result: 'not-found' }
}
export const depthFirstTreeSearch = defineTreeSearchAlgorithm({
  id: 'tree-dfs-search', name: 'Depth-First Search', shortDescription: 'Search preorder with a stack', displayOrder: 20,
  description: 'Searches an arbitrary binary tree in preorder: node, left subtree, right subtree. Key ordering cannot prune a general tree.', requiresTree: 'binary-tree',
  useCases: ['Explore every branch of an unordered tree', 'Compare preorder with level-order results for duplicate keys'],
  complexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(h) frontier for binary trees; excludes history and path display' }, pseudocode, execute,
})
