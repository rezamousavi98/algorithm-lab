import type { Timeline } from '../playback/types'
import type { SearchingVisualizationState } from '../algorithms/types'
import { getSearchingStateAtStep, type SearchingExecution } from './searching-execution'

export function createSearchingTimeline(execution: SearchingExecution): Timeline<SearchingVisualizationState> {
  return {
    totalSteps: execution.events.length,
    getState: step => getSearchingStateAtStep(execution, step),
  }
}
