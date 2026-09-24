import type {
  AlgorithmCategory,
  AlgorithmDefinition,
} from './types'
import { sortingAlgorithms } from './sorting'

/** Metadata shape used for selection, filtering, and registry lookup. */
export type AlgorithmRegistryEntry = Pick<
  AlgorithmDefinition<never>,
  | 'id'
  | 'name'
  | 'category'
  | 'description'
  | 'shortDescription'
  | 'displayOrder'
  | 'useCases'
  | 'complexity'
  | 'stable'
  | 'inPlace'
  | 'pseudocode'
>

export type AlgorithmRegistry<TDefinition extends AlgorithmRegistryEntry> = Readonly<{
  definitions: readonly TDefinition[]
  get: (id: string) => TDefinition | undefined
  byCategory: (category: AlgorithmCategory) => readonly TDefinition[]
}>

/** Creates a validated, read-only registry while preserving concrete definition types. */
export function createAlgorithmRegistry<TDefinition extends AlgorithmRegistryEntry>(
  definitions: readonly TDefinition[],
): AlgorithmRegistry<TDefinition> {
  const definitionList = Object.freeze([...definitions])
  const definitionById = new Map<string, TDefinition>()

  for (const definition of definitionList) {
    if (definitionById.has(definition.id)) {
      throw new Error(`Duplicate algorithm id: ${definition.id}`)
    }
    definitionById.set(definition.id, definition)
  }

  return Object.freeze({
    definitions: definitionList,
    get: (id: string) => definitionById.get(id),
    byCategory: (category: AlgorithmCategory) =>
      definitionList.filter((definition) => definition.category === category),
  })
}

/** Central registry consumed by the algorithm browser and workspace. */
export const algorithmRegistry = createAlgorithmRegistry(sortingAlgorithms)
