import type { AlgorithmCategory } from '@/domain/algorithms/types'
import { isEnabledCategory as isPreferenceCategoryEnabled, isEnabledSearchMode as isPreferenceSearchModeEnabled, type EnabledCategory, type SearchMode } from '@/domain/preferences/user-preferences'

export type { EnabledCategory, SearchMode }

export type CategoryMetadata = Readonly<{
  id: AlgorithmCategory
  label: string
  sidebarTitle: string
  enabled: boolean
}>

export const CATEGORY_CATALOG: readonly CategoryMetadata[] = Object.freeze([
  { id: 'sorting', label: 'Sorting', sidebarTitle: 'Sorting Algorithms', enabled: isPreferenceCategoryEnabled('sorting') },
  { id: 'searching', label: 'Searching', sidebarTitle: 'Searching Algorithms', enabled: isPreferenceCategoryEnabled('searching') },
  { id: 'graphs', label: 'Graphs', sidebarTitle: 'Graph Algorithms', enabled: isPreferenceCategoryEnabled('graphs') },
  { id: 'trees', label: 'Trees', sidebarTitle: 'Tree Algorithms', enabled: isPreferenceCategoryEnabled('trees') },
  { id: 'dynamic-programming', label: 'Dynamic Programming', sidebarTitle: 'Dynamic Programming', enabled: isPreferenceCategoryEnabled('dynamic-programming') },
  { id: 'data-structures', label: 'Data Structures', sidebarTitle: 'Data Structures', enabled: isPreferenceCategoryEnabled('data-structures') },
])

export type SearchModeMetadata = Readonly<{
  id: SearchMode
  label: string
  sidebarTitle: string
  preferenceGroup: 'searching' | 'string-searching' | 'hash-searching' | 'tree-searching'
  enabled: boolean
}>

export const SEARCH_MODE_CATALOG: readonly SearchModeMetadata[] = Object.freeze([
  { id: 'array', label: 'Arrays', sidebarTitle: 'Array Search Algorithms', preferenceGroup: 'searching', enabled: isPreferenceSearchModeEnabled('array') },
  { id: 'string', label: 'Strings', sidebarTitle: 'String Search Algorithms', preferenceGroup: 'string-searching', enabled: isPreferenceSearchModeEnabled('string') },
  { id: 'hash', label: 'Hash Tables', sidebarTitle: 'Hash Table Search Algorithms', preferenceGroup: 'hash-searching', enabled: isPreferenceSearchModeEnabled('hash') },
  { id: 'tree', label: 'Trees', sidebarTitle: 'Tree Search Algorithms', preferenceGroup: 'tree-searching', enabled: isPreferenceSearchModeEnabled('tree') },
])

export function isEnabledCategory(id: AlgorithmCategory): id is EnabledCategory {
  return isPreferenceCategoryEnabled(id)
}

export function isEnabledSearchMode(id: SearchMode): id is 'array' | 'string' | 'hash' | 'tree' {
  return isPreferenceSearchModeEnabled(id)
}

export function getCategoryMetadata(id: AlgorithmCategory): CategoryMetadata {
  return CATEGORY_CATALOG.find(item => item.id === id) ?? CATEGORY_CATALOG[0]
}

export function getSearchModeMetadata(id: SearchMode): SearchModeMetadata {
  return SEARCH_MODE_CATALOG.find(item => item.id === id) ?? SEARCH_MODE_CATALOG[0]
}
