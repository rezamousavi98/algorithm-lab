import { algorithmRegistry } from '@/domain/algorithms/registry'
import { searchingAlgorithmRegistry, searchingAlgorithms, stringSearchingAlgorithmRegistry, stringSearchingAlgorithms } from '@/domain/algorithms/searching'
import { hashSearchingAlgorithmRegistry, hashSearchingAlgorithms } from '@/domain/algorithms/searching/hash'
import { treeSearchingAlgorithmRegistry, treeSearchingAlgorithms } from '@/domain/algorithms/searching/tree'
import type { UserPreferences } from '@/domain/preferences/user-preferences'
import { SearchingCategory } from '@/features/searching/searching-category'
import { StringSearchingCategory } from '@/features/searching/string-searching-category'
import { SortingCategory } from '@/features/sorting/sorting-category'
import { HashSearchingCategory } from '@/features/searching/hash/hash-searching-category'
import { TreeSearchingCategory } from '@/features/searching/tree/tree-searching-category'

const sortingDefinitions = [...algorithmRegistry.definitions].sort((a, b) => a.displayOrder - b.displayOrder)
const arraySearchDefinitions = [...searchingAlgorithms].sort((a, b) => a.displayOrder - b.displayOrder)
const stringSearchDefinitions = [...stringSearchingAlgorithms].sort((a, b) => a.displayOrder - b.displayOrder)
const hashSearchDefinitions = [...hashSearchingAlgorithms].sort((a, b) => a.displayOrder - b.displayOrder)
const treeSearchDefinitions = [...treeSearchingAlgorithms].sort((a, b) => a.displayOrder - b.displayOrder)

function SearchingWorkspaceComposer({ preferences, setPreferences }: Props) {
  const speed = preferences.playbackSpeed
  const onSpeedChange = (playbackSpeed: number) => setPreferences(current => ({ ...current, playbackSpeed }))

  switch (preferences.searchMode) {
    case 'array': {
      const algorithm = searchingAlgorithmRegistry.get(preferences.lastSearchingAlgorithmId) ?? arraySearchDefinitions[0]
      return <SearchingCategory algorithm={algorithm} arraySize={preferences.arraySize} speed={speed}
        onSizeChange={arraySize => setPreferences(current => ({ ...current, arraySize }))} onSpeedChange={onSpeedChange}/>
    }
    case 'string': {
      const algorithm = stringSearchingAlgorithmRegistry.get(preferences.lastStringSearchAlgorithmId) ?? stringSearchDefinitions[0]
      return <StringSearchingCategory algorithm={algorithm} speed={speed} onSpeedChange={onSpeedChange}/>
    }
    case 'hash': {
      const algorithm = hashSearchingAlgorithmRegistry.get(preferences.lastHashSearchAlgorithmId) ?? hashSearchDefinitions[0]
      return <HashSearchingCategory key={algorithm.id} algorithm={algorithm} speed={speed} onSpeedChange={onSpeedChange}/>
    }
    case 'tree':
      {
        const algorithm = treeSearchingAlgorithmRegistry.get(preferences.lastTreeSearchAlgorithmId) ?? treeSearchDefinitions[0]
        return <TreeSearchingCategory algorithm={algorithm} speed={speed} onSpeedChange={onSpeedChange}/>
      }
  }
}

type Props = Readonly<{
  preferences: UserPreferences
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>
}>

export function WorkspaceComposer({ preferences, setPreferences }: Props) {
  if (preferences.category === 'sorting') {
    const algorithm = algorithmRegistry.get(preferences.lastAlgorithmId) ?? sortingDefinitions[0]
    return <SortingCategory algorithm={algorithm} arraySize={preferences.arraySize} speed={preferences.playbackSpeed}
      onSizeChange={arraySize => setPreferences(current => ({ ...current, arraySize }))}
      onSpeedChange={playbackSpeed => setPreferences(current => ({ ...current, playbackSpeed }))}/>
  }
  return <SearchingWorkspaceComposer preferences={preferences} setPreferences={setPreferences}/>
}
