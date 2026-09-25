import type { SortingMetrics } from '@/domain/algorithms/types'

export function MetricsStrip({ metrics, elapsedMs }: Readonly<{ metrics: SortingMetrics; elapsedMs: number }>) {
  return <div className="metrics-strip" role="group" aria-label="Operation metrics">
    <span><b>{metrics.comparisons.toLocaleString()}</b> comparisons</span><span><b>{metrics.swaps.toLocaleString()}</b> swaps</span><span><b>{metrics.reads.toLocaleString()}</b> reads</span><span><b>{metrics.writes.toLocaleString()}</b> writes</span>
    <span><b>{(elapsedMs / 1000).toFixed(1)}s</b> playback time</span>
  </div>
}
