export type AppTheme = 'dark' | 'light'

export type UserPreferences = Readonly<{
  theme: AppTheme
  playbackSpeed: number
  arraySize: number
  category: 'sorting' | 'searching'
  lastAlgorithmId: string
  lastSearchingAlgorithmId: string
}>

export const DEFAULT_PREFERENCES: UserPreferences = Object.freeze({
  theme: 'dark',
  playbackSpeed: 1,
  arraySize: 50,
  category: 'sorting',
  lastAlgorithmId: 'quick-sort',
  lastSearchingAlgorithmId: 'linear-search',
})
export const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4]
export const ARRAY_SIZE_OPTIONS = [5, 20, 30, 50, 80, 100]

export function parseUserPreferences(
  value: unknown,
  isAlgorithmAvailable: (category: 'sorting' | 'searching', id: string) => boolean,
): UserPreferences {
  if (typeof value !== 'object' || value === null) return DEFAULT_PREFERENCES
  const saved = value as Record<string, unknown>
  return {
    theme: saved.theme === 'light' ? 'light' : 'dark',
    playbackSpeed: SPEED_OPTIONS.includes(saved.playbackSpeed as number)
      ? saved.playbackSpeed as number : DEFAULT_PREFERENCES.playbackSpeed,
    arraySize: ARRAY_SIZE_OPTIONS.includes(saved.arraySize as number)
      ? saved.arraySize as number : DEFAULT_PREFERENCES.arraySize,
    category: saved.category === 'searching' ? 'searching' : 'sorting',
    lastAlgorithmId: typeof saved.lastAlgorithmId === 'string' && isAlgorithmAvailable('sorting', saved.lastAlgorithmId)
      ? saved.lastAlgorithmId : DEFAULT_PREFERENCES.lastAlgorithmId,
    lastSearchingAlgorithmId: typeof saved.lastSearchingAlgorithmId === 'string' && isAlgorithmAvailable('searching', saved.lastSearchingAlgorithmId)
      ? saved.lastSearchingAlgorithmId : DEFAULT_PREFERENCES.lastSearchingAlgorithmId,
  }
}

export type PreferencesRepository = Readonly<{
  load: () => UserPreferences
  save: (preferences: UserPreferences) => void
}>
