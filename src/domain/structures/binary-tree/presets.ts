import type { TreeEntryInput, TreeToken } from './types'

export const BST_SEARCH_PRESETS: Readonly<Record<string, Readonly<{ label: string; entries: readonly TreeEntryInput[]; target: number }>>> = Object.freeze({
  balanced: Object.freeze({ label: 'Balanced insertion order', entries: Object.freeze([{ key: 40, value: 400 }, { key: 20, value: 200 }, { key: 60, value: 600 }, { key: 10, value: 100 }, { key: 30, value: 300 }, { key: 50, value: 500 }, { key: 70, value: 700 }]), target: 50 }),
  skewed: Object.freeze({ label: 'Skewed insertion order', entries: Object.freeze([10, 20, 30, 40, 50, 60, 70].map(key => ({ key, value: key * 10 }))), target: 60 }),
  empty: Object.freeze({ label: 'Empty tree', entries: Object.freeze([]), target: 12 }),
  missing: Object.freeze({ label: 'Missing target', entries: Object.freeze([{ key: 40, value: 400 }, { key: 20, value: 200 }, { key: 60, value: 600 }, { key: 10, value: 100 }, { key: 30, value: 300 }]), target: 55 }),
  duplicates: Object.freeze({ label: 'Duplicate update', entries: Object.freeze([{ key: 30, value: 300 }, { key: 10, value: 100 }, { key: 50, value: 500 }, { key: 30, value: 999 }]), target: 30 }),
})

export const BINARY_TREE_SEARCH_PRESETS: Readonly<Record<string, Readonly<{ label: string; tokens: readonly TreeToken[]; target: number }>>> = Object.freeze({
  balanced: Object.freeze({ label: 'Balanced', tokens: Object.freeze([{ key: 40, value: 400 }, { key: 20, value: 200 }, { key: 60, value: 600 }, { key: 10, value: 100 }, { key: 30, value: 300 }, { key: 50, value: 500 }, { key: 70, value: 700 }]), target: 50 }),
  skewed: Object.freeze({ label: 'Skewed 31 nodes', tokens: Object.freeze(Array.from({ length: 31 }, (_, i) => ({ key: (i * 17) % 97, value: i }))), target: 42 }),
  sparse: Object.freeze({ label: 'Sparse', tokens: Object.freeze([{ key: 8, value: 80 }, { key: 3, value: 30 }, { key: 12, value: 120 }, null, { key: 5, value: 50 }, { key: 10, value: 100 }, null, null, null, null, { key: 11, value: 110 }]), target: 11 }),
  duplicates: Object.freeze({ label: 'Duplicate keys', tokens: Object.freeze([{ key: 8, value: 80 }, { key: 4, value: 40 }, { key: 12, value: 120 }, { key: 6, value: 60 }, { key: 3, value: 30 }, { key: 10, value: 100 }, { key: 14, value: 140 }, null, { key: 8, value: 800 }]), target: 8 }),
  missing: Object.freeze({ label: 'Missing target', tokens: Object.freeze([{ key: 8, value: 80 }, { key: 4, value: 40 }, { key: 12, value: 120 }, { key: 2, value: 20 }, { key: 6, value: 60 }]), target: 99 }),
})
