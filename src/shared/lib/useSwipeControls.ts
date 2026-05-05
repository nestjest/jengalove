import { useRef } from 'react'
import type { PointerEvent } from 'react'
import type { Direction } from '../../entities/game/model/types'

type SwipeHandlers = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void
  onPointerUp: (event: PointerEvent<HTMLElement>) => void
  onPointerCancel: () => void
}

type Point = {
  x: number
  y: number
}

export const useSwipeControls = (
  onSwipe: (direction: Direction) => void,
  threshold = 24,
): SwipeHandlers => {
  const startPoint = useRef<Point | null>(null)

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    startPoint.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = startPoint.current
    startPoint.current = null

    if (!start) {
      return
    }

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y

    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) {
      return
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      onSwipe(dx > 0 ? 'right' : 'left')
      return
    }

    onSwipe(dy > 0 ? 'down' : 'up')
  }

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel: () => {
      startPoint.current = null
    },
  }
}
