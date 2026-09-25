import { useMemo } from 'react'
import type { SearchingAlgorithmDefinition, SearchingAlgorithmEvent } from '@/domain/algorithms/types'
import { createSearchingExecution, type SearchingExecution } from '@/domain/simulation/searching-execution'
import { createInitialSearchingState } from '@/domain/simulation/searching-reducer'
import { WorkspaceErrorBoundary } from '@/components/workspace-error-boundary'
import { useSearchingInput } from './use-searching-input'
import { SearchingWorkspace, type SearchingControls } from './searching-workspace'

export function SearchingCategory({ algorithm, arraySize, speed, onSizeChange, onSpeedChange }: { algorithm: SearchingAlgorithmDefinition<SearchingAlgorithmEvent>; arraySize: number; speed: number; onSizeChange: (size: number) => void; onSpeedChange: (speed: number) => void }) {
  const data = useSearchingInput(arraySize, onSizeChange)
  const result = useMemo(() => createSearchingExecution(algorithm, data.input), [algorithm, data.input])
  const safeExecution: SearchingExecution = result.ok ? result.execution : { input: data.input, events: [], snapshots: [createInitialSearchingState(data.input)] }
  const controls: SearchingControls = {
    valuesDraft: data.valuesDraft, targetDraft: data.targetDraft, error: data.error, pattern: data.pattern,
    onValuesDraft: data.setValuesDraft, onTargetDraft: data.setTargetDraft, onApply: data.apply, onSortCopy: data.sortCopy,
    onGenerate: data.generate, onPattern: data.setPattern,
  }
  return <WorkspaceErrorBoundary category="searching" key={`${algorithm.id}-${data.runVersion}`}><SearchingWorkspace algorithm={algorithm} execution={safeExecution} inputError={result.ok ? null : result.error.message} controls={controls} initialSpeed={speed} onSpeedChange={onSpeedChange}/></WorkspaceErrorBoundary>
}

