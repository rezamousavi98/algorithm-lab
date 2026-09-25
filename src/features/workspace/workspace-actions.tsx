import type { ReactNode } from 'react'
import type { PlaybackTransport } from '@/domain/playback/types'
import { PlaybackControls } from '@/features/playback/playback-controls'

export function WorkspaceActions({ playback, onSpeedChange, children }: Readonly<{
  playback: PlaybackTransport; onSpeedChange: (speed: number) => void; children: ReactNode
}>) {
  return <section className="workspace-actions" aria-label="Visualization controls">
    <div className="compact-playback"><PlaybackControls compact playback={playback} onSpeedChange={onSpeedChange} /></div>
    {children}
  </section>
}
