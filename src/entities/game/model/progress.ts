import type { GameProgress } from './types'

export const defaultProgress: GameProgress = {
  currentScene: 'start',
  love: 0,
  fragments: [],
  completedLevels: [],
  foundMeetingItems: [],
  matchedMemoryPairs: [],
  collectedWords: [],
  heroStyle: {
    hair: 'default',
    outfit: 'jacket',
  },
  confessionSolved: false,
  finalOpened: false,
}
