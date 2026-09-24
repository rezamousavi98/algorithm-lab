import { algorithmRegistry } from '@/domain/algorithms/registry'

export type AppTheme = 'dark' | 'light'

export type UserPreferences = Readonly<{
  theme: AppTheme
  playbackSpeed: number
  arraySize: number
  lastAlgorithmId: string
}>

const STORAGE_KEY = 'algorithm-lab-preferences'
const DEFAULT_PREFERENCES: UserPreferences = Object.freeze({
  theme: 'dark',
  playbackSpeed: 1,
  arraySize: 50,
  lastAlgorithmId: 'quick-sort',
})
const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4]
const ARRAY_SIZE_OPTIONS = [5, 20, 30, 50, 80, 100]

export function loadUserPreferences(): UserPreferences {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const previousTheme = window.localStorage.getItem('algorithm-lab-theme')
      return Object.freeze({
        ...DEFAULT_PREFERENCES,
        theme: previousTheme === 'light' ? 'light' : 'dark',
      })
    }

    const value: unknown = JSON.parse(stored)
    if (typeof value !== 'object' || value === null) return DEFAULT_PREFERENCES
    const saved = value as Record<string, unknown>
    const theme: AppTheme = saved.theme === 'light' ? 'light' : 'dark'
    const playbackSpeed = SPEED_OPTIONS.includes(saved.playbackSpeed as number)
      ? (saved.playbackSpeed as number)
      : DEFAULT_PREFERENCES.playbackSpeed
    const arraySize = Number.isInteger(saved.arraySize) && ARRAY_SIZE_OPTIONS.includes(Number(saved.arraySize))
      ? Number(saved.arraySize)
      : DEFAULT_PREFERENCES.arraySize
    const lastAlgorithmId = typeof saved.lastAlgorithmId === 'string' && algorithmRegistry.get(saved.lastAlgorithmId)
      ? saved.lastAlgorithmId
      : DEFAULT_PREFERENCES.lastAlgorithmId

    return Object.freeze({ theme, playbackSpeed, arraySize, lastAlgorithmId })
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function saveUserPreferences(preferences: UserPreferences): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Preferences are a convenience; storage restrictions should not interrupt learning.
  }
}
