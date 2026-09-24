import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { createPlaybackState, playbackReducer } from '@/domain/playback/playback-reducer'
import type { PlaybackAction, PlaybackController, Timeline } from '@/domain/playback/types'
import { usePlaybackShortcuts } from './use-playback-shortcuts'

type TimedAction = Readonly<{ action: PlaybackAction; elapsedMs: number }>

/** Mount one controller per execution. The caller keys the workspace by run. */
export function usePlayback<TState>(timeline: Timeline<TState>, initialSpeed = 1):
  PlaybackController & Readonly<{ simulation: TState }> {
  const [state, dispatch] = useReducer(
    (current: ReturnType<typeof createPlaybackState>, event: TimedAction) =>
      playbackReducer(current, event.action, timeline.totalSteps, event.elapsedMs),
    initialSpeed,
    createPlaybackState,
  )
  const lastActionAt = useRef<number | null>(null)
  const send = useCallback((action: PlaybackAction) => {
    const now = performance.now()
    const elapsedMs = lastActionAt.current === null ? 0 : now - lastActionAt.current
    lastActionAt.current = now
    dispatch({ action, elapsedMs })
  }, [])

  useEffect(() => {
    if (state.status !== 'playing') return
    const timer = window.setTimeout(() => send({ type: 'tick' }), 1000 / state.speed)
    return () => window.clearTimeout(timer)
  }, [state.currentStep, state.speed, state.status, send])

  usePlaybackShortcuts(state.status, send)
  const simulation = useMemo(
    () => timeline.getState(state.currentStep),
    [timeline, state.currentStep],
  )

  return {
    state,
    totalSteps: timeline.totalSteps,
    simulation,
    play: () => send({ type: 'play' }),
    pause: () => send({ type: 'pause' }),
    stepForward: () => send({ type: 'advance' }),
    stepBackward: () => send({ type: 'back' }),
    seek: (step) => send({ type: 'seek', step }),
    reset: () => send({ type: 'reset' }),
    jumpToEnd: () => send({ type: 'end' }),
    setSpeed: (value) => send({ type: 'speed', value }),
  }
}
