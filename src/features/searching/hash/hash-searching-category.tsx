import { useMemo } from 'react'
import type { HashSearchAlgorithmDefinition } from '@/domain/algorithms/searching/hash/types'
import { createHashSearchExecution } from '@/domain/simulation/hash-search-execution'
import { createInitialHashSearchState } from '@/domain/simulation/hash-search-reducer'
import { WorkspaceErrorBoundary } from '@/components/workspace-error-boundary'
import { useHashSearchInput } from './use-hash-search-input'
import { HashSearchingWorkspace, type HashSearchControls } from './hash-searching-workspace'

export function HashSearchingCategory({ algorithm, speed, onSpeedChange }: {
  algorithm: HashSearchAlgorithmDefinition
  speed: number
  onSpeedChange: (speed: number) => void
}) {
  const data = useHashSearchInput(algorithm.strategy)
  const result = useMemo(() => createHashSearchExecution(algorithm, data.input), [algorithm, data.input])
  const execution = result.ok ? result.execution : { input: data.input, events: [], snapshots: [createInitialHashSearchState(data.input)] }
  const controls: HashSearchControls = data.controls
  return <WorkspaceErrorBoundary category="searching" key={`${algorithm.id}-${data.runVersion}`}>
    <HashSearchingWorkspace algorithm={algorithm} execution={execution} inputError={result.ok ? null : result.error.message}
      controls={controls} speed={speed} onSpeedChange={onSpeedChange}/>
  </WorkspaceErrorBoundary>
}
