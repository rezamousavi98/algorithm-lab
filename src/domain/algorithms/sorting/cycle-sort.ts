import type { AlgorithmEvent, SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

const pseudocode = makePseudocode([
  ['cycle', 'hold the next value and find its final rank'],
  ['rank', 'count values smaller than the held value'],
  ['skip', 'skip positions already occupied by equal values'],
  ['write', 'write the held value into its destination'],
])

function* execute(input: SortingInput): Generator<AlgorithmEvent, void, undefined> {
  const values = [...input]
  for (let start = 0; start < values.length - 1; start += 1) {
    let held = values[start]
    let position = start
    for (let index = start + 1; index < values.length; index += 1) {
      yield* setVariable('start', start)
      yield* emit({ type: 'compare', indices: [start, index], values: [held, values[index]] }, 'rank')
      if (values[index] < held) position += 1
    }
    if (position === start) continue
    while (position < values.length && held === values[position]) position += 1
    if (position >= values.length) continue
    const displaced = values[position]
    values[position] = held
    yield* emit({ type: 'write', index: position, value: held }, 'write')
    held = displaced

    while (position !== start) {
      position = start
      for (let index = start + 1; index < values.length; index += 1) {
        yield* emit({ type: 'compare', indices: [start, index], values: [held, values[index]] }, 'rank')
        if (values[index] < held) position += 1
      }
      while (position < values.length && held === values[position]) position += 1
      if (position >= values.length) break
      const next = values[position]
      values[position] = held
      yield* emit({ type: 'write', index: position, value: held }, 'write')
      held = next
    }
  }
  if (values.length) yield { type: 'markSorted', indices: values.map((_, i) => i) }
}

export const cycleSort = defineSortingAlgorithm({
  id: 'cycle-sort', shortDescription: 'Place values by rank', displayOrder: 13,
  name: 'Cycle Sort', description: 'Finds each value’s rank and rotates a cycle into place with very few writes.',
  useCases: ['Minimizing writes to expensive storage', 'Teaching permutation cycles'],
  complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  stable: false, inPlace: true, pseudocode, execute,
})
