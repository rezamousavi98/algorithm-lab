import { cloneVariableValue } from './variable-value'
import type { HashSearchAlgorithmDefinition, HashSearchAlgorithmEvent, HashSearchExecution, HashSearchExecutionResult, HashSearchInput, HashSearchVisualizationState } from '../algorithms/searching/hash/types'
import { MAX_HASH_SEARCH_EVENTS, validateHashSearchInput } from '../algorithms/searching/hash/shared'
import { createInitialHashSearchState, isHashSearchingEvent, reduceHashSearchingEvent } from './hash-search-reducer'

function copyTable(input: HashSearchInput['table']): HashSearchInput['table'] {
  const entries = Object.freeze(input.entries.map(entry => Object.freeze({ ...entry })))
  const byId = new Map(entries.map(entry => [entry.id, entry]))
  if (input.strategy === 'separate-chaining') {
    return Object.freeze({ ...input, entries, buckets: Object.freeze(input.buckets.map(bucket => Object.freeze({
      entries: Object.freeze(bucket.entries.map(entry => byId.get(entry.id)!)),
    }))) })
  }
  return Object.freeze({ ...input, entries, slots: Object.freeze(input.slots.map(slot => slot.state === 'occupied'
    ? Object.freeze({ state: 'occupied' as const, entry: byId.get(slot.entry.id)! })
    : Object.freeze({ ...slot }))) })
}

function failure(code: Extract<HashSearchExecutionResult, { ok: false }>['error']['code'], message: string): HashSearchExecutionResult {
  return Object.freeze({ ok: false, error: Object.freeze({ code, message }) })
}

function freezeEvent(event: HashSearchAlgorithmEvent): HashSearchAlgorithmEvent {
  if (event.type === 'variable') return Object.freeze({ ...event, value: cloneVariableValue(event.value) })
  if (event.type === 'hashProbe') return Object.freeze({ ...event, location: Object.freeze({ ...event.location }) })
  return Object.freeze({ ...event })
}

export function createHashSearchExecution(
  definition: HashSearchAlgorithmDefinition,
  input: HashSearchInput,
): HashSearchExecutionResult {
  try {
    const validationError = validateHashSearchInput(input, definition.strategy) ?? definition.validateInput?.(input) ?? null
    if (validationError) return failure('invalid-input', validationError)
  } catch (error) {
    return failure('invalid-input', error instanceof Error ? error.message : 'Invalid hash-search input.')
  }

  const stableInput: HashSearchInput = Object.freeze({
    table: copyTable(input.table),
    key: Object.is(input.key, -0) ? 0 : input.key,
  })
  const events: HashSearchAlgorithmEvent[] = []
  const snapshots: HashSearchVisualizationState[] = [createInitialHashSearchState(stableInput)]
  let state = snapshots[0]

  try {
    for (const rawEvent of definition.execute(stableInput)) {
      if (events.length >= MAX_HASH_SEARCH_EVENTS) return failure('event-limit', `Hash search exceeded the ${MAX_HASH_SEARCH_EVENTS} event safety limit.`)
      if (!isHashSearchingEvent(rawEvent)) return failure('invalid-event', `Unsupported hash-search event at step ${events.length + 1}.`)
      if (rawEvent.type === 'pseudocode' && !definition.pseudocode.some(line => line.id === rawEvent.lineId)) return failure('invalid-event', 'Unknown pseudocode line.')
      const event = freezeEvent(rawEvent)
      try {
        state = reduceHashSearchingEvent(state, event)
      } catch (error) {
        return failure('invalid-event', error instanceof Error ? `Step ${events.length + 1}: ${error.message}` : 'Invalid hash-search event.')
      }
      events.push(event)
      snapshots.push(state)
    }
  } catch (error) {
    return failure('executor-failed', error instanceof Error ? error.message : 'Hash-search execution failed.')
  }

  if (state.result.status === 'pending') return failure('invalid-event', 'The hash search ended without a found or not-found result.')
  return Object.freeze({ ok: true, execution: Object.freeze({
    input: stableInput,
    events: Object.freeze(events),
    snapshots: Object.freeze(snapshots),
  }) })
}

export function getHashSearchStateAtStep(execution: HashSearchExecution, step: number): HashSearchVisualizationState {
  if (!Number.isInteger(step) || step < 0 || step >= execution.snapshots.length) {
    throw new RangeError(`Step must be between 0 and ${execution.snapshots.length - 1}.`)
  }
  return execution.snapshots[step]
}
