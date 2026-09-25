import type { StringSearchingAlgorithmEvent, StringSearchingInput, StringSearchingMetrics, StringSearchingVisualizationState, VariableValue } from '../algorithms/types'

const ZERO_METRICS: StringSearchingMetrics = Object.freeze({ steps: 0, characterComparisons: 0, alignments: 0, hashChecks: 0 })

export class StringSearchingSimulationError extends Error {
  constructor(message: string) { super(message); this.name = 'StringSearchingSimulationError' }
}

export function createInitialStringSearchingState(input: StringSearchingInput): StringSearchingVisualizationState {
  return Object.freeze({
    text: Object.freeze(Array.from(input.text)), pattern: Object.freeze(Array.from(input.pattern)),
    alignmentIndex: null, comparedIndices: null, matches: Object.freeze([]), variables: Object.freeze({}),
    currentMessage: null, currentPseudocodeLineId: null, activeEvent: null,
    result: Object.freeze({ status: 'pending' }), metrics: ZERO_METRICS,
  })
}

function validVariable(value: unknown): value is VariableValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(validVariable)
  return typeof value === 'object' && Object.values(value).every(validVariable)
}

export function isStringSearchingEvent(event: unknown): event is StringSearchingAlgorithmEvent {
  if (typeof event !== 'object' || event === null || !('type' in event)) return false
  const item = event as Record<string, unknown>
  switch (item.type) {
    case 'stringAlignment': return Number.isInteger(item.index)
    case 'stringCompare': return Number.isInteger(item.textIndex) && Number.isInteger(item.patternIndex) && typeof item.textChar === 'string' && typeof item.patternChar === 'string'
    case 'stringHash': return Number.isInteger(item.index) && Number.isInteger(item.windowHash) && Number.isInteger(item.patternHash)
    case 'stringMatch': return Number.isInteger(item.index)
    case 'stringSearchComplete': return true
    case 'variable': return typeof item.name === 'string' && validVariable(item.value)
    case 'explanation': return typeof item.message === 'string'
    case 'pseudocode': return typeof item.lineId === 'string'
    default: return false
  }
}

export function reduceStringSearchingEvent(state: StringSearchingVisualizationState, event: StringSearchingAlgorithmEvent): StringSearchingVisualizationState {
  if (state.result.status !== 'pending') throw new StringSearchingSimulationError('No events may follow string-search completion.')
  let next = state
  switch (event.type) {
    case 'stringAlignment':
      if (event.index < 0 || event.index > state.text.length - state.pattern.length) throw new StringSearchingSimulationError(`Pattern alignment ${event.index} is outside the text.`)
      if (state.alignmentIndex !== null && event.index < state.alignmentIndex) throw new StringSearchingSimulationError('Pattern alignments must move forward through the text.')
      next = { ...state, alignmentIndex: event.index, comparedIndices: null }
      break
    case 'stringCompare':
      if (event.textIndex < 0 || event.textIndex >= state.text.length || event.patternIndex < 0 || event.patternIndex >= state.pattern.length || state.text[event.textIndex] !== event.textChar || state.pattern[event.patternIndex] !== event.patternChar) {
        throw new StringSearchingSimulationError('Character comparison does not match the text and pattern.')
      }
      if (state.alignmentIndex === null || event.textIndex !== state.alignmentIndex + event.patternIndex) throw new StringSearchingSimulationError('Character comparison does not match the active pattern alignment.')
      next = { ...state, comparedIndices: Object.freeze([event.textIndex, event.patternIndex]) as readonly [number, number], metrics: { ...state.metrics, characterComparisons: state.metrics.characterComparisons + 1 } }
      break
    case 'stringHash':
      if (event.index < 0 || event.index > state.text.length - state.pattern.length || event.windowHash < 0 || event.patternHash < 0) throw new StringSearchingSimulationError('Hash event contains an invalid window or hash.')
      next = { ...state, alignmentIndex: event.index, metrics: { ...state.metrics, hashChecks: state.metrics.hashChecks + 1 } }
      break
    case 'stringMatch':
      if (event.index < 0 || event.index > state.text.length - state.pattern.length || state.text.slice(event.index, event.index + state.pattern.length).join('') !== state.pattern.join('')) throw new StringSearchingSimulationError('Reported match does not contain the pattern.')
      if (state.alignmentIndex !== event.index) throw new StringSearchingSimulationError('Reported match does not match the active alignment.')
      if (state.matches.includes(event.index)) throw new StringSearchingSimulationError('A match position cannot be reported twice.')
      next = { ...state, matches: Object.freeze([...state.matches, event.index]) }
      break
    case 'stringSearchComplete':
      next = { ...state, result: Object.freeze({ status: 'completed', matches: Object.freeze([...state.matches]) }) }
      break
    case 'variable':
      if (!validVariable(event.value)) throw new StringSearchingSimulationError('Variable values must be serializable finite values.')
      next = { ...state, variables: Object.freeze({ ...state.variables, [event.name]: event.value }) }
      break
    case 'explanation': next = { ...state, currentMessage: event.message }; break
    case 'pseudocode': next = { ...state, currentPseudocodeLineId: event.lineId }; break
    default: {
      const exhaustive: never = event
      throw new StringSearchingSimulationError(`Unsupported string-search event: ${String(exhaustive)}`)
    }
  }
  return Object.freeze({ ...next, activeEvent: event, metrics: Object.freeze({ ...next.metrics, steps: state.metrics.steps + 1, alignments: state.metrics.alignments + Number(event.type === 'stringAlignment') }) })
}
