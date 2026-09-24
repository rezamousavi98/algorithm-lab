import { useEffect } from 'react'
import type { PlaybackAction, PlaybackState } from '@/domain/playback/types'

export function usePlaybackShortcuts(status: PlaybackState['status'], send: (action: PlaybackAction) => void) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        (target instanceof HTMLElement && target.closest('input, select, textarea, button, a, [contenteditable="true"]'))
      ) return

      if (event.code === 'Space') {
        event.preventDefault()
        send({ type: status === 'playing' ? 'pause' : 'play' })
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        send({ type: 'advance' })
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        send({ type: 'back' })
      } else if (event.key.toLowerCase() === 'r') {
        send({ type: 'reset' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [status, send])

}
