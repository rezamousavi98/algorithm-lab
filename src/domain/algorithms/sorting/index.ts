import { bubbleSort } from './bubble-sort'
import { binaryInsertionSort } from './binary-insertion-sort'
import { bottomUpMergeSort } from './bottom-up-merge-sort'
import { bucketSort } from './bucket-sort'
import { cocktailShakerSort } from './cocktail-shaker-sort'
import { combSort } from './comb-sort'
import { countingSort } from './counting-sort'
import { cycleSort } from './cycle-sort'
import { gnomeSort } from './gnome-sort'
import { heapSort } from './heap-sort'
import { introSort } from './intro-sort'
import { insertionSort } from './insertion-sort'
import { mergeSort } from './merge-sort'
import { oddEvenSort } from './odd-even-sort'
import { pancakeSort } from './pancake-sort'
import { quickSort } from './quick-sort'
import { radixSort } from './radix-sort'
import { selectionSort } from './selection-sort'
import { shellSort } from './shell-sort'
import { timSort } from './tim-sort'

export { binaryInsertionSort } from './binary-insertion-sort'
export { bottomUpMergeSort } from './bottom-up-merge-sort'
export { bucketSort } from './bucket-sort'
export { bubbleSort } from './bubble-sort'
export { cocktailShakerSort } from './cocktail-shaker-sort'
export { combSort } from './comb-sort'
export { countingSort } from './counting-sort'
export { cycleSort } from './cycle-sort'
export { gnomeSort } from './gnome-sort'
export { heapSort } from './heap-sort'
export { introSort } from './intro-sort'
export { insertionSort } from './insertion-sort'
export { mergeSort } from './merge-sort'
export { oddEvenSort } from './odd-even-sort'
export { pancakeSort } from './pancake-sort'
export { quickSort } from './quick-sort'
export { radixSort } from './radix-sort'
export { selectionSort } from './selection-sort'
export { shellSort } from './shell-sort'
export { timSort } from './tim-sort'

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
  combSort,
  gnomeSort,
  oddEvenSort,
  cycleSort,
  pancakeSort,
  binaryInsertionSort,
  bottomUpMergeSort,
  bucketSort,
  timSort,
  introSort,
])
