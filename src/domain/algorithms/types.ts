/** Categories are deliberately broader than V1's sorting module. */
export type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'graphs'
  | 'trees'
  | 'pathfinding'
  | 'recursion'
  | 'dynamic-programming'
  | 'data-structures'

export type Complexity = Readonly<{
  best: string
  average: string
  worst: string
  space: string
}>

export type PseudocodeLine = Readonly<{
  id: string
  code: string
  indent?: number
}>

/** Values exposed in the generic variables inspector. */
export type VariableValue =
  | string
  | number
  | boolean
  | null
  | readonly VariableValue[]
  | Readonly<{ [key: string]: VariableValue }>

export type VariableUpdateEvent = Readonly<{
  type: 'variable'
  name: string
  value: VariableValue
}>

export type ExplanationEvent = Readonly<{
  type: 'explanation'
  message: string
}>

export type PseudocodeEvent = Readonly<{
  type: 'pseudocode'
  lineId: string
}>

/** Shared semantic events that are useful across algorithm categories. */
export type CoreAlgorithmEvent =
  | VariableUpdateEvent
  | ExplanationEvent
  | PseudocodeEvent

export type IndexPair = readonly [first: number, second: number]
export type IndexRange = readonly [startInclusive: number, endInclusive: number]

export type SortingCompareEvent = Readonly<{
  type: 'compare'
  indices: IndexPair
  /** Optional captured operands for comparisons involving held or auxiliary values. */
  values?: readonly [firstValue: number, secondValue: number]
}>

export type SortingSwapEvent = Readonly<{
  type: 'swap'
  indices: IndexPair
}>

export type SortingReadEvent = Readonly<{
  type: 'read'
  index: number
  value: number
}>

export type SortingWriteEvent = Readonly<{
  type: 'write'
  index: number
  value: number
}>

export type SortingMarkSortedEvent = Readonly<{
  type: 'markSorted'
  indices: readonly number[]
}>

export type SortingSelectEvent = Readonly<{
  type: 'select'
  role: 'pivot' | 'minimum' | 'current'
  index: number
}>

export type SortingRangeEvent = Readonly<{
  type: 'range'
  role: 'active' | 'partition' | 'merge' | 'heap'
  indices: IndexRange
}>

/** Describes auxiliary values (for example, a counting array) without prescribing its renderer. */
export type SortingAuxiliaryUpdateEvent = Readonly<{
  type: 'auxiliaryUpdate'
  panelId: string
  label: string
  values: readonly number[]
}>

export type SortingEvent =
  | SortingCompareEvent
  | SortingSwapEvent
  | SortingReadEvent
  | SortingWriteEvent
  | SortingMarkSortedEvent
  | SortingSelectEvent
  | SortingRangeEvent
  | SortingAuxiliaryUpdateEvent

export type AlgorithmEvent<TCategoryEvent extends Readonly<{ type: string }> = never> =
  | CoreAlgorithmEvent
  | SortingEvent
  | TCategoryEvent

export type SortingInput = readonly number[]

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'completed'

/** Data contract for a materialized run; timeline behavior is implemented in the next step. */
export type ExecutionSession<
  TInput = unknown,
  TEvent extends Readonly<{ type: string }> = AlgorithmEvent,
> = Readonly<{
  algorithmId: string
  input: TInput
  events: readonly TEvent[]
  currentStep: number
  status: PlaybackStatus
  speed: number
}>

export type SortingMetrics = Readonly<{
  steps: number
  comparisons: number
  swaps: number
  reads: number
  writes: number
}>

export type SortingAuxiliaryPanel = Readonly<{
  id: string
  label: string
  values: readonly number[]
}>

/** Domain state consumed by sorting renderers; algorithms never create UI colors. */
export type SortingVisualizationState = Readonly<{
  values: readonly number[]
  activeEvent: AlgorithmEvent | null
  comparedIndices: readonly number[]
  selectedIndices: readonly number[]
  pivotIndex: number | null
  activeRange: IndexRange | null
  sortedIndices: readonly number[]
  variables: Readonly<Record<string, VariableValue>>
  auxiliaryPanels: readonly SortingAuxiliaryPanel[]
  currentMessage: string | null
  currentPseudocodeLineId: string | null
  metrics: SortingMetrics
}>

export type AlgorithmDefinition<
  TInput = unknown,
  TEvent extends Readonly<{ type: string }> = AlgorithmEvent,
> = Readonly<{
  id: string
  name: string
  category: AlgorithmCategory
  description: string
  shortDescription: string
  displayOrder: number
  useCases: readonly string[]
  complexity: Complexity
  stable?: boolean
  inPlace?: boolean
  pseudocode: readonly PseudocodeLine[]
  validateInput?: (input: Readonly<TInput>) => string | null
  execute: (input: Readonly<TInput>) => Iterable<TEvent>
}>

/** Executable sorting definitions always supply sorting properties. */
export type SortingAlgorithmDefinition = AlgorithmDefinition<SortingInput, AlgorithmEvent> &
  Readonly<{ category: 'sorting'; stable: boolean; inPlace: boolean }>

/** Educational views do not need access to the executable algorithm. */
export type AlgorithmLearningContent = Pick<AlgorithmDefinition,
  'id' | 'name' | 'description' | 'useCases' | 'complexity' | 'stable' | 'inPlace' | 'pseudocode'>

export type AlgorithmSummary = Pick<AlgorithmDefinition,
  'id' | 'name' | 'shortDescription' | 'displayOrder' | 'complexity'>

/** Searching uses shared metadata without inheriting sorting-only properties. */
export type SearchingAlgorithmDefinition<TEvent extends Readonly<{ type: string }>> = Omit<
  AlgorithmDefinition<SearchingInput, TEvent>, 'stable' | 'inPlace'
> & Readonly<{ category: 'searching'; requiresSortedInput: boolean; matchPolicy: 'any-match' }>

export type SearchingInput = Readonly<{ values: readonly number[]; target: number }>

export type SearchingEvent =
  | Readonly<{ type: 'searchProbe'; index: number }>
  | Readonly<{ type: 'searchCompare'; index: number; value: number; target: number }>
  | Readonly<{ type: 'candidateRange'; low: number; high: number }>
  | Readonly<{ type: 'searchResult'; result: 'found'; index: number }>
  | Readonly<{ type: 'searchResult'; result: 'not-found' }>

export type SearchingAlgorithmEvent = CoreAlgorithmEvent | SearchingEvent

export type SearchingMetrics = Readonly<{ steps: number; comparisons: number; probes: number }>
export type SearchingResult =
  | Readonly<{ status: 'pending' }>
  | Readonly<{ status: 'found'; index: number }>
  | Readonly<{ status: 'not-found' }>

export type SearchingVisualizationState = Readonly<{
  values: readonly number[]
  target: number
  activeProbe: number | null
  candidateRange: readonly [low: number, high: number]
  variables: Readonly<Record<string, VariableValue>>
  currentMessage: string | null
  currentPseudocodeLineId: string | null
  activeEvent: SearchingAlgorithmEvent | null
  result: SearchingResult
  metrics: SearchingMetrics
}>

export type StringSearchingInput = Readonly<{ text: string; pattern: string }>
export type StringSearchingEvent =
  | Readonly<{ type: 'stringAlignment'; index: number }>
  | Readonly<{ type: 'stringCompare'; textIndex: number; patternIndex: number; textChar: string; patternChar: string }>
  | Readonly<{ type: 'stringHash'; index: number; windowHash: number; patternHash: number }>
  | Readonly<{ type: 'stringMatch'; index: number }>
  | Readonly<{ type: 'stringSearchComplete' }>
export type StringSearchingAlgorithmEvent = CoreAlgorithmEvent | StringSearchingEvent
export type StringSearchingAlgorithmDefinition = Omit<
  AlgorithmDefinition<StringSearchingInput, StringSearchingAlgorithmEvent>, 'stable' | 'inPlace'
>
export type StringSearchingMetrics = Readonly<{
  steps: number
  characterComparisons: number
  alignments: number
  hashChecks: number
}>
export type StringSearchingResult = Readonly<{ status: 'pending' } | { status: 'completed'; matches: readonly number[] }>
export type StringSearchingVisualizationState = Readonly<{
  text: readonly string[]
  pattern: readonly string[]
  alignmentIndex: number | null
  comparedIndices: readonly [textIndex: number, patternIndex: number] | null
  matches: readonly number[]
  variables: Readonly<Record<string, VariableValue>>
  currentMessage: string | null
  currentPseudocodeLineId: string | null
  activeEvent: StringSearchingAlgorithmEvent | null
  result: StringSearchingResult
  metrics: StringSearchingMetrics
}>
