import { MAX_BINARY_TREE_NODES, MAX_BINARY_TREE_TOKENS, type BinarySearchTree, type BinaryTree, type BinaryTreeNode, type SearchableTree, type TreeBuildResult, type TreeEntryInput, type TreeToken } from './types'

function freezeTree<TKind extends SearchableTree['kind']>(kind: TKind, rootId: string | null, nodes: readonly BinaryTreeNode[]): Extract<SearchableTree, { kind: TKind }> {
  const frozenNodes = Object.freeze([...nodes])
  const nodeById = Object.freeze(Object.fromEntries(frozenNodes.map(node => [node.id, node])))
  return Object.freeze({ kind, rootId, nodes: frozenNodes, nodeById }) as Extract<SearchableTree, { kind: TKind }>
}

function validateEntries(entries: readonly TreeEntryInput[]): string | null {
  if (!Array.isArray(entries)) return 'Tree entries must be provided as a list.'
  if (entries.length > MAX_BINARY_TREE_NODES) return `A tree can contain at most ${MAX_BINARY_TREE_NODES} input entries.`
  for (const [index, entry] of entries.entries()) {
    if (!entry || !Number.isSafeInteger(entry.key) || !Number.isSafeInteger(entry.value)) return `Entry ${index + 1} must contain safe-integer key and value fields.`
  }
  return null
}

/** Builds a BST in insertion order. Duplicate keys update their value and retain their original node ID. */
export function buildBinarySearchTree(entries: readonly TreeEntryInput[]): TreeBuildResult<BinarySearchTree> {
  const error = validateEntries(entries)
  if (error) return Object.freeze({ ok: false, error })
  const nodes: BinaryTreeNode[] = []
  let rootId: string | null = null
  for (const entry of entries) {
    if (rootId === null) {
      const id = `tree-node-${nodes.length}`
      nodes.push(Object.freeze({ id, layoutId: `layout-${id}`, key: entry.key, value: entry.value, leftId: null, rightId: null }))
      rootId = id
      continue
    }
    let currentId: string | null = rootId
    while (currentId !== null) {
      const currentIndex = nodes.findIndex(node => node.id === currentId)
      const current = nodes[currentIndex]
      if (entry.key === current.key) {
        nodes[currentIndex] = Object.freeze({ ...current, value: entry.value })
        break
      }
      const side = entry.key < current.key ? 'leftId' : 'rightId'
      if (current[side] !== null) { currentId = current[side]; continue }
      const id = `tree-node-${nodes.length}`
      nodes.push(Object.freeze({ id, layoutId: `layout-${id}`, key: entry.key, value: entry.value, leftId: null, rightId: null }))
      nodes[currentIndex] = Object.freeze({ ...current, [side]: id })
      currentId = null
    }
  }
  const tree = freezeTree('bst', rootId, nodes)
  const invariant = validateBinaryTree(tree)
  return invariant ? Object.freeze({ ok: false, error: invariant }) : Object.freeze({ ok: true, tree })
}

/**
 * Builds a general binary tree from level-order key:value tokens. Null consumes a child slot.
 * Once the queue has no parent slots, any remaining tokens are rejected as orphans.
 */
export function buildLevelOrderBinaryTree(tokens: readonly TreeToken[]): TreeBuildResult<BinaryTree> {
  if (!Array.isArray(tokens)) return Object.freeze({ ok: false, error: 'Tree tokens must be provided as a list.' })
  if (tokens.length > MAX_BINARY_TREE_TOKENS) return Object.freeze({ ok: false, error: `A tree input can contain at most ${MAX_BINARY_TREE_TOKENS} level-order tokens.` })
  if (tokens.length === 0) return Object.freeze({ ok: true, tree: freezeTree('binary-tree', null, []) })
  const root = tokens[0]
  if (root === null) {
    return tokens.length === 1
      ? Object.freeze({ ok: true, tree: freezeTree('binary-tree', null, []) })
      : Object.freeze({ ok: false, error: 'Tokens after an empty root are orphaned.' })
  }
  if (!root || !Number.isSafeInteger(root.key) || !Number.isSafeInteger(root.value)) return Object.freeze({ ok: false, error: 'Root token must contain safe-integer key and value fields.' })
  type MutableNode = { id: string; layoutId: string; key: number; value: number; leftId: string | null; rightId: string | null }
  const nodes: MutableNode[] = [{ id: 'tree-node-0', layoutId: 'layout-tree-node-0', key: root.key, value: root.value, leftId: null, rightId: null }]
  const parentQueue: number[] = [0]
  let head = 0
  let tokenIndex = 1
  while (tokenIndex < tokens.length) {
    if (head >= parentQueue.length) return Object.freeze({ ok: false, error: `Token ${tokenIndex + 1} is orphaned; all parent child slots are exhausted.` })
    const parentIndex = parentQueue[head++]
    const parent = nodes[parentIndex]
    for (const side of ['leftId', 'rightId'] as const) {
      if (tokenIndex >= tokens.length) break
      const token = tokens[tokenIndex++]
      if (token === null) continue
      if (!token || !Number.isSafeInteger(token.key) || !Number.isSafeInteger(token.value)) return Object.freeze({ ok: false, error: `Token ${tokenIndex} must be null or contain safe-integer key and value fields.` })
      if (nodes.length >= MAX_BINARY_TREE_NODES) return Object.freeze({ ok: false, error: `A tree can contain at most ${MAX_BINARY_TREE_NODES} nodes.` })
      const id = `tree-node-${nodes.length}`
      nodes.push({ id, layoutId: `layout-${id}`, key: token.key, value: token.value, leftId: null, rightId: null })
      parent[side] = id
      parentQueue.push(nodes.length - 1)
    }
  }
  const frozen = nodes.map(node => Object.freeze(node))
  const tree = freezeTree('binary-tree', 'tree-node-0', frozen)
  const invariant = validateBinaryTree(tree)
  return invariant ? Object.freeze({ ok: false, error: invariant }) : Object.freeze({ ok: true, tree })
}

export function findTreeNode(tree: SearchableTree, id: string): BinaryTreeNode | undefined {
  return tree.nodeById[id]
}

export function validateBinaryTree(tree: SearchableTree, requireBst = tree.kind === 'bst'): string | null {
  if (!tree || typeof tree !== 'object' || (tree.kind !== 'bst' && tree.kind !== 'binary-tree')) return 'Tree kind is unsupported.'
  if (!Array.isArray(tree.nodes) || tree.nodes.length > MAX_BINARY_TREE_NODES) return 'Tree node list is invalid or exceeds the node limit.'
  if (!tree.nodeById || typeof tree.nodeById !== 'object') return 'Tree node lookup must be an object.'
  if (tree.rootId === null) return tree.nodes.length === 0 && Object.keys(tree.nodeById).length === 0 ? null : 'An empty root cannot have nodes.'
  const byId = new Map<string, BinaryTreeNode>()
  for (const node of tree.nodes) {
    if (!node || typeof node.id !== 'string' || !node.id || byId.has(node.id)) return 'Tree node IDs must be present and unique.'
    if (node.layoutId !== `layout-${node.id}`) return `Node ${node.id} has an invalid deterministic layout ID.`
    if (!Number.isSafeInteger(node.key) || !Number.isSafeInteger(node.value)) return `Node ${node.id} must contain safe-integer key and value fields.`
    byId.set(node.id, node)
  }
  if (!byId.has(tree.rootId)) return 'Tree root does not identify a node.'
  const parents = new Map<string, number>()
  for (const node of tree.nodes) for (const childId of [node.leftId, node.rightId]) {
    if (childId === null) continue
    if (!byId.has(childId)) return `Node ${node.id} references missing child ${childId}.`
    const count = (parents.get(childId) ?? 0) + 1
    parents.set(childId, count)
  }
  const colors = new Map<string, 0 | 1 | 2>()
  for (const startId of byId.keys()) {
    if (colors.get(startId) === 2) continue
    const stack: { id: string; exiting: boolean }[] = [{ id: startId, exiting: false }]
    while (stack.length) {
      const item = stack.pop()!
      if (item.exiting) { colors.set(item.id, 2); continue }
      const color = colors.get(item.id) ?? 0
      if (color === 1) return `Tree contains a cycle at node ${item.id}.`
      if (color === 2) continue
      colors.set(item.id, 1)
      stack.push({ id: item.id, exiting: true })
      const node = byId.get(item.id)!
      if (node.rightId !== null) stack.push({ id: node.rightId, exiting: false })
      if (node.leftId !== null) stack.push({ id: node.leftId, exiting: false })
    }
  }
  if (parents.has(tree.rootId)) return 'Tree root cannot have a parent.'
  for (const [id, count] of parents) if (count > 1) return `Node ${id} has multiple parents.`
  const seen = new Set<string>()
  const pending: { id: string; min: number | null; max: number | null }[] = [{ id: tree.rootId, min: null, max: null }]
  while (pending.length) {
    const item = pending.pop()!
    if (seen.has(item.id)) return `Tree contains a cycle at node ${item.id}.`
    seen.add(item.id)
    const node = byId.get(item.id)!
    if (requireBst && (item.min !== null && node.key <= item.min || item.max !== null && node.key >= item.max)) return `Node ${node.id} violates strict BST ordering.`
    if (node.rightId !== null) pending.push({ id: node.rightId, min: node.key, max: item.max })
    if (node.leftId !== null) pending.push({ id: node.leftId, min: item.min, max: node.key })
  }
  if (seen.size !== tree.nodes.length) return 'Tree contains unreachable nodes.'
  if (Object.keys(tree.nodeById).length !== tree.nodes.length || tree.nodes.some(node => tree.nodeById[node.id] !== node)) return 'Tree node lookup does not match its node list.'
  return null
}
