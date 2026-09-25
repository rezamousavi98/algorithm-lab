import type { PseudocodeLine } from '../../types'
import type { HashSearchAlgorithmDefinition, HashSearchDefinitionInput, HashSearchInput } from './types'
import { validateHashTable } from '../../../structures/hash-table'

export const MAX_HASH_SEARCH_EVENTS = 50_000

export function makeHashSearchPseudocode(lines: readonly (readonly [id: string, code: string, indent?: number])[]): readonly PseudocodeLine[] {
  return Object.freeze(lines.map(([id, code, indent]) => Object.freeze({ id, code, ...(indent === undefined ? {} : { indent }) })))
}

export function defineHashSearchAlgorithm(definition: HashSearchDefinitionInput): HashSearchAlgorithmDefinition {
  return Object.freeze({
    ...definition,
    category: 'searching',
    strategy: definition.strategy,
    useCases: Object.freeze([...definition.useCases]),
    complexity: Object.freeze({ ...definition.complexity }),
    pseudocode: Object.freeze([...definition.pseudocode]),
  })
}

export function validateHashSearchInput(input: HashSearchInput, expectedStrategy?: HashSearchAlgorithmDefinition['strategy']): string | null {
  if (!input || typeof input !== 'object') return 'Provide a hash table and a search key.'
  if (!Number.isSafeInteger(input.key)) return 'Search keys must be safe integers.'
  if (expectedStrategy && input.table.strategy !== expectedStrategy) return `This search requires a ${expectedStrategy} table.`
  return validateHashTable(input.table)
}
