import { useState } from 'react'
import type { StringSearchingInput } from '@/domain/algorithms/types'
import { validateStringSearchingInput } from '@/domain/algorithms/searching/strings/shared'

const DEFAULT_INPUT: StringSearchingInput = Object.freeze({
  text: 'ABABDABACDABABCABAB',
  pattern: 'ABABCABAB',
})

export function useStringSearchInput() {
  const [input, setInput] = useState<StringSearchingInput>(DEFAULT_INPUT)
  const [textDraft, setTextDraft] = useState(DEFAULT_INPUT.text)
  const [patternDraft, setPatternDraft] = useState(DEFAULT_INPUT.pattern)
  const [error, setError] = useState<string | null>(null)
  const [runVersion, setRunVersion] = useState(0)

  const apply = () => {
    const nextInput = Object.freeze({ text: textDraft, pattern: patternDraft })
    const validationError = validateStringSearchingInput(nextInput)
    if (validationError) { setError(validationError); return }
    setInput(nextInput)
    setError(null)
    setRunVersion(version => version + 1)
  }

  return {
    input, textDraft, patternDraft, error, runVersion,
    setTextDraft: (value: string) => { setTextDraft(value); setError(null) },
    setPatternDraft: (value: string) => { setPatternDraft(value); setError(null) },
    apply,
  }
}
