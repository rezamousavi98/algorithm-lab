import { createAlgorithmRegistry } from '../registry'
import { binarySearch } from './binary-search'
import { exponentialSearch } from './exponential-search'
import { fibonacciSearch } from './fibonacci-search'
import { interpolationSearch } from './interpolation-search'
import { jumpSearch } from './jump-search'
import { linearSearch } from './linear-search'
import { hashSearchingAlgorithmRegistry, hashSearchingAlgorithms } from './hash'
import { stringSearchingAlgorithmRegistry, stringSearchingAlgorithms } from './strings'

export { binarySearch, exponentialSearch, fibonacciSearch, interpolationSearch, jumpSearch, linearSearch }
export { stringSearchingAlgorithmRegistry, stringSearchingAlgorithms }
export { hashSearchingAlgorithmRegistry, hashSearchingAlgorithms }

export const searchingAlgorithms = Object.freeze([
  linearSearch, binarySearch, jumpSearch, exponentialSearch, interpolationSearch, fibonacciSearch,
])

export const searchingAlgorithmRegistry = createAlgorithmRegistry(searchingAlgorithms)
