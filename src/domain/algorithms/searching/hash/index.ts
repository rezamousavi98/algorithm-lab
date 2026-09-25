import { createAlgorithmRegistry } from '../../registry'
import { separateChainingLookup } from './separate-chaining-lookup'
import { linearProbingLookup } from './linear-probing-lookup'
import { doubleHashingLookup } from './double-hashing-lookup'

export { defineHashSearchAlgorithm, makeHashSearchPseudocode, MAX_HASH_SEARCH_EVENTS, validateHashSearchInput } from './shared'
export { separateChainingLookup }
export { linearProbingLookup }
export { doubleHashingLookup }
export const hashSearchingAlgorithms = Object.freeze([separateChainingLookup, linearProbingLookup, doubleHashingLookup])
export const hashSearchingAlgorithmRegistry = createAlgorithmRegistry(hashSearchingAlgorithms)
export type {
  HashSearchAlgorithmDefinition,
  HashSearchAlgorithmEvent,
  HashSearchExecution,
  HashSearchExecutionResult,
  HashSearchInput,
  HashSearchLocation,
  HashSearchMetrics,
  HashSearchResult,
  HashSearchVisualizationState,
} from './types'
