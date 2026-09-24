import { Component, Fragment, type ErrorInfo, type ReactNode } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'

type WorkspaceErrorBoundaryProps = Readonly<{ children: ReactNode }>
type WorkspaceErrorBoundaryState = Readonly<{ error: Error | null; generation: number }>

export class WorkspaceErrorBoundary extends Component<
  WorkspaceErrorBoundaryProps,
  WorkspaceErrorBoundaryState
> {
  state: WorkspaceErrorBoundaryState = { error: null, generation: 0 }

  static getDerivedStateFromError(error: Error): Partial<WorkspaceErrorBoundaryState> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Algorithm workspace failed to render.', error, info.componentStack)
  }

  private resetWorkspace = () => {
    this.setState((state) => ({ error: null, generation: state.generation + 1 }))
  }

  private reloadApplication = () => window.location.reload()

  render() {
    const { error, generation } = this.state
    if (error) {
      return (
        <section className="workspace-recovery" role="alert">
          <div className="recovery-icon">!</div>
          <h2>The visualization encountered a problem</h2>
          <p>Your input is still in this browser session. Reset the visualization or return to the algorithm list.</p>
          <div className="recovery-actions">
            <button className="button primary" onClick={this.resetWorkspace}><RotateCcw size={15} />Reset visualization</button>
            <a className="button" href="#sorting-algorithms">Return to algorithms <ArrowRight size={14} /></a>
            <button className="recovery-reload" onClick={this.reloadApplication}>Reload app</button>
          </div>
        </section>
      )
    }
    return <Fragment key={generation}>{this.props.children}</Fragment>
  }
}
