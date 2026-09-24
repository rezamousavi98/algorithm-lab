import type { SortingExecution } from '@/domain/simulation/sorting-execution'
import type { useSortingPlayback } from './use-sorting-playback'
import { SortingVisualizer } from './sorting-visualizer'

type ExecutionSurfaceProps = Readonly<{
  execution: SortingExecution; playback: ReturnType<typeof useSortingPlayback>
  executionError: string | null; onGenerate: () => void
}>

export function ExecutionSurface({ execution, playback, executionError, onGenerate }: ExecutionSurfaceProps) {
  return <>
    {executionError ? <div className="execution-error" role="alert">{executionError}</div> : <SortingVisualizer execution={execution} playback={playback} onGenerate={onGenerate}/>}
  </>
}
