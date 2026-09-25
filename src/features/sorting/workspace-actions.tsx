import type { PlaybackTransport } from '@/domain/playback/types'
import { DatasetControls, type DatasetControlsProps } from './dataset-controls'
import { WorkspaceActions as SharedActions } from '@/features/workspace/workspace-actions'

export function WorkspaceActions({ playback, dataset, onSpeedChange }: Readonly<{
  playback: PlaybackTransport; dataset: DatasetControlsProps; onSpeedChange: (speed: number) => void
}>) {
  return <SharedActions playback={playback} onSpeedChange={onSpeedChange}><DatasetControls {...dataset}/></SharedActions>
}
