import type { VariableValue } from '../algorithms/types'

/** Snapshot variable payloads must not retain executor-owned mutable objects. */
export function cloneVariableValue(value: VariableValue): VariableValue {
  if (Array.isArray(value)) return Object.freeze(value.map(item => cloneVariableValue(item)))
  if (value !== null && typeof value === 'object') {
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneVariableValue(item)])))
  }
  return value
}
