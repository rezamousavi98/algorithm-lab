import type { PseudocodeLine } from '../../types'
import type { TreeSearchAlgorithmDefinition, TreeSearchInput } from './types'
import { validateBinaryTree } from '../../../structures/binary-tree'

export const MAX_TREE_SEARCH_EVENTS = 12_000
export function makeTreeSearchPseudocode(lines: readonly (readonly [id: string, code: string, indent?: number])[]): readonly PseudocodeLine[] {
  return Object.freeze(lines.map(([id, code, indent]) => Object.freeze({ id, code, ...(indent === undefined ? {} : { indent }) })))
}
export function defineTreeSearchAlgorithm(definition: Omit<TreeSearchAlgorithmDefinition, 'category'>): TreeSearchAlgorithmDefinition {
  return Object.freeze({ ...definition, category: 'searching', useCases: Object.freeze([...definition.useCases]), complexity: Object.freeze({ ...definition.complexity }), pseudocode: Object.freeze([...definition.pseudocode]) })
}
export function validateTreeSearchInput(input: TreeSearchInput, requiresTree?: TreeSearchAlgorithmDefinition['requiresTree']): string | null {
  if (!input || typeof input !== 'object') return 'Provide a tree and a safe-integer target.'
  if (!Number.isSafeInteger(input.target)) return 'Tree-search targets must be safe integers.'
  if (requiresTree === 'bst' && input.tree.kind !== 'bst') return 'Binary Search Tree lookup requires BST input. Choose BST input and build it explicitly.'
  return validateBinaryTree(input.tree)
}
