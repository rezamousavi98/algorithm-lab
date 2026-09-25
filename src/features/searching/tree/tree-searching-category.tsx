import { useMemo } from 'react'
import type { TreeSearchAlgorithmDefinition } from '@/domain/algorithms/searching/tree'
import { createTreeSearchExecution } from '@/domain/simulation/tree-search-execution'
import { createInitialTreeSearchState } from '@/domain/simulation/tree-search-reducer'
import { WorkspaceErrorBoundary } from '@/components/workspace-error-boundary'
import { useTreeSearchInput } from './use-tree-search-input'
import { TreeSearchWorkspace } from './tree-search-workspace'

export function TreeSearchingCategory({ algorithm, speed, onSpeedChange }: { algorithm: TreeSearchAlgorithmDefinition; speed: number; onSpeedChange: (speed: number) => void }) {
  const data = useTreeSearchInput()
  const result = useMemo(() => createTreeSearchExecution(algorithm, data.input), [algorithm, data.input])
  const execution = result.ok ? result.execution : { input: data.input, events: [], snapshots: [createInitialTreeSearchState(data.input)] }
  return <WorkspaceErrorBoundary category="searching">
    <TreeSearchWorkspace key={`${algorithm.id}-${data.runVersion}`} algorithm={algorithm} execution={execution}
      inputError={result.ok ? data.inputError : result.error.message} controls={data.controls} speed={speed} onSpeedChange={onSpeedChange}/>
  </WorkspaceErrorBoundary>
}
