export type PreferenceAlgorithmGroup = 'sorting' | 'searching' | 'string-searching' | 'hash-searching' | 'tree-searching' | 'data-structures' | 'data-structure-operations'
export type EnabledCategory = 'sorting' | 'searching'
export type SearchMode = 'array' | 'string' | 'hash' | 'tree'
export const ENABLED_CATEGORIES: readonly EnabledCategory[] = Object.freeze(['sorting', 'searching'])
export const ENABLED_SEARCH_MODES: readonly SearchMode[] = Object.freeze(['array', 'string', 'hash', 'tree'])

export function isEnabledCategory(id: string): id is EnabledCategory {
  return ENABLED_CATEGORIES.includes(id as EnabledCategory)
}

export function isEnabledSearchMode(id: string): id is 'array' | 'string' | 'hash' | 'tree' {
  return ENABLED_SEARCH_MODES.includes(id as SearchMode)
}

export type AppTheme = 'dark' | 'light'

export type UserPreferences = Readonly<{
  theme: AppTheme
  playbackSpeed: number
  arraySize: number
  category: EnabledCategory
  searchMode: SearchMode
  lastAlgorithmId: string
  lastSearchingAlgorithmId: string
  lastStringSearchAlgorithmId: string
  lastHashSearchAlgorithmId: string
  lastTreeSearchAlgorithmId: string
  lastDataStructureId: string
  lastDataStructureOperationId: string
}>

export const DEFAULT_PREFERENCES: UserPreferences = Object.freeze({
  theme: 'dark',
  playbackSpeed: 1,
  arraySize: 50,
  category: 'sorting',
  searchMode: 'array',
  lastAlgorithmId: 'quick-sort',
  lastSearchingAlgorithmId: 'linear-search',
  lastStringSearchAlgorithmId: 'naive-string-search',
  lastHashSearchAlgorithmId: 'hash-chaining-lookup',
  lastTreeSearchAlgorithmId: 'bst-lookup',
  lastDataStructureId: 'dynamic-array',
  lastDataStructureOperationId: 'append',
})
export const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4]
export const ARRAY_SIZE_OPTIONS = [5, 20, 30, 50, 80, 100]

export function parseUserPreferences(
  value: unknown,
  isAlgorithmAvailable: (category: PreferenceAlgorithmGroup, id: string) => boolean,
): UserPreferences {
  if (typeof value !== 'object' || value === null) return DEFAULT_PREFERENCES
  const saved = value as Record<string, unknown>
  return {
    theme: saved.theme === 'light' ? 'light' : 'dark',
    playbackSpeed: SPEED_OPTIONS.includes(saved.playbackSpeed as number)
      ? saved.playbackSpeed as number : DEFAULT_PREFERENCES.playbackSpeed,
    arraySize: ARRAY_SIZE_OPTIONS.includes(saved.arraySize as number)
      ? saved.arraySize as number : DEFAULT_PREFERENCES.arraySize,
    category: typeof saved.category === 'string' && isEnabledCategory(saved.category) ? saved.category : DEFAULT_PREFERENCES.category,
    searchMode: typeof saved.searchMode === 'string' && isEnabledSearchMode(saved.searchMode) ? saved.searchMode : DEFAULT_PREFERENCES.searchMode,
    lastAlgorithmId: typeof saved.lastAlgorithmId === 'string' && isAlgorithmAvailable('sorting', saved.lastAlgorithmId)
      ? saved.lastAlgorithmId : DEFAULT_PREFERENCES.lastAlgorithmId,
    lastSearchingAlgorithmId: typeof saved.lastSearchingAlgorithmId === 'string' && isAlgorithmAvailable('searching', saved.lastSearchingAlgorithmId)
      ? saved.lastSearchingAlgorithmId : DEFAULT_PREFERENCES.lastSearchingAlgorithmId,
    lastStringSearchAlgorithmId: typeof saved.lastStringSearchAlgorithmId === 'string' && isAlgorithmAvailable('string-searching', saved.lastStringSearchAlgorithmId)
      ? saved.lastStringSearchAlgorithmId : DEFAULT_PREFERENCES.lastStringSearchAlgorithmId,
    lastHashSearchAlgorithmId: typeof saved.lastHashSearchAlgorithmId === 'string' && isAlgorithmAvailable('hash-searching', saved.lastHashSearchAlgorithmId)
      ? saved.lastHashSearchAlgorithmId : DEFAULT_PREFERENCES.lastHashSearchAlgorithmId,
    lastTreeSearchAlgorithmId: typeof saved.lastTreeSearchAlgorithmId === 'string' && isAlgorithmAvailable('tree-searching', saved.lastTreeSearchAlgorithmId)
      ? saved.lastTreeSearchAlgorithmId : DEFAULT_PREFERENCES.lastTreeSearchAlgorithmId,
    lastDataStructureId: typeof saved.lastDataStructureId === 'string' && isAlgorithmAvailable('data-structures', saved.lastDataStructureId)
      ? saved.lastDataStructureId : DEFAULT_PREFERENCES.lastDataStructureId,
    lastDataStructureOperationId: typeof saved.lastDataStructureId === 'string' && typeof saved.lastDataStructureOperationId === 'string'
      && isAlgorithmAvailable('data-structure-operations', `${saved.lastDataStructureId}:${saved.lastDataStructureOperationId}`)
      ? saved.lastDataStructureOperationId : DEFAULT_PREFERENCES.lastDataStructureOperationId,
  }
}

export type PreferencesRepository = Readonly<{
  load: () => UserPreferences
  save: (preferences: UserPreferences) => void
}>
