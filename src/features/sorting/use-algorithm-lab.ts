import { useEffect, useMemo, useState } from 'react'
import { algorithmRegistry } from '@/domain/algorithms/registry'
import type { SortingInput } from '@/domain/algorithms/types'
import { generateSortingInput, parseManualSortingInput, type SortingPattern } from '@/domain/algorithms/sorting/input'
import { createSortingExecution } from '@/domain/simulation/sorting-execution'
import { loadUserPreferences, saveUserPreferences } from '@/domain/preferences/user-preferences'

export function useAlgorithmLab() {
  const [preferences, setPreferences] = useState(loadUserPreferences)
  const [pattern, setPattern] = useState<SortingPattern>('random')
  const [input, setInput] = useState<SortingInput>(() => generateSortingInput({ size: preferences.arraySize, pattern: 'random' }))
  const [inputMode, setInputMode] = useState<'generated' | 'manual'>('generated')
  const [manualDraft, setManualDraft] = useState('8, 3, 12, 1, 7, 4')
  const [manualError, setManualError] = useState<string | null>(null)
  const [runVersion, setRunVersion] = useState(0)
  const algorithm = algorithmRegistry.get(preferences.lastAlgorithmId) ?? algorithmRegistry.definitions[0]
  const executionResult = useMemo(() => createSortingExecution(algorithm, input), [algorithm, input])

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme
    saveUserPreferences(preferences)
  }, [preferences])

  const generate = (size = preferences.arraySize, nextPattern = pattern) => {
    setPreferences((current) => ({ ...current, arraySize: size }))
    setPattern(nextPattern)
    setInput(generateSortingInput({ size, pattern: nextPattern }))
    setInputMode('generated')
    setManualError(null)
    setRunVersion((version) => version + 1)
  }

  const toggleInputMode = (mode: 'generated' | 'manual') => {
    if (mode === 'manual') setManualDraft(input.join(', '))
    else generate()
    setManualError(null)
    setInputMode(mode)
  }

  const applyManualInput = () => {
    const result = parseManualSortingInput(manualDraft)
    if (!result.ok) {
      setManualError(result.message)
      return result
    }
    setInput(result.values)
    setInputMode('manual')
    setManualError(null)
    setRunVersion((version) => version + 1)
    return result
  }

  return {
    theme: preferences.theme,
    selectedId: algorithm.id,
    arraySize: preferences.arraySize,
    playbackSpeed: preferences.playbackSpeed,
    algorithm,
    executionResult,
    runVersion,
    pattern,
    inputMode,
    manualDraft,
    manualError,
    toggleTheme: () => setPreferences((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' })),
    selectAlgorithm: (id: string) => setPreferences((current) => ({ ...current, lastAlgorithmId: id })),
    setSpeed: (speed: number) => setPreferences((current) => ({ ...current, playbackSpeed: speed })),
    setPattern: (value: SortingPattern) => generate(preferences.arraySize, value),
    setArraySize: (size: number) => generate(size),
    setInputMode: toggleInputMode,
    setManualDraft: (draft: string) => { setManualDraft(draft); setManualError(null) },
    applyManualInput,
    generate: () => generate(),
  }
}
