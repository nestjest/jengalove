import { useEffect, useState } from 'react'
import { defaultProgress } from '../../../entities/game/model/progress'
import { nextSceneByLevel } from '../../../entities/game/model/content'
import type {
  GameProgress,
  HeroStyle,
  LevelKey,
  SceneKey,
} from '../../../entities/game/model/types'
import {
  clearProgress,
  loadProgress,
  saveProgress,
} from '../../../shared/lib/storage'

const clampLove = (love: number) => Math.min(100, Math.max(0, love))

const unique = <T,>(items: T[]) => Array.from(new Set(items))

export const useGameProgress = () => {
  const [progress, setProgress] = useState<GameProgress>(() => loadProgress())

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const updateProgress = (updater: (progress: GameProgress) => GameProgress) => {
    setProgress((current) => updater(current))
  }

  const goToScene = (scene: SceneKey) => {
    updateProgress((current) => ({ ...current, currentScene: scene }))
  }

  const completeLevel = (level: LevelKey) => {
    updateProgress((current) => {
      const alreadyCompleted = current.completedLevels.includes(level)

      return {
        ...current,
        currentScene: nextSceneByLevel[level],
        love: alreadyCompleted ? current.love : clampLove(current.love + 20),
        fragments: alreadyCompleted
          ? current.fragments
          : unique([...current.fragments, level]),
        completedLevels: alreadyCompleted
          ? current.completedLevels
          : unique([...current.completedLevels, level]),
      }
    })
  }

  const changeLove = (delta: number) => {
    updateProgress((current) => ({
      ...current,
      love: clampLove(current.love + delta),
    }))
  }

  const collectMeetingItem = (itemId: string) => {
    updateProgress((current) => ({
      ...current,
      foundMeetingItems: unique([...current.foundMeetingItems, itemId]),
    }))
  }

  const matchMemoryPair = (pairId: string) => {
    updateProgress((current) => ({
      ...current,
      matchedMemoryPairs: unique([...current.matchedMemoryPairs, pairId]),
    }))
  }

  const collectWord = (word: string) => {
    updateProgress((current) => ({
      ...current,
      collectedWords: unique([...current.collectedWords, word]),
    }))
  }

  const updateHeroStyle = (heroStyle: HeroStyle) => {
    updateProgress((current) => ({
      ...current,
      heroStyle,
    }))
  }

  const solveConfession = () => {
    updateProgress((current) => ({ ...current, confessionSolved: true }))
  }

  const openFinalVideo = () => {
    updateProgress((current) => ({ ...current, finalOpened: true }))
  }

  const resetProgress = () => {
    clearProgress()
    setProgress(defaultProgress)
  }

  return {
    progress,
    goToScene,
    completeLevel,
    changeLove,
    collectMeetingItem,
    matchMemoryPair,
    collectWord,
    updateHeroStyle,
    solveConfession,
    openFinalVideo,
    resetProgress,
  }
}
