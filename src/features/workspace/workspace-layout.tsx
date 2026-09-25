import type { ReactNode } from 'react'
import type { AlgorithmLearningContent, PlaybackStatus } from '@/domain/algorithms/types'
import { AppFooter } from '@/components/app-footer'

const STATUS_LABELS = { idle: 'Ready', playing: 'Running', paused: 'Paused', completed: 'Complete' }

type Props = Readonly<{
  algorithm: Pick<AlgorithmLearningContent, 'name' | 'description'>
  categoryLabel: string
  status: PlaybackStatus
  actions: ReactNode
  inspector: ReactNode
  children: ReactNode
}>

/** Shared positions; each category supplies its own input, renderer and learning content. */
export function WorkspaceLayout({ algorithm, categoryLabel, status, actions, inspector, children }: Props) {
  return <section className="workspace-grid" aria-label={`${algorithm.name} workspace`}>
    <div className="work-main">
      <div className="algorithm-heading">
        <div className="breadcrumbs"><span>{categoryLabel}</span><span aria-hidden="true">›</span><strong>{algorithm.name}</strong></div>
        <div className="heading-row"><h1>{algorithm.name}</h1><span className={`active-pill status-${status}`}><i />{STATUS_LABELS[status]}</span></div>
        <p className="algorithm-description">{algorithm.description}</p>
      </div>
      {children}
      <AppFooter />
    </div>
    <div className="workspace-aside">{actions}{inspector}</div>
  </section>
}
