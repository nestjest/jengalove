import { useRef } from 'react'
import type { PointerEvent } from 'react'

export const useHold = (onHold: () => void, delay = 650) => {
  const timer = useRef<number | null>(null)

  const clear = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    clear()
    timer.current = window.setTimeout(() => {
      timer.current = null
      onHold()
    }, delay)
  }

  return {
    onPointerDown,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
  }
}
