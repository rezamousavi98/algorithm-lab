import type { PlaybackState, PlaybackAction } from './types'

function reduceAction(state: PlaybackState, action: PlaybackAction, totalSteps: number): PlaybackState {
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
      if (!Number.isFinite(action.step)) return state
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


export function createPlaybackState(speed = 1): PlaybackState {
  return { currentStep: 0, status: 'idle', speed, elapsedMs: 0 }
}

/** Clock readings are supplied by the caller; the transition itself stays pure. */
export function playbackReducer(
  state: PlaybackState,
  action: PlaybackAction,
  totalSteps: number,
  elapsedMs = 0,
): PlaybackState {
  const restarting = action.type === 'reset' ||
    (action.type === 'play' && state.currentStep >= totalSteps)
  const next = reduceAction(state, action, totalSteps)
  return {
    ...next,
    elapsedMs: restarting ? 0 : state.elapsedMs +
      (state.status === 'playing' ? Math.max(0, elapsedMs) : 0),
  }
}
