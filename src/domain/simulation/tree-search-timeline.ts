import type { Timeline } from '../playback/types'
import type { TreeSearchExecution, TreeSearchVisualizationState } from '../algorithms/searching/tree/types'
import { getTreeSearchStateAtStep } from './tree-search-execution'

export function createTreeSearchTimeline(execution: TreeSearchExecution): Timeline<TreeSearchVisualizationState> {
  return { totalSteps: execution.events.length, getState: step => getTreeSearchStateAtStep(execution, step) }
}
