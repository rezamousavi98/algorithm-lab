import { defineTreeSearchAlgorithm, makeTreeSearchPseudocode } from './shared'
import type { TreeSearchEvent, TreeSearchInput } from './types'
import type { BinaryTreeNode } from '../../../structures/binary-tree/types'

const pseudocode = makeTreeSearchPseudocode([
  ['start', 'node = root'], ['empty', 'while node != null'], ['visit', 'visit(node)'],
  ['compare', 'if target == node.key, return node.value'], ['left', 'if target < node.key, node = node.left'],
  ['right', 'otherwise node = node.right'], ['missing', 'return not found'], ['found', 'return node.value'],
])

function* execute(input: TreeSearchInput): Generator<TreeSearchEvent, void, undefined> {
  const { tree, target } = input
  const rootId = tree.rootId
  const parent = new Map<string, string>()
  yield { type: 'pseudocode', lineId: 'start' }
  if (rootId === null) {
    yield { type: 'explanation', message: 'The BST is empty, so no node can match.' }
    yield { type: 'pseudocode', lineId: 'missing' }
    yield { type: 'treeResult', result: 'not-found' }
    return
  }
  let nodeId: string | null = rootId
  let depth = 0
  yield { type: 'treeFrontier', action: 'push', mode: 'stack', nodeId, depth }
  while (nodeId !== null) {
    yield { type: 'pseudocode', lineId: 'empty' }
    yield { type: 'treeFrontier', action: 'pop', mode: 'stack', nodeId, depth }
    const currentNodeId: string = nodeId
    const node: BinaryTreeNode = tree.nodeById[currentNodeId]
    const path: string[] = []
    for (let id: string | undefined = currentNodeId; id; id = parent.get(id)) path.push(id)
    path.reverse()
    yield { type: 'treePath', nodeIds: path }
    yield { type: 'pseudocode', lineId: 'visit' }
    yield { type: 'treeVisit', nodeId, depth }
    yield { type: 'treeCompare', nodeId, key: node.key, target }
    yield { type: 'variable', name: 'nodeKey', value: node.key }
    yield { type: 'variable', name: 'depth', value: depth }
    if (node.key === target) {
      yield { type: 'pseudocode', lineId: 'compare' }
      yield { type: 'explanation', message: `Found ${target}. BST ordering let the search discard the other subtree at each earlier comparison.` }
      yield { type: 'pseudocode', lineId: 'found' }
      yield { type: 'treeResult', result: 'found', nodeId }
      return
    }
    const side: 'left' | 'right' = target < node.key ? 'left' : 'right'
    const nextId: string | null = side === 'left' ? node.leftId : node.rightId
    yield { type: 'pseudocode', lineId: side }
    if (nextId === null) {
      yield { type: 'explanation', message: `${side === 'left' ? 'Left' : 'Right'} child of ${node.key} is empty; BST ordering proves ${target} is absent.` }
      yield { type: 'pseudocode', lineId: 'missing' }
      yield { type: 'treeResult', result: 'not-found' }
      return
    }
    parent.set(nextId, currentNodeId)
    yield { type: 'treeFollow', fromId: currentNodeId, toId: nextId, side }
    nodeId = nextId
    depth += 1
    yield { type: 'treeFrontier', action: 'push', mode: 'stack', nodeId: nextId, depth }
  }
}

export const bstLookup = defineTreeSearchAlgorithm({
  id: 'bst-lookup', name: 'Binary Search Tree Lookup', shortDescription: 'Follow ordered child links', displayOrder: 10,
  description: 'Compare at each node and follow only the child whose key range can contain the target. This requires strict BST ordering.',
  requiresTree: 'bst', useCases: ['Lookup in ordered search trees', 'See how tree shape affects search depth'],
  complexity: { best: 'O(1)', average: 'O(h)', worst: 'O(n) when skewed', space: 'O(1) algorithm state; path/history uses UI memory' },
  pseudocode, execute,
})
