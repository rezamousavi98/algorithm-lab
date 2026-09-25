import type { CoreAlgorithmEvent, PseudocodeLine, VariableValue } from '../../types'
import type { SearchableTree } from '../../../structures/binary-tree/types'

export type TreeSearchInput = Readonly<{ tree: SearchableTree; target: number }>
export type TreeFrontierMode = 'stack' | 'queue'
export type TreeFrontierItem = Readonly<{ nodeId: string; depth: number }>
export type TreeSearchSpecificEvent =
  | Readonly<{ type: 'treeFrontier'; action: 'push' | 'pop'; mode: TreeFrontierMode; nodeId: string; depth: number }>
  | Readonly<{ type: 'treeFollow'; fromId: string; toId: string; side: 'left' | 'right' }>
  | Readonly<{ type: 'treeVisit'; nodeId: string; depth: number }>
  | Readonly<{ type: 'treeCompare'; nodeId: string; key: number; target: number }>
  | Readonly<{ type: 'treePath'; nodeIds: readonly string[] }>
  | Readonly<{ type: 'treeResult'; result: 'found'; nodeId: string }>
  | Readonly<{ type: 'treeResult'; result: 'not-found' }>
export type TreeSearchEvent = CoreAlgorithmEvent | TreeSearchSpecificEvent
export type TreeSearchAlgorithmDefinition = Readonly<{
  id: string; name: string; category: 'searching'; description: string; shortDescription: string; displayOrder: number
  useCases: readonly string[]; complexity: Readonly<{ best: string; average: string; worst: string; space: string }>
  pseudocode: readonly PseudocodeLine[]; requiresTree: 'bst' | 'binary-tree'
  execute: (input: TreeSearchInput) => Iterable<TreeSearchEvent>
}>
export type TreeSearchMetrics = Readonly<{ steps: number; visits: number; comparisons: number; frontierPeak: number }>
export type TreeSearchResult =
  | Readonly<{ status: 'pending' }>
  | Readonly<{ status: 'found'; nodeId: string; key: number; value: number; path: readonly string[] }>
  | Readonly<{ status: 'not-found' }>
export type TreeSearchVisualizationState = Readonly<{
  tree: SearchableTree; target: number; activeNodeId: string | null; activeDepth: number | null; activeCompared: boolean
  frontierMode: TreeFrontierMode | null; frontier: readonly TreeFrontierItem[]; visitedNodeIds: readonly string[]
  activePath: readonly string[]; variables: Readonly<Record<string, VariableValue>>; currentMessage: string | null
  currentPseudocodeLineId: string | null; activeEvent: TreeSearchEvent | null; result: TreeSearchResult; metrics: TreeSearchMetrics
}>
export type TreeSearchExecution = Readonly<{ input: TreeSearchInput; events: readonly TreeSearchEvent[]; snapshots: readonly TreeSearchVisualizationState[] }>
export type TreeSearchExecutionResult =
  | Readonly<{ ok: true; execution: TreeSearchExecution }>
  | Readonly<{ ok: false; error: Readonly<{ code: 'invalid-input' | 'executor-failed' | 'invalid-event' | 'event-limit'; message: string }> }>
