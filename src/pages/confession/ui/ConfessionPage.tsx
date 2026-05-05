import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { GameProgress } from '../../../entities/game/model/types'
import { useHold } from '../../../shared/lib/useHold'
import { PixelButton } from '../../../shared/ui/PixelButton'
import { PixelSprite } from '../../../shared/ui/PixelSprite'

type ConfessionPageProps = {
  progress: GameProgress
  onSolved: () => void
  onComplete: () => void
  onSound: (name: 'click' | 'pickup' | 'success') => void
}

type Point = {
  x: number
  y: number
}

const resizeCanvas = (canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  canvas.width = rect.width * ratio
  canvas.height = rect.height * ratio
  const context = canvas.getContext('2d')

  if (context) {
    context.scale(ratio, ratio)
    context.lineCap = 'square'
    context.lineJoin = 'miter'
    context.lineWidth = 7
    context.strokeStyle = '#ff4d6d'
  }
}

const isHeartLike = (points: Point[]) => {
  if (points.length < 26) {
    return false
  }

  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const width = maxX - minX
  const height = maxY - minY
  const start = points[0]
  const end = points[points.length - 1]
  const closeDistance = Math.hypot(start.x - end.x, start.y - end.y)
  const middleX = minX + width / 2
  const topHalfPoints = points.filter((point) => point.y < minY + height * 0.48)
  const leftTop = topHalfPoints.some((point) => point.x < middleX - width * 0.12)
  const rightTop = topHalfPoints.some((point) => point.x > middleX + width * 0.12)
  const hasBottomPoint = points.some((point) => point.y > minY + height * 0.78)

  return (
    width > 90 &&
    height > 80 &&
    width / height > 0.75 &&
    width / height < 1.8 &&
    closeDistance < Math.max(width, height) * 0.42 &&
    leftTop &&
    rightTop &&
    hasBottomPoint
  )
}

export const ConfessionPage = ({
  progress,
  onSolved,
  onComplete,
  onSound,
}: ConfessionPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pointsRef = useRef<Point[]>([])
  const drawingRef = useRef(false)
  const [message, setMessage] = useState('Нарисуй сердце')
  const solved = progress.confessionSolved
  const holdHandlers = useHold(() => {
    if (solved) {
      onSound('success')
      onComplete()
    }
  })

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    resizeCanvas(canvas)
    const handleResize = () => resizeCanvas(canvas)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const drawTo = (point: Point) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const previous = pointsRef.current[pointsRef.current.length - 1]

    if (!context || !previous) {
      return
    }

    context.beginPath()
    context.moveTo(previous.x, previous.y)
    context.lineTo(point.x, point.y)
    context.stroke()
  }

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    if (solved) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (context && canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }

    onSound('click')
    drawingRef.current = true
    const point = getPoint(event)
    pointsRef.current = [point]
  }

  const continueDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || solved) {
      return
    }

    const point = getPoint(event)
    drawTo(point)
    pointsRef.current.push(point)
  }

  const finishDrawing = () => {
    if (!drawingRef.current || solved) {
      return
    }

    drawingRef.current = false

    if (isHeartLike(pointsRef.current)) {
      onSound('pickup')
      onSolved()
      setMessage('Я люблю тебя')
      return
    }

    setMessage('Еще раз, почти получилось')
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (context && canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }

    pointsRef.current = []
    setMessage('Нарисуй сердце')
  }

  return (
    <section className="level-page page-fade">
      <div className="level-heading">
        <p>Уровень 5</p>
        <h1>Признание</h1>
      </div>

      <div className={`confession-stage game-stage ${solved ? 'is-solved' : ''}`}>
        <div className="star-field" aria-hidden="true" />
        <canvas
          aria-label="Полотно для рисования сердца"
          className="heart-canvas"
          onPointerCancel={finishDrawing}
          onPointerDown={startDrawing}
          onPointerMove={continueDrawing}
          onPointerUp={finishDrawing}
          ref={canvasRef}
        />

        {solved ? (
          <button className="zhenya-arrival pixel-dissolve" type="button" {...holdHandlers}>
            <PixelSprite label="Женя" variant="zhenya" active />
            <span>Я люблю тебя</span>
          </button>
        ) : null}
      </div>

      <div className="level-panel">
        <p className="match-message">{message}</p>
        <div className="panel-actions">
          <PixelButton onClick={clearCanvas} variant="ghost">
            ОЧИСТИТЬ
          </PixelButton>
          <PixelButton disabled={!solved} onClick={onComplete}>
            ДАЛЬШЕ
          </PixelButton>
        </div>
      </div>
    </section>
  )
}
