import { parseSearchingInput } from '@/domain/algorithms/searching/input'
import { useState } from 'react'
import { generateSortingInput, type SortingPattern } from '@/domain/algorithms/sorting/input'
import type { SearchingInput } from '@/domain/algorithms/types'

export function useSearchingInput(arraySize: number, onSizeChange: (size: number) => void) {
  const [initial] = useState(() => {
    const values = [...generateSortingInput({ size: arraySize, pattern: 'random' })].sort((a, b) => a - b)
    return { input: { values, target: 50 }, valuesDraft: values.join(', ') }
  })
  const [pattern, setPattern] = useState<SortingPattern>('random')
  const [input, setInput] = useState<SearchingInput>(initial.input)
  const [valuesDraft, setValuesDraft] = useState(initial.valuesDraft)
  const [targetDraft, setTargetDraft] = useState('50')
  const [error, setError] = useState<string | null>(null)
  const [runVersion, setRunVersion] = useState(0)
  const generate = (size = arraySize, nextPattern = pattern) => {
    const values = [...generateSortingInput({ size, pattern: nextPattern })].sort((a, b) => a - b)
    onSizeChange(size); setPattern(nextPattern); setInput({ values, target: input.target }); setValuesDraft(values.join(', ')); setTargetDraft(String(input.target)); setError(null); setRunVersion(v => v + 1)
  }
  const apply = () => {
    const result = parseSearchingInput(valuesDraft, targetDraft)
    if (!result.ok) { setError(result.message); return }
    setInput(result.input); setError(null); setRunVersion(v => v + 1)
  }
  const sortCopy = () => { setInput(current => ({ ...current, values: [...current.values].sort((a, b) => a - b) })); setError(null); setRunVersion(v => v + 1) }
  return { input, runVersion, pattern, valuesDraft, targetDraft, error, setValuesDraft: (value: string) => { setValuesDraft(value); setError(null) }, setTargetDraft: (value: string) => { setTargetDraft(value); setError(null) }, apply, sortCopy, generate, setPattern: (value: SortingPattern) => generate(arraySize, value) }
}
