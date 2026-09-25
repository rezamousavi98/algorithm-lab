import { findTreeNode } from '../structures/binary-tree'
import type { TreeSearchEvent, TreeSearchInput, TreeSearchMetrics, TreeSearchVisualizationState } from '../algorithms/searching/tree/types'
import type { VariableValue } from '../algorithms/types'

const ZERO_METRICS: TreeSearchMetrics = Object.freeze({ steps: 0, visits: 0, comparisons: 0, frontierPeak: 0 })
export class TreeSearchSimulationError extends Error {
  constructor(message: string) { super(message); this.name = 'TreeSearchSimulationError' }
}

export function createInitialTreeSearchState(input: TreeSearchInput): TreeSearchVisualizationState {
  return Object.freeze({ tree: input.tree, target: input.target, activeNodeId: null, activeDepth: null, activeCompared: false,
    frontierMode: null, frontier: Object.freeze([]), visitedNodeIds: Object.freeze([]), activePath: Object.freeze([]), variables: Object.freeze({}),
    currentMessage: null, currentPseudocodeLineId: null, activeEvent: null, result: Object.freeze({ status: 'pending' }), metrics: ZERO_METRICS })
}
function validVariable(value: unknown): value is VariableValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(validVariable)
  return typeof value === 'object' && Object.values(value).every(validVariable)
}
export function isTreeSearchEvent(event: unknown): event is TreeSearchEvent {
  if (!event || typeof event !== 'object' || !('type' in event)) return false
  const value = event as Record<string, unknown>
  switch (value.type) {
    case 'treeFrontier': return ['push', 'pop'].includes(String(value.action)) && ['stack', 'queue'].includes(String(value.mode)) && typeof value.nodeId === 'string' && Number.isInteger(value.depth)
    case 'treeFollow': return typeof value.fromId === 'string' && typeof value.toId === 'string' && ['left', 'right'].includes(String(value.side))
    case 'treeVisit': return typeof value.nodeId === 'string' && Number.isInteger(value.depth)
    case 'treeCompare': return typeof value.nodeId === 'string' && Number.isSafeInteger(value.key) && Number.isSafeInteger(value.target)
    case 'treePath': return Array.isArray(value.nodeIds) && value.nodeIds.every(id => typeof id === 'string')
    case 'treeResult': return value.result === 'not-found' || value.result === 'found' && typeof value.nodeId === 'string'
    case 'variable': return typeof value.name === 'string' && validVariable(value.value)
    case 'explanation': return typeof value.message === 'string'
    case 'pseudocode': return typeof value.lineId === 'string'
    default: return false
  }
}
function isEdge(state: TreeSearchVisualizationState, fromId: string, toId: string): boolean {
  const from = findTreeNode(state.tree, fromId)
  return !!from && (from.leftId === toId || from.rightId === toId)
}
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new TreeSearchSimulationError(message) }

export function reduceTreeSearchEvent(state: TreeSearchVisualizationState, event: TreeSearchEvent): TreeSearchVisualizationState {
  assert(state.result.status === 'pending', 'No events may follow a completed tree search.')
  let next: TreeSearchVisualizationState = state
  switch (event.type) {
    case 'treeFrontier': {
      const node = findTreeNode(state.tree, event.nodeId)
      assert(node && event.depth >= 0 && event.depth < state.tree.nodes.length + 1, 'Frontier item must reference a tree node and valid depth.')
      assert(state.frontierMode === null || state.frontierMode === event.mode, 'Frontier mode cannot change during a search.')
      if (event.action === 'push') {
        const validRoot = state.frontier.length === 0 && state.metrics.visits === 0 && event.nodeId === state.tree.rootId && event.depth === 0
        const followsActive = state.activeNodeId !== null && state.activeDepth !== null && state.activeEvent?.type === 'treeFollow'
          && state.activeEvent.toId === event.nodeId && event.depth === state.activeDepth + 1
        assert(validRoot || followsActive, 'Only the root or a followed child may enter the frontier.')
        const frontier = Object.freeze([...state.frontier, Object.freeze({ nodeId: event.nodeId, depth: event.depth })])
        next = { ...state, frontierMode: event.mode, frontier, metrics: { ...state.metrics, frontierPeak: Math.max(state.metrics.frontierPeak, frontier.length) } }
      } else {
        const expected = event.mode === 'stack' ? state.frontier.at(-1) : state.frontier[0]
        assert(expected?.nodeId === event.nodeId && expected.depth === event.depth, `Frontier ${event.mode} pop order is invalid.`)
        const frontier = Object.freeze(event.mode === 'stack' ? state.frontier.slice(0, -1) : state.frontier.slice(1))
        next = { ...state, frontierMode: event.mode, frontier, activeNodeId: event.nodeId, activeDepth: event.depth, activeCompared: false }
      }
      break
    }
    case 'treeFollow':
      assert(state.activeNodeId === event.fromId && state.visitedNodeIds.includes(event.fromId), 'Follow source must be the active visited node.')
      assert(isEdge(state, event.fromId, event.toId), 'Follow event must reference an actual parent-child edge.')
      assert(findTreeNode(state.tree, event.fromId)?.[event.side === 'left' ? 'leftId' : 'rightId'] === event.toId, 'Follow direction does not match its edge.')
      break
    case 'treeVisit':
      assert(state.activeNodeId === event.nodeId && state.activeDepth === event.depth, 'Only the active frontier node may be visited.')
      assert(!state.visitedNodeIds.includes(event.nodeId), 'A node cannot be visited twice.')
      next = { ...state, visitedNodeIds: Object.freeze([...state.visitedNodeIds, event.nodeId]), metrics: { ...state.metrics, visits: state.metrics.visits + 1 } }
      break
    case 'treeCompare': {
      const node = findTreeNode(state.tree, event.nodeId)
      assert(state.activeNodeId === event.nodeId && state.visitedNodeIds.includes(event.nodeId) && !state.activeCompared, 'Compare only the active, newly visited node once.')
      assert(node?.key === event.key && event.target === state.target, 'Comparison operands do not match the tree and search target.')
      next = { ...state, activeCompared: true, metrics: { ...state.metrics, comparisons: state.metrics.comparisons + 1 } }
      break
    }
    case 'treePath': {
      const path = event.nodeIds
      assert(path.length > 0 && path[0] === state.tree.rootId && path.at(-1) === state.activeNodeId, 'Path must begin at the root and end at the active node.')
      assert(path.every(id => !!findTreeNode(state.tree, id)), 'Path references a missing node.')
      for (let index = 1; index < path.length; index += 1) assert(isEdge(state, path[index - 1], path[index]), 'Path must follow actual tree edges.')
      next = { ...state, activePath: Object.freeze([...path]) }
      break
    }
    case 'treeResult':
      if (event.result === 'found') {
        const node = findTreeNode(state.tree, event.nodeId)
        assert(node && state.activeNodeId === event.nodeId && state.activeCompared && node.key === state.target, 'Found result must match the active compared node.')
        assert(state.activePath.at(-1) === event.nodeId, 'Found result must retain its root-to-node path.')
        next = { ...state, result: Object.freeze({ status: 'found', nodeId: node.id, key: node.key, value: node.value, path: state.activePath }) }
      } else {
        assert(state.frontier.length === 0, 'Not-found is valid only after the frontier is exhausted.')
        const emptyTree = state.tree.rootId === null && state.tree.nodes.length === 0
        const bstPrunedAtMissingChild = state.tree.kind === 'bst' && state.activeNodeId !== null && state.activeCompared
          && state.activePath.at(-1) === state.activeNodeId
          && (() => {
            const active = findTreeNode(state.tree, state.activeNodeId!)!
            const side = state.target < active.key ? 'leftId' : 'rightId'
            return active.key !== state.target && active[side] === null
          })()
        const exhaustedTree = state.visitedNodeIds.length === state.tree.nodes.length
        assert(emptyTree || bstPrunedAtMissingChild || exhaustedTree, 'Not-found requires an empty tree, an exhausted traversal, or a missing BST search branch.')
        next = { ...state, result: Object.freeze({ status: 'not-found' }) }
      }
      break
    case 'variable':
      assert(validVariable(event.value), 'Variable values must be finite serializable data.')
      next = { ...state, variables: Object.freeze({ ...state.variables, [event.name]: event.value }) }
      break
    case 'explanation': next = { ...state, currentMessage: event.message }; break
    case 'pseudocode': next = { ...state, currentPseudocodeLineId: event.lineId }; break
    default: { const exhaustive: never = event; throw new TreeSearchSimulationError(`Unsupported tree event ${String(exhaustive)}`) }
  }
  return Object.freeze({ ...next, activeEvent: event, metrics: Object.freeze({ ...next.metrics, steps: state.metrics.steps + 1 }) })
}
