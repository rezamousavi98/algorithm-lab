import { createAlgorithmRegistry } from '../../registry'
import { bstLookup } from './bst-lookup'
import { depthFirstTreeSearch } from './depth-first-search'
import { breadthFirstTreeSearch } from './breadth-first-search'

export { bstLookup, depthFirstTreeSearch, breadthFirstTreeSearch }
export { defineTreeSearchAlgorithm, makeTreeSearchPseudocode, MAX_TREE_SEARCH_EVENTS, validateTreeSearchInput } from './shared'
export const treeSearchingAlgorithms = Object.freeze([bstLookup, depthFirstTreeSearch, breadthFirstTreeSearch])
export const treeSearchingAlgorithmRegistry = createAlgorithmRegistry(treeSearchingAlgorithms)
export type { TreeFrontierItem, TreeFrontierMode, TreeSearchAlgorithmDefinition, TreeSearchEvent, TreeSearchExecution, TreeSearchExecutionResult, TreeSearchInput, TreeSearchMetrics, TreeSearchResult, TreeSearchVisualizationState } from './types'
