import { useEffect, useState } from 'react'
import type { PreferencesRepository } from '@/domain/preferences/user-preferences'

export function usePreferences(repository: PreferencesRepository) {
  const [preferences, setPreferences] = useState(repository.load)
  useEffect(() => repository.save(preferences), [preferences, repository])
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme
  }, [preferences.theme])
  return { preferences, setPreferences }
}
