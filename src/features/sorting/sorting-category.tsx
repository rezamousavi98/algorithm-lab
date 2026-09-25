import { useMemo } from 'react'
import type { AlgorithmDefinition, AlgorithmEvent, SortingInput } from '@/domain/algorithms/types'
import { createSortingExecution } from '@/domain/simulation/sorting-execution'
import { WorkspaceErrorBoundary } from '@/components/workspace-error-boundary'
import { useSortingInput } from './use-sorting-input'
import { SortingWorkspace } from './sorting-workspace'

export function SortingCategory({ algorithm, arraySize, speed, onSizeChange, onSpeedChange }: { algorithm: AlgorithmDefinition<SortingInput, AlgorithmEvent>; arraySize: number; speed: number; onSizeChange: (size: number) => void; onSpeedChange: (speed: number) => void }) {
  const dataset = useSortingInput(arraySize, onSizeChange)
  const result = useMemo(() => createSortingExecution(algorithm, dataset.input), [algorithm, dataset.input])
  return <WorkspaceErrorBoundary category="sorting" key={`${algorithm.id}-${dataset.runVersion}`}><SortingWorkspace algorithm={algorithm} execution={result.ok ? result.execution : null} executionError={result.ok ? null : result.error.message} dataset={dataset.controls} initialSpeed={speed} onSpeedChange={onSpeedChange}/></WorkspaceErrorBoundary>
}

