import { DEFAULT_PREFERENCES, parseUserPreferences, type PreferencesRepository } from '@/domain/preferences/user-preferences'

const STORAGE_KEY = 'algorithm-lab-preferences'

export function createBrowserPreferences(isAlgorithmAvailable: (id: string) => boolean): PreferencesRepository {
  return {
    load() {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        const value: unknown = stored ? JSON.parse(stored) : { theme: window.localStorage.getItem('algorithm-lab-theme') }
        return parseUserPreferences(value, isAlgorithmAvailable)
      } catch {
        return DEFAULT_PREFERENCES
      }
    },
    save(preferences) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
      } catch {
        // Restricted storage must not interrupt visualization.
      }
    },
  }
}
