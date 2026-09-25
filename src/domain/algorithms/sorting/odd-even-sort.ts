import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['phase', 'alternate odd and even adjacent-pair phases'],
  ['compare', 'compare disjoint neighbors in this phase'],
  ['swap', 'swap neighbors when they are out of order'],
  ['repeat', 'stop after both phases make no swaps'],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  let changed = true
  let phase = 0
  while (changed) {
    changed = false
    for (const parity of [1, 0]) {
      let phaseChanged = false
      yield* setVariable('phase', parity === 1 ? 'odd' : 'even')
      for (let index = parity; index + 1 < values.length; index += 2) {
        yield* setVariable('index', index)
        yield* emit({ type: 'compare', indices: [index, index + 1], values: [values[index], values[index + 1]] }, 'compare')
        if (values[index] > values[index + 1]) {
          ;[values[index], values[index + 1]] = [values[index + 1], values[index]]
          yield* emit({ type: 'swap', indices: [index, index + 1] }, 'swap')
          phaseChanged = true
        }
      }
      changed ||= phaseChanged
      yield { type: 'pseudocode', lineId: 'phase' }
    }
    phase += 1
    yield* setVariable('pass', phase)
  }
  if (values.length) yield { type: 'markSorted', indices: values.map((_, i) => i) }
}

export const oddEvenSort = defineSortingAlgorithm({
  id: 'odd-even-sort', shortDescription: 'Alternating neighbor phases', displayOrder: 12,
  name: 'Odd–Even Sort', description: 'Alternates comparisons on odd and even neighboring pairs until no pair needs swapping.',
  useCases: ['Teaching parallel disjoint comparisons', 'A simple compare-exchange network'],
  complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  stable: true, inPlace: true, pseudocode, execute,
})
