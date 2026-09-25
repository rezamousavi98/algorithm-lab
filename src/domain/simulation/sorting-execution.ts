import { cloneVariableValue } from './variable-value'
import type {
  AlgorithmDefinition,
  AlgorithmEvent,
  ExecutionSession,
  SortingInput,
  SortingMetrics,
  SortingVisualizationState,
  VariableValue,
} from '../algorithms/types'
import { validateSortingInput } from '../algorithms/sorting/input'
import { createInitialSortingState, reduceSortingEvent } from './sorting-reducer'

const MAX_EXECUTION_EVENTS = 50_000

export type SortingExecution = Readonly<{
  session: ExecutionSession<SortingInput, AlgorithmEvent>
  snapshots: readonly SortingVisualizationState[]
}>

export type SortingExecutionErrorCode =
  | 'wrong_category'
  | 'invalid_input'
  | 'executor_failed'
  | 'invalid_event'
  | 'event_limit'

export type SortingExecutionResult =
  | Readonly<{ ok: true; execution: SortingExecution }>
  | Readonly<{ ok: false; error: Readonly<{ code: SortingExecutionErrorCode; message: string }> }>

function fail(code: SortingExecutionErrorCode, message: string): SortingExecutionResult {
  return Object.freeze({ ok: false, error: Object.freeze({ code, message }) })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isVariableValue(value: unknown): value is VariableValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return true
  }
  if (Array.isArray(value)) return value.every(isVariableValue)
  if (!isRecord(value)) return false
  return Object.values(value).every(isVariableValue)
}

function isIndexPair(value: unknown): value is readonly [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((index) => Number.isInteger(index))
  )
}

function isIndexRange(value: unknown): value is readonly [number, number] {
  return isIndexPair(value)
}

function isAlgorithmEvent(value: unknown): value is AlgorithmEvent {
  if (!isRecord(value) || typeof value.type !== 'string') return false

  switch (value.type) {
    case 'swap':
      return isIndexPair(value.indices)
    case 'compare':
      return (
        isIndexPair(value.indices) &&
        (value.values === undefined ||
          (Array.isArray(value.values) &&
            value.values.length === 2 &&
            value.values.every(Number.isFinite)))
      )
    case 'read':
    case 'write':
      return Number.isInteger(value.index) && Number.isFinite(value.value)
    case 'markSorted':
      return Array.isArray(value.indices) && value.indices.every(Number.isInteger)
    case 'select':
      return (
        (value.role === 'pivot' || value.role === 'minimum' || value.role === 'current') &&
        Number.isInteger(value.index)
      )
    case 'range':
      return (
        (value.role === 'active' ||
          value.role === 'partition' ||
          value.role === 'merge' ||
          value.role === 'heap') &&
        isIndexRange(value.indices)
      )
    case 'auxiliaryUpdate':
      return (
        typeof value.panelId === 'string' &&
        typeof value.label === 'string' &&
        Array.isArray(value.values) &&
        value.values.every(Number.isFinite)
      )
    case 'variable':
      return typeof value.name === 'string' && isVariableValue(value.value)
    case 'explanation':
      return typeof value.message === 'string'
    case 'pseudocode':
      return typeof value.lineId === 'string'
    default:
      return false
  }
}

function freezeEvent(event: AlgorithmEvent): AlgorithmEvent {
  switch (event.type) {
    case 'compare':
    case 'swap':
      return Object.freeze({
        ...event,
        indices: Object.freeze([...event.indices]) as typeof event.indices,
        ...(event.type === 'compare' && event.values
          ? { values: Object.freeze([...event.values]) as typeof event.values }
          : {}),
      })
    case 'markSorted':
      return Object.freeze({ ...event, indices: Object.freeze([...event.indices]) })
    case 'range':
      return Object.freeze({ ...event, indices: Object.freeze([...event.indices]) as typeof event.indices })
    case 'auxiliaryUpdate':
      return Object.freeze({ ...event, values: Object.freeze([...event.values]) })
    case 'variable':
      return Object.freeze({ ...event, value: cloneVariableValue(event.value) })
    case 'read':
    case 'write':
    case 'select':
    case 'explanation':
    case 'pseudocode':
      return Object.freeze({ ...event })
  }
}

function countMetrics(events: readonly AlgorithmEvent[]): SortingMetrics {
  return Object.freeze({
    steps: events.length,
    comparisons: events.filter((event) => event.type === 'compare').length,
    swaps: events.filter((event) => event.type === 'swap').length,
    reads: events.filter((event) => event.type === 'read').length,
    writes: events.filter((event) => event.type === 'write').length,
  })
}

/**
 * Runs a sorting executor once, freezes its semantic event log, and builds
 * every state snapshot outside React so pause, reverse, and seek are direct lookups.
 */
export function createSortingExecution(
  definition: AlgorithmDefinition<SortingInput, AlgorithmEvent>,
  input: SortingInput,
): SortingExecutionResult {
  if (definition.category !== 'sorting') {
    return fail('wrong_category', `Algorithm "${definition.id}" is not a sorting algorithm.`)
  }
  if (!Array.isArray(input)) {
    return fail('invalid_input', 'The sorting input must be an array of numbers.')
  }
  const inputError = validateSortingInput(input)
  if (inputError) return fail('invalid_input', inputError)

  const stableInput = Object.freeze([...input])
  if (definition.validateInput) {
    try {
      const validationMessage = definition.validateInput(stableInput)
      if (validationMessage) return fail('invalid_input', validationMessage)
    } catch (error) {
      return fail(
        'invalid_input',
        error instanceof Error ? error.message : 'The input could not be validated.',
      )
    }
  }

  let initialState: SortingVisualizationState
  try {
    initialState = createInitialSortingState(stableInput)
  } catch (error) {
    return fail('invalid_input', error instanceof Error ? error.message : 'Invalid sorting input.')
  }

  const events: AlgorithmEvent[] = []
  const snapshots: SortingVisualizationState[] = [initialState]
  let iterator: Iterator<AlgorithmEvent>
  try {
    const iterable = definition.execute(stableInput)
    iterator = iterable[Symbol.iterator]()
  } catch (error) {
    return fail(
      'executor_failed',
      error instanceof Error ? error.message : 'The algorithm could not start.',
    )
  }

  let state = initialState
  try {
    for (;;) {
      const result = iterator.next()
      if (result.done) break
      if (events.length >= MAX_EXECUTION_EVENTS) {
        return fail('event_limit', `The algorithm exceeded the ${MAX_EXECUTION_EVENTS} event safety limit.`)
      }
      if (!isAlgorithmEvent(result.value)) {
        return fail('invalid_event', `The algorithm emitted an unsupported event at step ${events.length + 1}.`)
      }

      const event = freezeEvent(result.value)
      try {
        state = reduceSortingEvent(state, event)
      } catch (error) {
        return fail(
          'invalid_event',
          error instanceof Error ? `Step ${events.length + 1}: ${error.message}` : 'Invalid algorithm event.',
        )
      }
      events.push(event)
      snapshots.push(state)
    }
  } catch (error) {
    return fail(
      'executor_failed',
      error instanceof Error ? error.message : 'The algorithm failed while generating events.',
    )
  }

  const execution: SortingExecution = Object.freeze({
    session: Object.freeze({
      algorithmId: definition.id,
      input: stableInput,
      events: Object.freeze(events),
      currentStep: 0,
      status: 'idle',
      speed: 1,
    }),
    snapshots: Object.freeze(snapshots),
  })

  return Object.freeze({ ok: true, execution })
}

/** Returns the snapshot after `step` events. Step zero is the original input. */
export function getSortingStateAtStep(
  execution: SortingExecution,
  step: number,
): SortingVisualizationState {
  if (!Number.isInteger(step) || step < 0 || step >= execution.snapshots.length) {
    throw new RangeError(`Step must be an integer between 0 and ${execution.snapshots.length - 1}.`)
  }
  return execution.snapshots[step]
}

/** Counts operation metrics directly from the recorded semantic history. */
export function calculateSortingMetrics(events: readonly AlgorithmEvent[]): SortingMetrics {
  return countMetrics(events)
}
