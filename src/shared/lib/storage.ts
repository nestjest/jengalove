import { defaultProgress } from '../../entities/game/model/progress'
import type { GameProgress } from '../../entities/game/model/types'

const STORAGE_KEY = 'jenga-love-progress'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const stringArray = (value: unknown, fallback: string[]) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : fallback

const migrateMeetingItems = (items: string[]) =>
  Array.from(new Set(items.map((item) => (item === 'rain' ? 'bench' : item))))

export const loadProgress = (): GameProgress => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return defaultProgress
    }

    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed)) {
      return defaultProgress
    }

    return {
      ...defaultProgress,
      ...parsed,
      love:
        typeof parsed.love === 'number'
          ? Math.min(100, Math.max(0, parsed.love))
          : defaultProgress.love,
      fragments: stringArray(parsed.fragments, defaultProgress.fragments),
      completedLevels: stringArray(
        parsed.completedLevels,
        defaultProgress.completedLevels,
      ),
      foundMeetingItems: migrateMeetingItems(
        stringArray(parsed.foundMeetingItems, defaultProgress.foundMeetingItems),
      ),
      matchedMemoryPairs: stringArray(
        parsed.matchedMemoryPairs,
        defaultProgress.matchedMemoryPairs,
      ),
      collectedWords: stringArray(
        parsed.collectedWords,
        defaultProgress.collectedWords,
      ),
      confessionSolved:
        typeof parsed.confessionSolved === 'boolean'
          ? parsed.confessionSolved
          : defaultProgress.confessionSolved,
      finalOpened:
        typeof parsed.finalOpened === 'boolean'
          ? parsed.finalOpened
          : defaultProgress.finalOpened,
    } as GameProgress
  } catch {
    return defaultProgress
  }
}

export const saveProgress = (progress: GameProgress) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export const clearProgress = () => {
  window.localStorage.removeItem(STORAGE_KEY)
}
