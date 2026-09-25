import type { ChangeEvent, CSSProperties } from 'react'

type ExecutionTimelineProps = Readonly<{ currentStep: number; totalSteps: number; onSeek: (step: number) => void }>
export function ExecutionTimeline({ currentStep, totalSteps, onSeek }: ExecutionTimelineProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => onSeek(Number(event.target.value))
  return <div className="execution-timeline">
    <div className="timeline-labels"><span>Execution timeline</span><span>Step <strong>{currentStep.toLocaleString()}</strong> / {totalSteps.toLocaleString()}</span></div>
    <input aria-label="Seek execution timeline" type="range" min={0} max={Math.max(totalSteps, 1)} value={currentStep} disabled={totalSteps === 0} onChange={onChange} style={{ '--timeline-progress': `${totalSteps ? (currentStep / totalSteps) * 100 : 0}%` } as CSSProperties}/>
    <div className="timeline-markers"><span>Start</span><span>Step {Math.ceil(totalSteps / 2).toLocaleString()}</span><span>End</span></div>
  </div>
}

