import { useEffect, useMemo, useReducer } from 'react'
import { getSortingStateAtStep, type SortingExecution } from '@/domain/simulation/sorting-execution'
import type { PlaybackStatus, SortingVisualizationState } from '@/domain/algorithms/types'

type PlaybackState = Readonly<{
  currentStep: number
  status: PlaybackStatus
  speed: number
}>

type PlaybackAction =
  | Readonly<{ type: 'play' }>
  | Readonly<{ type: 'pause' }>
  | Readonly<{ type: 'advance' }>
  | Readonly<{ type: 'tick' }>
  | Readonly<{ type: 'back' }>
  | Readonly<{ type: 'seek'; step: number }>
  | Readonly<{ type: 'reset' }>
  | Readonly<{ type: 'end' }>
  | Readonly<{ type: 'speed'; value: number }>

type PlaybackController = Readonly<{
  state: PlaybackState
  totalSteps: number
  simulation: SortingVisualizationState
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBackward: () => void
  seek: (step: number) => void
  reset: () => void
  jumpToEnd: () => void
  setSpeed: (speed: number) => void
}>

const INITIAL_SPEED = 1

function createInitialState(speed: number): PlaybackState {
  return Object.freeze({ currentStep: 0, status: 'idle', speed })
}

function playbackReducer(state: PlaybackState, action: PlaybackAction, totalSteps: number): PlaybackState {
  switch (action.type) {
    case 'play':
      if (totalSteps === 0) return Object.freeze({ ...state, status: 'completed' })
      return Object.freeze({
        ...state,
        currentStep: state.currentStep >= totalSteps ? 0 : state.currentStep,
        status: 'playing',
      })
    case 'pause':
      return Object.freeze({ ...state, status: 'paused' })
    case 'advance': {
      const currentStep = Math.min(totalSteps, state.currentStep + 1)
      return Object.freeze({ ...state, currentStep, status: currentStep >= totalSteps ? 'completed' : 'paused' })
    }
    case 'tick': {
      const currentStep = Math.min(totalSteps, state.currentStep + 1)
      return Object.freeze({ ...state, currentStep, status: currentStep >= totalSteps ? 'completed' : 'playing' })
    }
    case 'back':
      return Object.freeze({ ...state, currentStep: Math.max(0, state.currentStep - 1), status: 'paused' })
    case 'seek': {
      const currentStep = Math.max(0, Math.min(totalSteps, Math.floor(action.step)))
      return Object.freeze({
        ...state,
        currentStep,
        status: totalSteps > 0 && currentStep === totalSteps ? 'completed' : 'paused',
      })
    }
    case 'reset':
      return Object.freeze({ ...state, currentStep: 0, status: 'idle' })
    case 'end':
      return Object.freeze({ ...state, currentStep: totalSteps, status: totalSteps > 0 ? 'completed' : 'idle' })
    case 'speed':
      return Number.isFinite(action.value) && action.value > 0
        ? Object.freeze({ ...state, speed: action.value })
        : state
  }
}

/** One timer advances the precomputed history; algorithms never own playback time. */
export function useSortingPlayback(execution: SortingExecution, initialSpeed = INITIAL_SPEED): PlaybackController {
  const totalSteps = execution.session.events.length
  const [state, dispatch] = useReducer(
    (current: PlaybackState, action: PlaybackAction) => playbackReducer(current, action, totalSteps),
    initialSpeed,
    createInitialState,
  )

  useEffect(() => {
    if (state.status !== 'playing') return undefined
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), 1000 / state.speed)
    return () => window.clearTimeout(timer)
  }, [state.currentStep, state.speed, state.status, totalSteps])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        (target instanceof HTMLElement && target.closest('input, select, textarea, button, a, [contenteditable="true"]'))
      ) return

      if (event.code === 'Space') {
        event.preventDefault()
        dispatch({ type: state.status === 'playing' ? 'pause' : 'play' })
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        dispatch({ type: 'advance' })
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        dispatch({ type: 'back' })
      } else if (event.key.toLowerCase() === 'r') {
        dispatch({ type: 'reset' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state.status])

  const simulation = useMemo(
    () => getSortingStateAtStep(execution, state.currentStep),
    [execution, state.currentStep],
  )

  return {
    state,
    totalSteps,
    simulation,
    play: () => dispatch({ type: 'play' }),
    pause: () => dispatch({ type: 'pause' }),
    stepForward: () => dispatch({ type: 'advance' }),
    stepBackward: () => dispatch({ type: 'back' }),
    seek: (step) => dispatch({ type: 'seek', step }),
    reset: () => dispatch({ type: 'reset' }),
    jumpToEnd: () => dispatch({ type: 'end' }),
    setSpeed: (speed) => dispatch({ type: 'speed', value: speed }),
  }
}
