import { ArrowRight } from 'lucide-react'

type CompletionBannerProps = Readonly<{
  valueCount: number
  totalSteps: number
  onReplay: () => void
  onGenerate: () => void
}>

export function CompletionBanner({ valueCount, totalSteps, onReplay, onGenerate }: CompletionBannerProps) {
  return <div className="completion-banner" role="status">
    <div><strong>Sorted successfully</strong><span>{valueCount} values · {totalSteps.toLocaleString()} execution steps</span></div>
    <button className="button" onClick={onReplay}>Replay</button>
    <button className="button" onClick={onGenerate}>New array</button>
    <a href="#sorting-algorithms">Try another algorithm <ArrowRight size={13} /></a>
  </div>
}
