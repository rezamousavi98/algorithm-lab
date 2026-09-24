import { bubbleSort } from './bubble-sort'
import { cocktailShakerSort } from './cocktail-shaker-sort'
import { countingSort } from './counting-sort'
import { heapSort } from './heap-sort'
import { insertionSort } from './insertion-sort'
import { mergeSort } from './merge-sort'
import { quickSort } from './quick-sort'
import { radixSort } from './radix-sort'
import { selectionSort } from './selection-sort'
import { shellSort } from './shell-sort'

export { bubbleSort } from './bubble-sort'
export { cocktailShakerSort } from './cocktail-shaker-sort'
export { countingSort } from './counting-sort'
export { heapSort } from './heap-sort'
export { insertionSort } from './insertion-sort'
export { mergeSort } from './merge-sort'
export { quickSort } from './quick-sort'
export { radixSort } from './radix-sort'
export { selectionSort } from './selection-sort'
export { shellSort } from './shell-sort'

/** Registry order is the default order in which the sorting browser presents the algorithms. */
export const sortingAlgorithms = Object.freeze([
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  shellSort,
  countingSort,
  radixSort,
  cocktailShakerSort,
])
