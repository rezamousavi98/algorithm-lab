import type {
  SearchingAlgorithmEvent,
  SearchingInput,
  SearchingMetrics,
  SearchingVisualizationState,
  VariableValue,
} from '../algorithms/types'

const ZERO_METRICS: SearchingMetrics = Object.freeze({ steps: 0, comparisons: 0, probes: 0 })

export class SearchingSimulationError extends Error {
  constructor(message: string) { super(message); this.name = 'SearchingSimulationError' }
}

export function createInitialSearchingState(input: SearchingInput): SearchingVisualizationState {
  return Object.freeze({
    values: Object.freeze([...input.values]),
    target: input.target,
    activeProbe: null,
    candidateRange: Object.freeze([0, input.values.length - 1]) as readonly [number, number],
    variables: Object.freeze({}),
    currentMessage: null,
    currentPseudocodeLineId: null,
    activeEvent: null,
    result: Object.freeze({ status: 'pending' }),
    metrics: ZERO_METRICS,
  })
}

function validVariable(value: unknown): value is VariableValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(validVariable)
  return typeof value === 'object' && Object.values(value).every(validVariable)
}

export function isSearchingEvent(event: unknown): event is SearchingAlgorithmEvent {
  if (typeof event !== 'object' || event === null || !('type' in event)) return false
  const value = event as Record<string, unknown>
  switch (value.type) {
    case 'searchProbe': return Number.isInteger(value.index)
    case 'searchCompare': return Number.isInteger(value.index) && Number.isFinite(value.value) && Number.isFinite(value.target)
    case 'candidateRange': return Number.isInteger(value.low) && Number.isInteger(value.high)
    case 'searchResult': return value.result === 'not-found' || (value.result === 'found' && Number.isInteger(value.index))
    case 'variable': return typeof value.name === 'string' && validVariable(value.value)
    case 'explanation': return typeof value.message === 'string'
    case 'pseudocode': return typeof value.lineId === 'string'
    default: return false
  }
}

export function reduceSearchingEvent(
  state: SearchingVisualizationState,
  event: SearchingAlgorithmEvent,
): SearchingVisualizationState {
  if (state.result.status !== 'pending') throw new SearchingSimulationError('No events may follow a completed search result.')
  let next = state
  switch (event.type) {
    case 'searchProbe':
      if (event.index < 0 || event.index >= state.values.length) throw new SearchingSimulationError(`Probe index ${event.index} is outside the array.`)
      next = { ...state, activeProbe: event.index }
      break
    case 'searchCompare':
      if (event.index !== state.activeProbe || state.values[event.index] !== event.value || state.target !== event.target) {
        throw new SearchingSimulationError('Comparison does not match the active probe, array value, and target.')
      }
      next = { ...state, metrics: { ...state.metrics, comparisons: state.metrics.comparisons + 1 } }
      break
    case 'candidateRange': {
      const [previousLow, previousHigh] = state.candidateRange
      if (event.low < 0 || event.low > state.values.length || event.high < -1 || event.high >= state.values.length || event.low > event.high + 1) {
        throw new SearchingSimulationError(`Invalid candidate range ${event.low}..${event.high}.`)
      }
      if (event.low < previousLow || event.high > previousHigh) throw new SearchingSimulationError('Candidate ranges may only shrink.')
      next = { ...state, candidateRange: Object.freeze([event.low, event.high]) as readonly [number, number] }
      break
    }
    case 'searchResult':
      if (event.result === 'found') {
        if (event.index < 0 || event.index >= state.values.length || state.values[event.index] !== state.target) {
          throw new SearchingSimulationError('The reported match does not contain the requested target.')
        }
        next = { ...state, result: Object.freeze({ status: 'found', index: event.index }) }
      } else {
        if (state.candidateRange[0] <= state.candidateRange[1]) throw new SearchingSimulationError('Not-found requires an empty candidate range.')
        next = { ...state, result: Object.freeze({ status: 'not-found' }) }
      }
      break
    case 'variable':
      if (!validVariable(event.value)) throw new SearchingSimulationError('Variable values must be serializable finite values.')
      next = { ...state, variables: Object.freeze({ ...state.variables, [event.name]: event.value }) }
      break
    case 'explanation': next = { ...state, currentMessage: event.message }; break
    case 'pseudocode': next = { ...state, currentPseudocodeLineId: event.lineId }; break
    default: {
      const exhaustive: never = event
      throw new SearchingSimulationError(`Unsupported search event: ${String(exhaustive)}`)
    }
  }
  const metrics = Object.freeze({
    ...next.metrics,
    steps: state.metrics.steps + 1,
    probes: state.metrics.probes + Number(event.type === 'searchProbe'),
  })
  return Object.freeze({ ...next, activeEvent: event, metrics })
}
