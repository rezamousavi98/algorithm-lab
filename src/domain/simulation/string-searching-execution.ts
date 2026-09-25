import { cloneVariableValue } from './variable-value'
import type { StringSearchingAlgorithmDefinition, StringSearchingAlgorithmEvent, StringSearchingInput, StringSearchingVisualizationState } from '../algorithms/types'
import { isStringSearchingEvent, createInitialStringSearchingState, reduceStringSearchingEvent } from './string-searching-reducer'
import { MAX_STRING_SEARCH_EVENTS, validateStringSearchingInput } from '../algorithms/searching/strings/shared'

export type StringSearchingExecution = Readonly<{ input: StringSearchingInput; events: readonly StringSearchingAlgorithmEvent[]; snapshots: readonly StringSearchingVisualizationState[] }>
export type StringSearchingExecutionResult =
  | Readonly<{ ok: true; execution: StringSearchingExecution }>
  | Readonly<{ ok: false; error: Readonly<{ message: string }> }>

function failure(message: string): StringSearchingExecutionResult { return Object.freeze({ ok: false, error: Object.freeze({ message }) }) }

export function createStringSearchingExecution(definition: StringSearchingAlgorithmDefinition, input: StringSearchingInput): StringSearchingExecutionResult {
  try {
    const validationError = validateStringSearchingInput(input) ?? definition.validateInput?.(input) ?? null
    if (validationError) return failure(validationError)
  } catch (error) { return failure(error instanceof Error ? error.message : 'Invalid string-search input.') }
  const stableInput = Object.freeze({ text: input.text, pattern: input.pattern })
  const events: StringSearchingAlgorithmEvent[] = []
  const snapshots: StringSearchingVisualizationState[] = [createInitialStringSearchingState(stableInput)]
  let state = snapshots[0]
  try {
    for (const rawEvent of definition.execute(stableInput)) {
      if (events.length >= MAX_STRING_SEARCH_EVENTS) return failure(`Search exceeded the ${MAX_STRING_SEARCH_EVENTS} event safety limit.`)
      if (!isStringSearchingEvent(rawEvent)) return failure(`Unsupported search event at step ${events.length + 1}.`)
      if (rawEvent.type === 'pseudocode' && !definition.pseudocode.some(line => line.id === rawEvent.lineId)) return failure('Unknown pseudocode line.')
      const event = Object.freeze(rawEvent.type === 'variable' ? { ...rawEvent, value: cloneVariableValue(rawEvent.value) } : { ...rawEvent })
      state = reduceStringSearchingEvent(state, event)
      events.push(event)
      snapshots.push(state)
    }
  } catch (error) { return failure(error instanceof Error ? error.message : 'String-search execution failed.') }
  if (state.result.status !== 'completed') return failure('The algorithm ended without completing its search.')
  return Object.freeze({ ok: true, execution: Object.freeze({ input: stableInput, events: Object.freeze(events), snapshots: Object.freeze(snapshots) }) })
}

export function getStringSearchingStateAtStep(execution: StringSearchingExecution, step: number): StringSearchingVisualizationState {
  if (!Number.isInteger(step) || step < 0 || step >= execution.snapshots.length) throw new RangeError(`Step must be between 0 and ${execution.snapshots.length - 1}.`)
  return execution.snapshots[step]
}
