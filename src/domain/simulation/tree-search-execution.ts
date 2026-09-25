import { cloneVariableValue } from './variable-value'
import { validateBinaryTree } from '../structures/binary-tree'
import { MAX_TREE_SEARCH_EVENTS, validateTreeSearchInput } from '../algorithms/searching/tree/shared'
import type { TreeSearchAlgorithmDefinition, TreeSearchEvent, TreeSearchExecutionResult, TreeSearchInput, TreeSearchVisualizationState } from '../algorithms/searching/tree/types'
import { createInitialTreeSearchState, isTreeSearchEvent, reduceTreeSearchEvent } from './tree-search-reducer'

function stableTree(tree: TreeSearchInput['tree']): TreeSearchInput['tree'] {
  const nodes = Object.freeze(tree.nodes.map(node => Object.freeze({ ...node })))
  const nodeById = Object.freeze(Object.fromEntries(nodes.map(node => [node.id, node])))
  return Object.freeze({ kind: tree.kind, rootId: tree.rootId, nodes, nodeById }) as TreeSearchInput['tree']
}
function fail(code: Extract<TreeSearchExecutionResult, { ok: false }>['error']['code'], message: string): TreeSearchExecutionResult {
  return Object.freeze({ ok: false, error: Object.freeze({ code, message }) })
}
function freezeEvent(event: TreeSearchEvent): TreeSearchEvent {
  if (event.type === 'variable') return Object.freeze({ ...event, value: cloneVariableValue(event.value) })
  if (event.type === 'treePath') return Object.freeze({ ...event, nodeIds: Object.freeze([...event.nodeIds]) })
  return Object.freeze({ ...event })
}
export function createTreeSearchExecution(definition: TreeSearchAlgorithmDefinition, input: TreeSearchInput): TreeSearchExecutionResult {
  try {
    const inputError = validateTreeSearchInput(input, definition.requiresTree)
    if (inputError) return fail('invalid-input', inputError)
  } catch (error) {
    return fail('invalid-input', error instanceof Error ? error.message : 'Invalid tree-search input.')
  }
  const stableInput: TreeSearchInput = Object.freeze({ tree: stableTree(input.tree), target: input.target })
  if (validateBinaryTree(stableInput.tree, definition.requiresTree === 'bst')) return fail('invalid-input', 'Prepared tree does not satisfy the selected algorithm prerequisite.')
  const events: TreeSearchEvent[] = []
  const snapshots: TreeSearchVisualizationState[] = [createInitialTreeSearchState(stableInput)]
  let state = snapshots[0]
  try {
    for (const rawEvent of definition.execute(stableInput)) {
      if (events.length >= MAX_TREE_SEARCH_EVENTS) return fail('event-limit', `Tree search exceeded the ${MAX_TREE_SEARCH_EVENTS} event safety limit.`)
      if (!isTreeSearchEvent(rawEvent)) return fail('invalid-event', `Unsupported tree-search event at step ${events.length + 1}.`)
      if (rawEvent.type === 'pseudocode' && !definition.pseudocode.some(line => line.id === rawEvent.lineId)) return fail('invalid-event', 'Unknown pseudocode line.')
      const event = freezeEvent(rawEvent)
      try { state = reduceTreeSearchEvent(state, event) }
      catch (error) { return fail('invalid-event', error instanceof Error ? `Step ${events.length + 1}: ${error.message}` : 'Invalid tree-search event.') }
      events.push(event)
      snapshots.push(state)
    }
  } catch (error) {
    return fail('executor-failed', error instanceof Error ? error.message : 'Tree-search execution failed.')
  }
  if (state.result.status === 'pending') return fail('invalid-event', 'Tree search ended without a result.')
  return Object.freeze({ ok: true, execution: Object.freeze({ input: stableInput, events: Object.freeze(events), snapshots: Object.freeze(snapshots) }) })
}
export function getTreeSearchStateAtStep(execution: NonNullable<Extract<TreeSearchExecutionResult, { ok: true }>['execution']>, step: number): TreeSearchVisualizationState {
  if (!Number.isInteger(step) || step < 0 || step >= execution.snapshots.length) throw new RangeError(`Step must be between 0 and ${execution.snapshots.length - 1}.`)
  return execution.snapshots[step]
}
