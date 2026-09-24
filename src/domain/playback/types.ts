import type { PlaybackStatus } from '../algorithms/types'

export type PlaybackState = Readonly<{
  currentStep: number
  status: PlaybackStatus
  speed: number
  elapsedMs: number
}>

export type PlaybackAction =
  | Readonly<{ type: 'play' }>
  | Readonly<{ type: 'pause' }>
  | Readonly<{ type: 'advance' }>
  | Readonly<{ type: 'tick' }>
  | Readonly<{ type: 'back' }>
  | Readonly<{ type: 'seek'; step: number }>
  | Readonly<{ type: 'reset' }>
  | Readonly<{ type: 'end' }>
  | Readonly<{ type: 'speed'; value: number }>

export type PlaybackController = Readonly<{
  state: PlaybackState
  totalSteps: number
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBackward: () => void
  seek: (step: number) => void
  reset: () => void
  jumpToEnd: () => void
  setSpeed: (speed: number) => void
}>


/** Timeline storage is hidden behind this category-independent read interface. */
export type Timeline<TState> = Readonly<{
  totalSteps: number
  getState: (step: number) => TState
}>

export type PlaybackTransport = Pick<PlaybackController,
  'state' | 'totalSteps' | 'play' | 'pause' | 'reset' | 'stepForward' |
  'stepBackward' | 'jumpToEnd' | 'setSpeed'>
