import { cloneVariableValue } from './variable-value'
import { validateSearchingInput } from '../algorithms/searching/shared'
import type { SearchingAlgorithmDefinition, SearchingAlgorithmEvent, SearchingInput, SearchingVisualizationState } from '../algorithms/types'
import { isSearchingEvent, createInitialSearchingState, reduceSearchingEvent } from './searching-reducer'

const MAX_SEARCH_EVENTS = 50_000

export type SearchingExecution = Readonly<{
  input: SearchingInput
  events: readonly SearchingAlgorithmEvent[]
  snapshots: readonly SearchingVisualizationState[]
}>

export type SearchingExecutionResult =
  | Readonly<{ ok: true; execution: SearchingExecution }>
  | Readonly<{ ok: false; error: Readonly<{ code: 'invalid-input' | 'executor-failed' | 'invalid-event' | 'event-limit'; message: string }> }>

function fail(code: Extract<SearchingExecutionResult, { ok: false }>['error']['code'], message: string): SearchingExecutionResult {
  return Object.freeze({ ok: false, error: Object.freeze({ code, message }) })
}

function freezeEvent(event: SearchingAlgorithmEvent): SearchingAlgorithmEvent {
  return Object.freeze(event.type === 'variable' ? { ...event, value: cloneVariableValue(event.value) } : { ...event })
}

export function createSearchingExecution(
  definition: SearchingAlgorithmDefinition<SearchingAlgorithmEvent>,
  input: SearchingInput,
): SearchingExecutionResult {
  try {
    const inputError = validateSearchingInput(input, definition.requiresSortedInput) ?? definition.validateInput?.(input) ?? null
    if (inputError) return fail('invalid-input', inputError)
  } catch (error) {
    return fail('invalid-input', error instanceof Error ? error.message : 'Invalid search input.')
  }

  const stableInput = Object.freeze({ ...input, values: Object.freeze([...input.values]) })
  const events: SearchingAlgorithmEvent[] = []
  const snapshots: SearchingVisualizationState[] = [createInitialSearchingState(stableInput)]
  let state = snapshots[0]
  try {
    for (const rawEvent of definition.execute(stableInput)) {
      if (events.length >= MAX_SEARCH_EVENTS) return fail('event-limit', `Search exceeded the ${MAX_SEARCH_EVENTS} event safety limit.`)
      if (!isSearchingEvent(rawEvent)) return fail('invalid-event', `Unsupported search event at step ${events.length + 1}.`)
      if (rawEvent.type === 'pseudocode' && !definition.pseudocode.some(line => line.id === rawEvent.lineId)) return fail('invalid-event', 'Unknown pseudocode line.')
      const event = freezeEvent(rawEvent)
      try { state = reduceSearchingEvent(state, event) }
      catch (error) { return fail('invalid-event', error instanceof Error ? `Step ${events.length + 1}: ${error.message}` : 'Invalid search event.') }
      events.push(event)
      snapshots.push(state)
    }
  } catch (error) {
    return fail('executor-failed', error instanceof Error ? error.message : 'Search execution failed.')
  }
  if (state.result.status === 'pending') return fail('invalid-event', 'The search ended without reporting found or not found.')
  return Object.freeze({ ok: true, execution: Object.freeze({
    input: stableInput,
    events: Object.freeze(events),
    snapshots: Object.freeze(snapshots),
  }) })
}

export function getSearchingStateAtStep(execution: SearchingExecution, step: number): SearchingVisualizationState {
  if (!Number.isInteger(step) || step < 0 || step >= execution.snapshots.length) {
    throw new RangeError(`Step must be between 0 and ${execution.snapshots.length - 1}.`)
  }
  return execution.snapshots[step]
}
