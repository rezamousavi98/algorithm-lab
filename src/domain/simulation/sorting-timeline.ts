import type { Timeline } from '../playback/types'
import type { SortingVisualizationState } from '../algorithms/types'
import { getSortingStateAtStep, type SortingExecution } from './sorting-execution'
import { createInitialSortingState } from './sorting-reducer'

export function createSortingTimeline(execution: SortingExecution | null): Timeline<SortingVisualizationState> {
  const initialState = createInitialSortingState([])
  return {
    totalSteps: execution?.session.events.length ?? 0,
    getState: execution ? (step) => getSortingStateAtStep(execution, step) : () => initialState,
  }
}
