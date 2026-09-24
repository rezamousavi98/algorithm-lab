import { quickSort } from '@/domain/algorithms/sorting/quick-sort'
import { createSortingExecution, type SortingExecution } from '@/domain/simulation/sorting-execution'
import { AppSidebar } from '@/components/app-sidebar'
import { AppTopbar } from '@/components/app-topbar'
import { WorkspaceErrorBoundary } from '@/components/workspace-error-boundary'
import { SortingWorkspace } from '@/features/sorting/sorting-workspace'
import { useAlgorithmLab } from '@/features/sorting/use-algorithm-lab'
import './App.css'

const emptyExecutionResult = createSortingExecution(quickSort, [])
if (!emptyExecutionResult.ok) throw new Error(emptyExecutionResult.error.message)
const EMPTY_EXECUTION: SortingExecution = emptyExecutionResult.execution

export default function App() {
  const lab = useAlgorithmLab()

  return <div className="app-shell">
    <AppTopbar theme={lab.theme} onThemeToggle={lab.toggleTheme} />
    <AppSidebar selectedId={lab.selectedId} onSelect={lab.selectAlgorithm} />
    <main className="main-area">
      <WorkspaceErrorBoundary key={`${lab.selectedId}-${lab.runVersion}`}>
        <SortingWorkspace
          algorithm={lab.algorithm}
          execution={lab.executionResult.ok ? lab.executionResult.execution : EMPTY_EXECUTION}
          executionError={lab.executionResult.ok ? null : lab.executionResult.error.message}
          arraySize={lab.arraySize}
          initialSpeed={lab.playbackSpeed}
          pattern={lab.pattern}
          inputMode={lab.inputMode}
          manualDraft={lab.manualDraft}
          manualError={lab.manualError}
          onArraySizeChange={lab.setArraySize}
          onPatternChange={lab.setPattern}
          onInputModeChange={lab.setInputMode}
          onManualDraftChange={lab.setManualDraft}
          onApplyManual={lab.applyManualInput}
          onGenerate={lab.generate}
          onSpeedChange={lab.setSpeed}
        />
      </WorkspaceErrorBoundary>
    </main>
  </div>
}
