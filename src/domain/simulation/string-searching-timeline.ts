import type { Timeline } from '../playback/types'
import type { StringSearchingVisualizationState } from '../algorithms/types'
import { getStringSearchingStateAtStep, type StringSearchingExecution } from './string-searching-execution'

export function createStringSearchingTimeline(execution: StringSearchingExecution): Timeline<StringSearchingVisualizationState> {
  return { totalSteps: execution.events.length, getState: step => getStringSearchingStateAtStep(execution, step) }
}
