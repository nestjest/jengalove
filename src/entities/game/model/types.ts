export type SceneKey =
  | 'start'
  | 'introCutscene'
  | 'meeting'
  | 'firstMeetingCutscene'
  | 'moments'
  | 'momentsCutscene'
  | 'trials'
  | 'realizationCutscene'
  | 'why'
  | 'confession'
  | 'climaxCutscene'
  | 'final'

export type LevelKey = 'meeting' | 'moments' | 'trials' | 'why' | 'confession'

export type Direction = 'up' | 'right' | 'down' | 'left'

export type HeroHair = 'default' | 'neat' | 'bold'

export type HeroOutfit = 'jacket' | 'shirt' | 'sweater'

export type HeroStyle = {
  hair: HeroHair
  outfit: HeroOutfit
}

export type GameProgress = {
  currentScene: SceneKey
  love: number
  fragments: LevelKey[]
  completedLevels: LevelKey[]
  foundMeetingItems: string[]
  matchedMemoryPairs: string[]
  collectedWords: string[]
  heroStyle: HeroStyle
  confessionSolved: boolean
  finalOpened: boolean
}

export type MemoryCardContent = {
  pairId: string
  title: string
  symbol: string
  image?: string
}
