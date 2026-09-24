import type { SortingInput } from '../types'
import { defineSortingAlgorithm, emit, makePseudocode, setVariable } from './shared'

type RadixEntry = Readonly<{ value: number; key: bigint }>

const pseudocode = makePseudocode([
  ['offset', 'offset each integer from the minimum value'],
  ['digit-loop', 'for each decimal digit from least to most significant'],
  ['bucket', 'place values into stable digit buckets', 1],
  ['collect', 'collect buckets in digit order', 1],
  ['write-back', 'write the sorted values into the array'],
])

function validateInput(input: SortingInput): string | null {
  return input.every(Number.isSafeInteger)
    ? null
    : 'Radix Sort requires safe integer values.'
}

function* execute(input: SortingInput) {
  if (input.length === 0) return
  const minimum = BigInt(Math.min(...input))
  let values: RadixEntry[] = input.map((value) => ({
    value,
    key: BigInt(value) - minimum,
  }))
  const largestKey = values.reduce((largest, entry) => (entry.key > largest ? entry.key : largest), 0n)
  let place = 1n
  let digitIndex = 0

  yield* setVariable('minimum', Number(minimum))
  yield* emit({ type: 'range', role: 'active', indices: [0, input.length - 1] }, 'offset')

  while (place <= largestKey) {
    yield* setVariable('digitPlace', Number(place))
    yield { type: 'pseudocode', lineId: 'digit-loop' } as const
    const buckets: RadixEntry[][] = Array.from({ length: 10 }, () => [])
    for (const entry of values) {
      const digit = Number((entry.key / place) % 10n)
      buckets[digit].push(entry)
      yield* emit({
        type: 'auxiliaryUpdate',
        panelId: 'radix-buckets',
        label: `Digit ${digitIndex + 1} buckets`,
        values: buckets.flatMap((bucket) => bucket.map((item) => item.value)),
      }, 'bucket')
    }
    values = buckets.flat()
    yield* emit({
      type: 'auxiliaryUpdate',
      panelId: 'radix-buckets',
      label: `Values after digit ${digitIndex + 1}`,
      values: values.map((entry) => entry.value),
    }, 'collect')
    place *= 10n
    digitIndex += 1
  }

  for (let index = 0; index < values.length; index += 1) {
    yield* setVariable('index', index)
    yield* emit({ type: 'write', index, value: values[index].value }, 'write-back')
  }
  yield { type: 'markSorted', indices: Array.from({ length: input.length }, (_, index) => index) } as const
}

export const radixSort = defineSortingAlgorithm({
  id: 'radix-sort',
  name: 'Radix Sort',
  description: 'Sorts safe integers by stable digit passes after offsetting negative values.',
  useCases: ['Integer keys with a bounded number of digits', 'Non-comparison sorting demonstrations'],
  complexity: { best: 'O(d(n + k))', average: 'O(d(n + k))', worst: 'O(d(n + k))', space: 'O(n + k)' },
  stable: true,
  inPlace: false,
  pseudocode,
  validateInput,
  execute,
})
