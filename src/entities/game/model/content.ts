import type { LevelKey, MemoryCardContent, SceneKey } from './types'

export const levelOrder: LevelKey[] = [
  'meeting',
  'moments',
  'trials',
  'why',
  'confession',
]

export const nextSceneByLevel: Record<LevelKey, SceneKey> = {
  meeting: 'firstMeetingCutscene',
  moments: 'momentsCutscene',
  trials: 'realizationCutscene',
  why: 'confession',
  confession: 'climaxCutscene',
}

export const levelTitles: Record<LevelKey, string> = {
  meeting: 'Первая встреча',
  moments: 'Наши моменты',
  trials: 'Испытания',
  why: 'Почему ты',
  confession: 'Признание',
}

export const meetingItems = [
  { id: 'coffee', title: 'кофе', icon: '☕', x: 2, y: 3 },
  { id: 'bench', title: 'лавка', icon: '🪑', x: 4, y: 1 },
  { id: 'look', title: 'взгляд', icon: '✨', x: 6, y: 3 },
]

export const memoryCards: MemoryCardContent[] = [
  { pairId: 'trip', title: 'поездка', symbol: '🚆' },
  { pairId: 'walk', title: 'прогулка', symbol: '🌙' },
  { pairId: 'laugh', title: 'смех', symbol: '✦' },
  { pairId: 'chat', title: 'переписка', symbol: '💬' },
]

export const loveWords = ['добрая', 'красивая', 'сильная', 'моя']
