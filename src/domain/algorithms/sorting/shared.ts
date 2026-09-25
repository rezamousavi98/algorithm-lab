import type { AlgorithmDefinition, AlgorithmEvent, PseudocodeLine, SortingInput, VariableValue } from '../types'

export type SortingExecutor = (input: SortingInput) => Generator<AlgorithmEvent, void, undefined>

type SortingDefinition = Omit<AlgorithmDefinition<SortingInput, AlgorithmEvent>, 'category' | 'stable' | 'inPlace'> &
  Readonly<{ stable: boolean; inPlace: boolean }>

export function defineSortingAlgorithm(definition: SortingDefinition): AlgorithmDefinition<SortingInput, AlgorithmEvent> {
  return Object.freeze({
    ...definition,
    category: 'sorting',
    useCases: Object.freeze([...definition.useCases]),
    complexity: Object.freeze({ ...definition.complexity }),
    pseudocode: Object.freeze([...definition.pseudocode]),
  })
}

export function* emit(
  event: AlgorithmEvent,
  lineId?: string,
): Generator<AlgorithmEvent, void, undefined> {
  if (lineId) yield { type: 'pseudocode', lineId }
  yield event
}

export function* setVariable(
  name: string,
  value: VariableValue,
): Generator<AlgorithmEvent, void, undefined> {
  yield { type: 'variable', name, value }
}

export function* explain(message: string): Generator<AlgorithmEvent, void, undefined> {
  yield { type: 'explanation', message }
}

export function makePseudocode(
  lines: readonly (string | readonly [id: string, code: string, indent?: number])[],
): readonly PseudocodeLine[] {
  return Object.freeze(
    lines.map((line, index) =>
      Object.freeze(
        typeof line === 'string'
          ? { id: `line-${index + 1}`, code: line }
          : { id: line[0], code: line[1], indent: line[2] },
      ),
    ),
  )
}
