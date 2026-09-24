import { FastForward, Pause, Play, RotateCcw, StepBack, StepForward } from 'lucide-react'
import { useSortingPlayback } from './use-sorting-playback'

const SPEEDS = [0.25, 0.5, 1, 2, 4]
type PlaybackControlsProps = Readonly<{ playback: ReturnType<typeof useSortingPlayback>; onSpeedChange: (speed: number) => void }>

export function PlaybackControls({ playback, onSpeedChange }: PlaybackControlsProps) {
  const { state, play, pause, reset, stepBackward, stepForward, jumpToEnd, setSpeed } = playback
  const playing = state.status === 'playing'
  return <>
    <div className="playback-buttons" role="group" aria-label="Playback controls">
      <button className="button primary" onClick={playing ? pause : play} aria-label={playing ? 'Pause visualization' : 'Play visualization'}>{playing ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}{playing ? 'Pause' : 'Play'}</button>
      <button className="button" onClick={reset} aria-label="Restart visualization"><RotateCcw size={16}/>Reset</button>
      <button className="button step-control" onClick={stepBackward} disabled={state.currentStep === 0} aria-label="Previous step"><StepBack size={16}/>Previous</button>
      <button className="button step-control" onClick={stepForward} disabled={state.currentStep >= playback.totalSteps} aria-label="Next step"><StepForward size={16}/>Next</button>
      <button className="button end-control" onClick={jumpToEnd} disabled={state.currentStep >= playback.totalSteps} aria-label="Jump to end"><FastForward size={16}/>End</button>
    </div>
    <label className="control-select speed-select"><span>Speed</span><select value={state.speed} aria-label="Playback speed" onChange={(event) => { const speed = Number(event.target.value); setSpeed(speed); onSpeedChange(speed) }}>{SPEEDS.map((speed) => <option value={speed} key={speed}>{speed}×</option>)}</select><span className="select-caret">⌄</span></label>
  </>
}
