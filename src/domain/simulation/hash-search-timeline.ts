import type { Timeline } from '../playback/types'
import type { HashSearchExecution, HashSearchVisualizationState } from '../algorithms/searching/hash/types'
import { getHashSearchStateAtStep } from './hash-search-execution'

export function createHashSearchTimeline(execution: HashSearchExecution): Timeline<HashSearchVisualizationState> {
  return {
    totalSteps: execution.events.length,
    getState: step => getHashSearchStateAtStep(execution, step),
  }
}
