import type {
  AlgorithmEvent,
  IndexRange,
  SortingAuxiliaryPanel,
  SortingMetrics,
  SortingVisualizationState,
} from '../algorithms/types'

const ZERO_METRICS: SortingMetrics = Object.freeze({
  steps: 0,
  comparisons: 0,
  swaps: 0,
  reads: 0,
  writes: 0,
})

export class SimulationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SimulationError'
  }
}

export function createInitialSortingState(values: readonly number[]): SortingVisualizationState {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new SimulationError('The input array must contain only finite numbers.')
  }

  return Object.freeze({
    values: Object.freeze([...values]),
    activeEvent: null,
    comparedIndices: Object.freeze([]),
    selectedIndices: Object.freeze([]),
    pivotIndex: null,
    activeRange: null,
    sortedIndices: Object.freeze([]),
    variables: Object.freeze({}),
    auxiliaryPanels: Object.freeze([]),
    currentMessage: null,
    currentPseudocodeLineId: null,
    metrics: ZERO_METRICS,
  })
}

function assertIndex(index: number, length: number, eventName: string): void {
  if (!Number.isInteger(index) || index < 0 || index >= length) {
    throw new SimulationError(`${eventName} refers to an invalid array index (${index}).`)
  }
}

function assertRange(range: IndexRange, length: number): void {
  const [start, end] = range
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    end >= length
  ) {
    throw new SimulationError(`Invalid active range: ${start}..${end}.`)
  }
}

function updateMetrics(metrics: SortingMetrics, event: AlgorithmEvent): SortingMetrics {
  return Object.freeze({
    steps: metrics.steps + 1,
    comparisons: metrics.comparisons + Number(event.type === 'compare'),
    swaps: metrics.swaps + Number(event.type === 'swap'),
    reads: metrics.reads + Number(event.type === 'read'),
    writes: metrics.writes + Number(event.type === 'write'),
  })
}

function updateAuxiliaryPanel(
  panels: readonly SortingAuxiliaryPanel[],
  panel: SortingAuxiliaryPanel,
): readonly SortingAuxiliaryPanel[] {
  const index = panels.findIndex((candidate) => candidate.id === panel.id)
  if (index < 0) return Object.freeze([...panels, panel])

  return Object.freeze(
    panels.map((candidate, panelIndex) => (panelIndex === index ? panel : candidate)),
  )
}

/** Applies one semantic operation without mutating its input state. */
export function reduceSortingEvent(
  state: SortingVisualizationState,
  event: AlgorithmEvent,
): SortingVisualizationState {
  let nextState: SortingVisualizationState

  switch (event.type) {
    case 'compare': {
      const [first, second] = event.indices
      assertIndex(first, state.values.length, event.type)
      assertIndex(second, state.values.length, event.type)
      nextState = { ...state, comparedIndices: Object.freeze([first, second]) }
      break
    }
    case 'swap': {
      const [first, second] = event.indices
      assertIndex(first, state.values.length, event.type)
      assertIndex(second, state.values.length, event.type)
      const values = [...state.values]
      ;[values[first], values[second]] = [values[second], values[first]]
      nextState = { ...state, values: Object.freeze(values) }
      break
    }
    case 'read':
      assertIndex(event.index, state.values.length, event.type)
      nextState = state
      break
    case 'write': {
      assertIndex(event.index, state.values.length, event.type)
      if (!Number.isFinite(event.value)) {
        throw new SimulationError(`Write event contains a non-finite value (${event.value}).`)
      }
      const values = [...state.values]
      values[event.index] = event.value
      nextState = { ...state, values: Object.freeze(values) }
      break
    }
    case 'markSorted': {
      event.indices.forEach((index) => assertIndex(index, state.values.length, event.type))
      const sortedIndices = Object.freeze([...new Set([...state.sortedIndices, ...event.indices])])
      nextState = {
        ...state,
        sortedIndices,
        ...(sortedIndices.length === state.values.length ? {
          activeRange: null, pivotIndex: null, selectedIndices: Object.freeze([]),
        } : {}),
      }
      break
    }
    case 'select':
      assertIndex(event.index, state.values.length, event.type)
      nextState =
        event.role === 'pivot'
          ? { ...state, pivotIndex: event.index, selectedIndices: Object.freeze([]) }
          : { ...state, selectedIndices: Object.freeze([event.index]) }
      break
    case 'range':
      assertRange(event.indices, state.values.length)
      nextState = { ...state, activeRange: Object.freeze([...event.indices]) as IndexRange }
      break
    case 'auxiliaryUpdate': {
      if (event.values.some((value) => !Number.isFinite(value))) {
        throw new SimulationError(`Auxiliary panel "${event.panelId}" contains a non-finite value.`)
      }
      const panel = Object.freeze({
        id: event.panelId,
        label: event.label,
        values: Object.freeze([...event.values]),
      })
      nextState = { ...state, auxiliaryPanels: updateAuxiliaryPanel(state.auxiliaryPanels, panel) }
      break
    }
    case 'variable':
      nextState = {
        ...state,
        variables: Object.freeze({ ...state.variables, [event.name]: event.value }),
      }
      break
    case 'explanation':
      nextState = { ...state, currentMessage: event.message }
      break
    case 'pseudocode':
      nextState = { ...state, currentPseudocodeLineId: event.lineId }
      break
    default: {
      const exhaustiveCheck: never = event
      throw new SimulationError(`Unsupported event: ${String(exhaustiveCheck)}`)
    }
  }

  return Object.freeze({
    ...nextState,
    activeEvent: event,
    metrics: updateMetrics(state.metrics, event),
  })
}
