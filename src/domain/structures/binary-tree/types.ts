export const MAX_BINARY_TREE_NODES = 63
export const MAX_BINARY_TREE_TOKENS = MAX_BINARY_TREE_NODES * 2 + 1

export type TreeEntryInput = Readonly<{ key: number; value: number }>
export type BinaryTreeNode = Readonly<{
  id: string
  layoutId: string
  key: number
  value: number
  leftId: string | null
  rightId: string | null
}>
export type BinaryTree = Readonly<{
  kind: 'binary-tree'
  rootId: string | null
  nodes: readonly BinaryTreeNode[]
  nodeById: Readonly<Record<string, BinaryTreeNode>>
}>
export type BinarySearchTree = BinaryTree & Readonly<{ kind: 'bst' }>
export type SearchableTree = BinaryTree | BinarySearchTree
export type TreeToken = TreeEntryInput | null
export type TreeBuildResult<TTree extends SearchableTree = SearchableTree> =
  | Readonly<{ ok: true; tree: TTree }>
  | Readonly<{ ok: false; error: string }>
