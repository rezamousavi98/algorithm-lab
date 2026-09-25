/** Stable modular hash for every JavaScript safe integer, including negatives. */
export function normalizedHashIndex(key: number, capacity: number): number {
  if (!Number.isSafeInteger(key)) throw new RangeError('Hash keys must be safe integers.')
  if (!Number.isSafeInteger(capacity) || capacity <= 0) throw new RangeError('Hash capacity must be a positive safe integer.')
  const divisor = BigInt(capacity)
  const remainder = BigInt(key) % divisor
  return Number((remainder + divisor) % divisor)
}

function greatestCommonDivisor(left: number, right: number): number {
  let a = left
  let b = right
  while (b !== 0) [a, b] = [b, a % b]
  return a
}

/** Nonzero coprime step for double hashing; supported table capacities are prime. */
export function doubleHashStep(key: number, capacity: number): number {
  if (capacity < 2) throw new RangeError('Double hashing requires a capacity of at least 2.')
  const step = 1 + normalizedHashIndex(key, capacity - 1)
  if (greatestCommonDivisor(step, capacity) !== 1) throw new RangeError('Double-hash step must be coprime to the table capacity.')
  return step
}

export function probeIndex(
  strategy: 'linear-probing' | 'double-hashing',
  key: number,
  probeNumber: number,
  capacity: number,
): number {
  if (!Number.isSafeInteger(probeNumber) || probeNumber < 0) throw new RangeError('Probe number must be a nonnegative safe integer.')
  const home = normalizedHashIndex(key, capacity)
  const step = strategy === 'linear-probing' ? 1 : doubleHashStep(key, capacity)
  const divisor = BigInt(capacity)
  return Number((BigInt(home) + BigInt(probeNumber) * BigInt(step)) % divisor)
}
