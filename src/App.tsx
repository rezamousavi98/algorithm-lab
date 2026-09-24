import { AppSidebar } from '@/components/app-sidebar'
import { AppTopbar } from '@/components/app-topbar'
import { WorkspaceErrorBoundary } from '@/components/workspace-error-boundary'
import { SortingWorkspace } from '@/features/sorting/sorting-workspace'
import { useAlgorithmLab } from '@/features/sorting/use-algorithm-lab'
import './App.css'

export default function App() {
  const lab = useAlgorithmLab()

  return <div className="app-shell">
    <AppTopbar theme={lab.theme} onThemeToggle={lab.toggleTheme} />
    <AppSidebar algorithms={lab.algorithms} selectedId={lab.selectedId} onSelect={lab.selectAlgorithm} />
    <main className="main-area">
      <WorkspaceErrorBoundary key={`${lab.selectedId}-${lab.runVersion}`}>
        <SortingWorkspace
          algorithm={lab.algorithm}
          execution={lab.executionResult.ok ? lab.executionResult.execution : null}
          executionError={lab.executionResult.ok ? null : lab.executionResult.error.message}
          dataset={lab.dataset}
          initialSpeed={lab.playbackSpeed}
          onSpeedChange={lab.setSpeed}
        />
      </WorkspaceErrorBoundary>
    </main>
  </div>
}
