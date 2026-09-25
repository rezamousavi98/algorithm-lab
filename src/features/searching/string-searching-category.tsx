import { useMemo } from 'react'
import type { StringSearchingAlgorithmDefinition } from '@/domain/algorithms/types'
import { createInitialStringSearchingState } from '@/domain/simulation/string-searching-reducer'
import { createStringSearchingExecution } from '@/domain/simulation/string-searching-execution'
import { WorkspaceErrorBoundary } from '@/components/workspace-error-boundary'
import { useStringSearchInput } from './use-string-search-input'
import { StringSearchingWorkspace } from './string-searching-workspace'
import type { StringSearchControls } from './string-input-controls'

export function StringSearchingCategory({ algorithm, speed, onSpeedChange }: { algorithm: StringSearchingAlgorithmDefinition; speed: number; onSpeedChange: (speed: number) => void }) {
  const data = useStringSearchInput()
  const result = useMemo(() => createStringSearchingExecution(algorithm, data.input), [algorithm, data.input])
  const execution = result.ok ? result.execution : { input: data.input, events: [], snapshots: [createInitialStringSearchingState(data.input)] }
  const controls: StringSearchControls = {
    textDraft: data.textDraft,
    patternDraft: data.patternDraft,
    error: data.error,
    onTextChange: data.setTextDraft,
    onPatternChange: data.setPatternDraft,
    onApply: data.apply,
  }
  return <WorkspaceErrorBoundary category="searching" key={`${algorithm.id}-${data.runVersion}`}>
    <StringSearchingWorkspace algorithm={algorithm} execution={execution} inputError={result.ok ? null : result.error.message} controls={controls} speed={speed} onSpeedChange={onSpeedChange}/>
  </WorkspaceErrorBoundary>
}
