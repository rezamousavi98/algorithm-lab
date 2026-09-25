import { useMemo } from 'react'
import { algorithmRegistry } from '@/domain/algorithms/registry'
import { createSortingExecution } from '@/domain/simulation/sorting-execution'
import { createBrowserPreferences } from '@/infrastructure/browser-preferences'
import { usePreferences } from '../preferences/use-preferences'
import { useSortingInput } from './use-sorting-input'

const preferencesRepository = createBrowserPreferences((category, id) => category === 'sorting' && algorithmRegistry.get(id) !== undefined)
const algorithms = [...algorithmRegistry.definitions].sort((a, b) => a.displayOrder - b.displayOrder)

/** Composes independent preference, input, and execution responsibilities. */
export function useAlgorithmLab() {
  const { preferences, setPreferences } = usePreferences(preferencesRepository)
  const dataset = useSortingInput(preferences.arraySize,
    (arraySize) => setPreferences((current) => ({ ...current, arraySize })))
  const algorithm = algorithmRegistry.get(preferences.lastAlgorithmId) ?? algorithms[0]
  const executionResult = useMemo(
    () => createSortingExecution(algorithm, dataset.input), [algorithm, dataset.input])

  return {
    algorithms,
    algorithm,
    selectedId: algorithm.id,
    theme: preferences.theme,
    playbackSpeed: preferences.playbackSpeed,
    executionResult,
    runVersion: dataset.runVersion,
    dataset: dataset.controls,
    toggleTheme: () => setPreferences((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' })),
    selectAlgorithm: (id: string) => setPreferences((current) => ({ ...current, lastAlgorithmId: id })),
    setSpeed: (playbackSpeed: number) => setPreferences((current) => ({ ...current, playbackSpeed })),
  }
}
