import { useState } from 'react'
import type { SortingInput } from '@/domain/algorithms/types'
import { generateSortingInput, parseManualSortingInput, type SortingPattern } from '@/domain/algorithms/sorting/input'

export function useSortingInput(arraySize: number, onSizeChange: (size: number) => void) {
  const [pattern, setPattern] = useState<SortingPattern>('random')
  const [input, setInput] = useState<SortingInput>(() => generateSortingInput({ size: arraySize, pattern: 'random' }))
  const [inputMode, setInputMode] = useState<'generated' | 'manual'>('generated')
  const [manualDraft, setManualDraft] = useState('8, 3, 12, 1, 7, 4')
  const [manualError, setManualError] = useState<string | null>(null)
  const [runVersion, setRunVersion] = useState(0)
  const generate = (size = arraySize, nextPattern = pattern) => {
    onSizeChange(size)
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
    input,
    runVersion,
    controls: {
      arraySize, pattern, inputMode, manualDraft, manualError,
      onArraySizeChange: (size: number) => generate(size),
      onPatternChange: (value: SortingPattern) => generate(arraySize, value),
      onInputModeChange: toggleInputMode,
      onManualDraftChange: (draft: string) => { setManualDraft(draft); setManualError(null) },
      onApplyManual: applyManualInput,
      onGenerate: () => generate(),
    },
  }
}
