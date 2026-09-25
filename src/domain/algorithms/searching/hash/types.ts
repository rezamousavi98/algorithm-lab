import type { AlgorithmDefinition, CoreAlgorithmEvent, Complexity, PseudocodeLine, VariableValue } from '../../types'
import type { HashCollisionStrategy, HashTable } from '../../../structures/hash-table/types'

export type HashSearchInput = Readonly<{
  table: HashTable
  key: number
}>

export type HashSearchLocation = Readonly<{
  kind: 'bucket' | 'slot'
  index: number
}>

export type HashSearchSpecificEvent =
  | Readonly<{ type: 'hashCode'; homeIndex: number; step: number | null }>
  | Readonly<{ type: 'hashProbe'; location: HashSearchLocation; probeNumber: number }>
  | Readonly<{ type: 'hashCompare'; entryId: string; key: number; target: number }>
  | Readonly<{ type: 'hashChainAdvance'; nextChainIndex: number }>
  | Readonly<{ type: 'hashAdvance'; nextProbeNumber: number }>
  | Readonly<{ type: 'hashResult'; result: 'found'; entryId: string }>
  | Readonly<{ type: 'hashResult'; result: 'not-found' }>

export type HashSearchAlgorithmEvent = CoreAlgorithmEvent | HashSearchSpecificEvent
export type HashSearchAlgorithmDefinition = Omit<
  AlgorithmDefinition<HashSearchInput, HashSearchAlgorithmEvent>, 'stable' | 'inPlace'
> & Readonly<{ category: 'searching'; strategy: HashCollisionStrategy }>

export type HashSearchMetrics = Readonly<{
  steps: number
  probes: number
  comparisons: number
}>

export type HashSearchResult =
  | Readonly<{ status: 'pending' }>
  | Readonly<{ status: 'found'; entryId: string; key: number; value: number; location: HashSearchLocation; chainIndex?: number }>
  | Readonly<{ status: 'not-found' }>

export type HashSearchVisualizationState = Readonly<{
  table: HashTable
  key: number
  homeIndex: number | null
  stepSize: number | null
  activeLocation: HashSearchLocation | null
  activeChainIndex: number | null
  activeProbeNumber: number | null
  activeEntryId: string | null
  activeCompared: boolean
  matchedEntryId: string | null
  visitedLocations: readonly HashSearchLocation[]
  variables: Readonly<Record<string, VariableValue>>
  currentMessage: string | null
  currentPseudocodeLineId: string | null
  activeEvent: HashSearchAlgorithmEvent | null
  result: HashSearchResult
  metrics: HashSearchMetrics
}>

export type HashSearchExecution = Readonly<{
  input: HashSearchInput
  events: readonly HashSearchAlgorithmEvent[]
  snapshots: readonly HashSearchVisualizationState[]
}>

export type HashSearchExecutionResult =
  | Readonly<{ ok: true; execution: HashSearchExecution }>
  | Readonly<{ ok: false; error: Readonly<{ code: 'invalid-input' | 'executor-failed' | 'invalid-event' | 'event-limit'; message: string }> }>

export type HashSearchDefinitionInput = Omit<HashSearchAlgorithmDefinition, 'category'> & Readonly<{
  complexity: Complexity
  pseudocode: readonly PseudocodeLine[]
}>
