import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const MIN_MERGE = 32
const GALLOP_THRESHOLD = 7
const pseudocode = makePseudocode([
  ['runs', 'detect ascending or strictly descending natural runs'],
  ['reverse', 'reverse strictly descending runs'],
  ['extend', 'extend short runs with stable binary insertion'],
  ['stack', 'push the run and restore merge-stack invariants'],
  ['merge', 'stably merge adjacent runs; gallop after repeated wins'],
  ['finish', 'merge remaining runs from the stack'],
])

type Entry = Readonly<{ value: number; origin: number }>
type Run = { start: number; length: number }

function minRunLength(length: number): number {
  let remainder = 0
  while (length >= MIN_MERGE) {
    remainder |= length & 1
    length >>= 1
  }
  return length + remainder
}

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  const runs: Run[] = []

  function* binaryInsertion(start: number, sortedEnd: number, end: number): Generator<AlgorithmEvent, void, undefined> {
    for (let index = sortedEnd; index < end; index += 1) {
      const value = values[index]
      let low = start
      let high = index
      while (low < high) {
        const middle = low + Math.floor((high - low) / 2)
        yield* emit({ type: 'compare', indices: [middle, index], values: [values[middle], value] }, 'extend')
        if (values[middle] <= value) low = middle + 1
        else high = middle
      }
      for (let cursor = index; cursor > low; cursor -= 1) {
        values[cursor] = values[cursor - 1]
        yield* emit({ type: 'write', index: cursor, value: values[cursor] }, 'extend')
      }
      values[low] = value
      yield* emit({ type: 'write', index: low, value }, 'extend')
    }
  }

  function* mergeAt(runIndex: number): Generator<AlgorithmEvent, void, undefined> {
    const leftRun = runs[runIndex]
    const rightRun = runs[runIndex + 1]
    let left = values.slice(leftRun.start, leftRun.start + leftRun.length).map((value, offset) => ({ value, origin: leftRun.start + offset }))
    let right = values.slice(rightRun.start, rightRun.start + rightRun.length).map((value, offset) => ({ value, origin: rightRun.start + offset }))
    let l = 0
    let r = 0
    let output = leftRun.start
    let leftWins = 0
    let rightWins = 0

    function* copy(item: Entry): Generator<AlgorithmEvent, void, undefined> {
      values[output] = item.value
      yield* emit({ type: 'write', index: output, value: item.value }, 'merge')
      output += 1
    }
    function* updateBuffer(): Generator<AlgorithmEvent, void, undefined> {
      yield { type: 'auxiliaryUpdate', panelId: 'timsort-merge-buffer', label: 'Merge buffer', values: [...values.slice(leftRun.start, output)] }
    }

    yield* emit({ type: 'range', role: 'merge', indices: [leftRun.start, rightRun.start + rightRun.length - 1] }, 'merge')
    while (l < left.length && r < right.length) {
      yield* emit({ type: 'compare', indices: [left[l].origin, right[r].origin], values: [left[l].value, right[r].value] }, 'merge')
      if (left[l].value <= right[r].value) {
        yield* copy(left[l++]); leftWins += 1; rightWins = 0
      } else {
        yield* copy(right[r++]); rightWins += 1; leftWins = 0
      }
      yield* updateBuffer()

      if (leftWins >= GALLOP_THRESHOLD && r < right.length) {
        const key = right[r].value
        let low = l; let high = left.length
        while (low < high) {
          const middle = low + Math.floor((high - low) / 2)
          yield* emit({ type: 'compare', indices: [left[middle].origin, right[r].origin], values: [left[middle].value, key] }, 'merge')
          if (left[middle].value <= key) low = middle + 1; else high = middle
        }
        while (l < low) { yield* copy(left[l++]); yield* updateBuffer() }
        leftWins = 0
      } else if (rightWins >= GALLOP_THRESHOLD && l < left.length) {
        const key = left[l].value
        let low = r; let high = right.length
        while (low < high) {
          const middle = low + Math.floor((high - low) / 2)
          yield* emit({ type: 'compare', indices: [left[l].origin, right[middle].origin], values: [key, right[middle].value] }, 'merge')
          if (right[middle].value < key) low = middle + 1; else high = middle
        }
        while (r < low) { yield* copy(right[r++]); yield* updateBuffer() }
        rightWins = 0
      }
    }
    while (l < left.length) { yield* copy(left[l++]); yield* updateBuffer() }
    while (r < right.length) { yield* copy(right[r++]); yield* updateBuffer() }
    runs[runIndex] = { start: leftRun.start, length: leftRun.length + rightRun.length }
    runs.splice(runIndex + 1, 1)
  }

  function* collapse(force: boolean): Generator<AlgorithmEvent, void, undefined> {
    while (runs.length > 1) {
      let index = runs.length - 2
      if (!force && ((index > 0 && runs[index - 1].length <= runs[index].length + runs[index + 1].length) ||
        (index > 1 && runs[index - 2].length <= runs[index - 1].length + runs[index].length))) {
        if (index > 0 && runs[index - 1].length < runs[index + 1].length) index -= 1
      } else if (!force && runs[index].length > runs[index + 1].length) break
      yield* setVariable('mergeStack', runs.map(run => run.length))
      yield* mergeAt(index)
    }
  }

  const minRun = minRunLength(values.length)
  yield* setVariable('minRun', minRun)
  let start = 0
  while (start < values.length) {
    let end = start + 1
    if (end < values.length) {
      const descending = values[end] < values[start]
      end += 1
      while (end < values.length && (descending ? values[end] < values[end - 1] : values[end] >= values[end - 1])) end += 1
      if (descending) {
        for (let left = start, right = end - 1; left < right; left += 1, right -= 1) {
          ;[values[left], values[right]] = [values[right], values[left]]
          yield* emit({ type: 'swap', indices: [left, right] }, 'reverse')
        }
      }
    }
    const runEnd = Math.min(values.length, Math.max(end, start + minRun))
    yield* emit({ type: 'range', role: 'active', indices: [start, runEnd - 1] }, 'runs')
    if (runEnd > end) yield* binaryInsertion(start, end, runEnd)
    runs.push({ start, length: runEnd - start })
    yield* setVariable('mergeStack', runs.map(run => run.length))
    yield* collapse(false)
    start = runEnd
  }
  yield* collapse(true)
  if (values.length) yield { type: 'markSorted', indices: values.map((_, i) => i) }
}

export const timSort = defineSortingAlgorithm({
  id: 'tim-sort', shortDescription: 'Adaptive natural-run merge sort', displayOrder: 18,
  name: 'TimSort', description: 'Detects natural runs, extends short runs, and stably merges them with galloping on long winning streaks.',
  useCases: ['Partially ordered data', 'Stable general-purpose sorting'],
  complexity: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  stable: true, inPlace: false, pseudocode, execute,
})
