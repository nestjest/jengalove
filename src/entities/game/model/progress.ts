import type { GameProgress } from './types'

export const defaultProgress: GameProgress = {
  currentScene: 'start',
  love: 0,
  fragments: [],
  completedLevels: [],
  foundMeetingItems: [],
  matchedMemoryPairs: [],
  collectedWords: [],
  confessionSolved: false,
  finalOpened: false,
}
