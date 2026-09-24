import type { PlaybackTransport } from '@/domain/playback/types'
import { DatasetControls, type DatasetControlsProps } from './dataset-controls'
import { PlaybackControls } from './playback-controls'

type WorkspaceActionsProps = Readonly<{
  playback: PlaybackTransport
  dataset: DatasetControlsProps
  onSpeedChange: (speed: number) => void
}>

export function WorkspaceActions({ playback, dataset, onSpeedChange }: WorkspaceActionsProps) {
  return <section className="workspace-actions" aria-label="Visualization controls">
    <div className="compact-playback"><PlaybackControls compact playback={playback} onSpeedChange={onSpeedChange} /></div>
    <DatasetControls {...dataset} />
  </section>
}
