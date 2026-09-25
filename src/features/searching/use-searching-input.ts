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
    const target = Number(targetDraft)
    const raw = valuesDraft.trim()
    const tokens = raw ? raw.split(/\s*,\s*|\s+/) : []
    const values = tokens.map(Number)
    if (targetDraft.trim() === '' || !Number.isFinite(target)) { setError('Enter a finite numeric target.'); return }
    if (values.length > 100 || tokens.some(token => token === '') || values.some(value => !Number.isFinite(value))) { setError('Enter up to 100 finite numbers separated by commas or spaces.'); return }
    setInput({ values, target }); setError(null); setRunVersion(v => v + 1)
  }
  const sortCopy = () => { setInput(current => ({ ...current, values: [...current.values].sort((a, b) => a - b) })); setError(null); setRunVersion(v => v + 1) }
  return { input, runVersion, pattern, valuesDraft, targetDraft, error, setValuesDraft, setTargetDraft, apply, sortCopy, generate, setPattern: (value: SortingPattern) => generate(arraySize, value) }
}
