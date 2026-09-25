import { doubleHashStep, normalizedHashIndex, probeIndex } from '../structures/hash-table'
import type { HashEntry } from '../structures/hash-table/types'
import type { HashSearchAlgorithmEvent, HashSearchInput, HashSearchMetrics, HashSearchVisualizationState } from '../algorithms/searching/hash/types'
import type { VariableValue } from '../algorithms/types'

const ZERO_METRICS: HashSearchMetrics = Object.freeze({ steps: 0, probes: 0, comparisons: 0 })

export class HashSearchSimulationError extends Error {
  constructor(message: string) { super(message); this.name = 'HashSearchSimulationError' }
}

export function createInitialHashSearchState(input: HashSearchInput): HashSearchVisualizationState {
  return Object.freeze({
    table: input.table,
    key: input.key,
    homeIndex: null,
    stepSize: null,
    activeLocation: null,
    activeChainIndex: null,
    activeProbeNumber: null,
    activeEntryId: null,
    activeCompared: false,
    matchedEntryId: null,
    visitedLocations: Object.freeze([]),
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

export function isHashSearchingEvent(event: unknown): event is HashSearchAlgorithmEvent {
  if (typeof event !== 'object' || event === null || !('type' in event)) return false
  const value = event as Record<string, unknown>
  switch (value.type) {
    case 'hashCode': return Number.isInteger(value.homeIndex) && (value.step === null || Number.isInteger(value.step))
    case 'hashProbe': {
      const location = value.location
      return Number.isInteger(value.probeNumber) && typeof location === 'object' && location !== null
        && ((location as Record<string, unknown>).kind === 'bucket' || (location as Record<string, unknown>).kind === 'slot')
        && Number.isInteger((location as Record<string, unknown>).index)
    }
    case 'hashCompare': return typeof value.entryId === 'string' && Number.isSafeInteger(value.key) && Number.isSafeInteger(value.target)
    case 'hashChainAdvance': return Number.isInteger(value.nextChainIndex)
    case 'hashAdvance': return Number.isInteger(value.nextProbeNumber)
    case 'hashResult': return value.result === 'not-found' || (value.result === 'found' && typeof value.entryId === 'string')
    case 'variable': return typeof value.name === 'string' && validVariable(value.value)
    case 'explanation': return typeof value.message === 'string'
    case 'pseudocode': return typeof value.lineId === 'string'
    default: return false
  }
}

function entryAt(state: HashSearchVisualizationState): HashEntry | undefined {
  const location = state.activeLocation
  if (!location) return undefined
  if (location.kind === 'bucket') {
    const bucket = state.table.strategy === 'separate-chaining' ? state.table.buckets[location.index] : undefined
    return bucket && state.activeChainIndex !== null ? bucket.entries[state.activeChainIndex] : undefined
  }
  const slot = state.table.strategy === 'separate-chaining' ? undefined : state.table.slots[location.index]
  return slot?.state === 'occupied' ? slot.entry : undefined
}

function canReportMissing(state: HashSearchVisualizationState): boolean {
  if (!state.activeLocation) return false
  if (state.activeLocation.kind === 'bucket') {
    if (state.table.strategy !== 'separate-chaining') return false
    const chainLength = state.table.buckets[state.activeLocation.index].entries.length
    return state.activeChainIndex === 0 && chainLength === 0
      || state.activeChainIndex === chainLength && !state.activeCompared
  }
  if (state.table.strategy === 'separate-chaining') return false
  const slot = state.table.slots[state.activeLocation.index]
  return slot.state === 'empty'
    || state.metrics.probes === state.table.capacity && state.activeProbeNumber === state.table.capacity - 1
      && (state.activeCompared || slot.state === 'deleted')
}

export function reduceHashSearchingEvent(
  state: HashSearchVisualizationState,
  event: HashSearchAlgorithmEvent,
): HashSearchVisualizationState {
  if (state.result.status !== 'pending') throw new HashSearchSimulationError('No events may follow a completed hash search.')
  let next = state

  switch (event.type) {
    case 'hashCode': {
      if (state.homeIndex !== null) throw new HashSearchSimulationError('The home bucket or slot may only be computed once.')
      const capacity = state.table.capacity
      const homeIndex = normalizedHashIndex(state.key, capacity)
      const step = state.table.strategy === 'separate-chaining' ? null
        : state.table.strategy === 'linear-probing' ? 1 : doubleHashStep(state.key, capacity)
      if (event.homeIndex !== homeIndex || event.step !== step) throw new HashSearchSimulationError('Hash values do not match the prepared table strategy.')
      next = { ...state, homeIndex, stepSize: step }
      break
    }
    case 'hashProbe': {
      if (state.homeIndex === null || state.matchedEntryId !== null) throw new HashSearchSimulationError('Compute the hash before probing and stop after a match.')
      if (state.table.strategy === 'separate-chaining') {
        if (event.location.kind !== 'bucket' || event.location.index !== state.homeIndex || event.probeNumber !== 0 || state.activeLocation !== null || state.metrics.probes !== 0) {
          throw new HashSearchSimulationError('Chaining must inspect its home bucket exactly once.')
        }
        const bucket = state.table.buckets[event.location.index]
        next = { ...state, activeLocation: Object.freeze({ ...event.location }), activeChainIndex: 0,
          activeEntryId: bucket.entries[0]?.id ?? null, activeCompared: false,
          visitedLocations: Object.freeze([Object.freeze({ ...event.location })]),
          metrics: { ...state.metrics, probes: state.metrics.probes + 1 } }
      } else {
        const expectedIndex = probeIndex(state.table.strategy, state.key, state.metrics.probes, state.table.capacity)
        if (event.location.kind !== 'slot' || event.location.index !== expectedIndex || event.probeNumber !== state.metrics.probes || state.activeLocation !== null || state.metrics.probes >= state.table.capacity) {
          throw new HashSearchSimulationError('Probe does not follow the selected hash sequence.')
        }
        const slot = state.table.slots[expectedIndex]
        next = { ...state, activeLocation: Object.freeze({ ...event.location }), activeChainIndex: null,
          activeProbeNumber: event.probeNumber, activeEntryId: slot.state === 'occupied' ? slot.entry.id : null, activeCompared: false,
          visitedLocations: Object.freeze([...state.visitedLocations, Object.freeze({ ...event.location })]),
          metrics: { ...state.metrics, probes: state.metrics.probes + 1 } }
      }
      break
    }
    case 'hashCompare': {
      const entry = entryAt(state)
      if (!entry || !state.activeLocation || state.activeCompared || state.matchedEntryId !== null
        || event.entryId !== entry.id || event.key !== entry.key || event.target !== state.key) {
        throw new HashSearchSimulationError('Key comparison does not match the active table entry and search key.')
      }
      next = { ...state, activeEntryId: entry.id, activeCompared: true,
        matchedEntryId: entry.key === state.key ? entry.id : null,
        metrics: { ...state.metrics, comparisons: state.metrics.comparisons + 1 } }
      break
    }
    case 'hashChainAdvance': {
      if (state.table.strategy !== 'separate-chaining' || state.activeLocation?.kind !== 'bucket' || !state.activeCompared || state.matchedEntryId !== null || state.activeChainIndex === null) {
        throw new HashSearchSimulationError('Advance the chain only after a nonmatching key comparison.')
      }
      const nextIndex = state.activeChainIndex + 1
      const chainLength = state.table.buckets[state.activeLocation.index].entries.length
      if (event.nextChainIndex !== nextIndex || nextIndex > chainLength) throw new HashSearchSimulationError('Chain cursor must advance by one entry.')
      const entry = state.table.buckets[state.activeLocation.index].entries[nextIndex]
      next = { ...state, activeChainIndex: nextIndex, activeEntryId: entry?.id ?? null, activeCompared: false }
      break
    }
    case 'hashAdvance': {
      if (state.table.strategy === 'separate-chaining' || state.activeLocation?.kind !== 'slot' || state.matchedEntryId !== null) {
        throw new HashSearchSimulationError('Advance only within an open-addressed probe sequence.')
      }
      const activeSlot = state.table.slots[state.activeLocation.index]
      const canAdvance = state.activeCompared && activeSlot.state === 'occupied' || !state.activeCompared && activeSlot.state === 'deleted'
      if (!canAdvance) throw new HashSearchSimulationError('Advance only after a nonmatching key or a deleted slot.')
      if (event.nextProbeNumber !== state.metrics.probes || event.nextProbeNumber >= state.table.capacity) throw new HashSearchSimulationError('The next probe number is invalid or exceeds table capacity.')
      next = { ...state, activeLocation: null, activeProbeNumber: null, activeEntryId: null, activeCompared: false }
      break
    }
    case 'hashResult': {
      if (event.result === 'found') {
        const entry = entryAt(state)
        if (!entry || !state.activeCompared || event.entryId !== entry.id || state.matchedEntryId !== entry.id || !state.activeLocation) {
          throw new HashSearchSimulationError('Reported match is not the key found at the active location.')
        }
        next = { ...state, result: Object.freeze({ status: 'found', entryId: entry.id, key: entry.key, value: entry.value,
          location: state.activeLocation, ...(state.activeChainIndex === null ? {} : { chainIndex: state.activeChainIndex }) }) }
      } else {
        if (state.matchedEntryId !== null || !canReportMissing(state)) throw new HashSearchSimulationError('Not-found requires an empty slot or an exhausted search path.')
        next = { ...state, result: Object.freeze({ status: 'not-found' }) }
      }
      break
    }
    case 'variable':
      if (!validVariable(event.value)) throw new HashSearchSimulationError('Variable values must be serializable finite values.')
      next = { ...state, variables: Object.freeze({ ...state.variables, [event.name]: event.value }) }
      break
    case 'explanation': next = { ...state, currentMessage: event.message }; break
    case 'pseudocode': next = { ...state, currentPseudocodeLineId: event.lineId }; break
    default: {
      const exhaustive: never = event
      throw new HashSearchSimulationError(`Unsupported hash-search event: ${String(exhaustive)}`)
    }
  }

  return Object.freeze({ ...next, activeEvent: event, metrics: Object.freeze({ ...next.metrics, steps: state.metrics.steps + 1 }) })
}
