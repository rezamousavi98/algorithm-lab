import { boyerMoore } from './boyer-moore'
import { knuthMorrisPratt } from './knuth-morris-pratt'
import { naiveStringSearch } from './naive-string-search'
import { rabinKarp } from './rabin-karp'
import { createAlgorithmRegistry } from '../../registry'

export { boyerMoore, knuthMorrisPratt, naiveStringSearch, rabinKarp }

export const stringSearchingAlgorithms = Object.freeze([
  naiveStringSearch, knuthMorrisPratt, boyerMoore, rabinKarp,
])

export const stringSearchingAlgorithmRegistry = createAlgorithmRegistry(stringSearchingAlgorithms)
