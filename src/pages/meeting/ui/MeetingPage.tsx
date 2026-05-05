import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { meetingItems } from '../../../entities/game/model/content'
import type { Direction, GameProgress } from '../../../entities/game/model/types'
import { useSwipeControls } from '../../../shared/lib/useSwipeControls'
import { PixelButton } from '../../../shared/ui/PixelButton'
import { PixelSprite } from '../../../shared/ui/PixelSprite'

type Position = {
  x: number
  y: number
}

type MeetingMode = 'world' | 'coffee'

type MeetingPageProps = {
  progress: GameProgress
  onItemFound: (itemId: string) => void
  onComplete: () => void
  onSound: (name: 'click' | 'pickup' | 'success') => void
}

const world = {
  width: 34,
  height: 24,
  viewWidth: 10,
  viewHeight: 7,
}

const coffeeRoom = {
  width: 10,
  height: 7,
  viewWidth: 10,
  viewHeight: 7,
}

const startPosition = { x: 3, y: 18 }
const coffeeDoor = { x: 6, y: 10 }
const coffeeCounter = { x: 5, y: 2 }
const coffeeExit = { x: 5, y: 6 }
const benchPosition = { x: 22, y: 14 }
const zhenyaPosition = { x: 29, y: 7 }

const trees = [
  [13, 5],
  [15, 6],
  [17, 5],
  [26, 12],
  [31, 11],
  [15, 17],
  [12, 19],
  [30, 3],
  [2, 12],
  [3, 13],
  [11, 13],
  [18, 18],
  [19, 22],
  [32, 6],
]

const decorations = [
  { kind: 'tree', x: 13, y: 5 },
  { kind: 'tree', x: 15, y: 6 },
  { kind: 'tree', x: 17, y: 5 },
  { kind: 'tree', x: 26, y: 12 },
  { kind: 'tree', x: 31, y: 11 },
  { kind: 'tree', x: 15, y: 17 },
  { kind: 'tree', x: 12, y: 19 },
  { kind: 'tree', x: 30, y: 3 },
  { kind: 'tree', x: 2, y: 12 },
  { kind: 'tree', x: 3, y: 13 },
  { kind: 'tree', x: 11, y: 13 },
  { kind: 'tree', x: 18, y: 18 },
  { kind: 'tree', x: 19, y: 22 },
  { kind: 'tree', x: 32, y: 6 },
  { kind: 'flower', x: 10, y: 16 },
  { kind: 'flower', x: 24, y: 11 },
  { kind: 'flower-alt', x: 28, y: 13 },
  { kind: 'lamp', x: 6, y: 12 },
  { kind: 'lamp', x: 22, y: 11 },
  { kind: 'stone', x: 21, y: 15 },
  { kind: 'stone', x: 29, y: 15 },
]

const interactiveSpots = [
  {
    id: 'poster',
    label: 'афиша',
    message: 'На афише написано: сегодня вечер для двоих',
    x: 10,
    y: 10,
  },
  {
    id: 'lamp',
    label: 'фонарь',
    message: 'Фонарь мягко светит на дорогу к парку',
    x: 22,
    y: 11,
  },
  {
    id: 'flowers',
    label: 'цветы',
    message: 'Цветы напоминают, что важные моменты в деталях',
    x: 24,
    y: 11,
  },
  {
    id: 'water',
    label: 'вода',
    message: 'Скитские пруды тихо отражают вечер',
    x: 23,
    y: 15,
  },
]

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const sameCell = (a: Position, b: Position) => a.x === b.x && a.y === b.y

const nearCell = (a: Position, b: Position) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1

const getNextPosition = (current: Position, direction: Direction) => {
  const next = { ...current }

  if (direction === 'up') {
    next.y -= 1
  }

  if (direction === 'down') {
    next.y += 1
  }

  if (direction === 'left') {
    next.x -= 1
  }

  if (direction === 'right') {
    next.x += 1
  }

  return next
}

const isWater = (position: Position) =>
  position.x >= 20 && position.x <= 31 && position.y >= 16 && position.y <= 21

const isCoffeeShopWall = (position: Position) =>
  position.x >= 4 && position.x <= 9 && position.y >= 5 && position.y <= 9

const isTree = (position: Position) =>
  trees.some(([x, y]) => position.x === x && position.y === y)

const isWorldBlocked = (position: Position) => {
  if (
    position.x < 0 ||
    position.x >= world.width ||
    position.y < 0 ||
    position.y >= world.height
  ) {
    return true
  }

  return isWater(position) || isCoffeeShopWall(position) || isTree(position)
}

const getWorldTerrain = (position: Position) => {
  if (isWater(position)) {
    return 'water'
  }

  if (position.y === 10 || position.x === 6 || position.x === 22) {
    return 'path'
  }

  if (position.x >= 18 && position.y >= 12) {
    return 'park'
  }

  return 'grass'
}

const getCoffeeTerrain = (position: Position) => {
  if (position.y === 0 || position.x === 0 || position.x === coffeeRoom.width - 1) {
    return 'wall'
  }

  if (sameCell(position, coffeeExit)) {
    return 'exit'
  }

  return 'floor'
}

const getCamera = (position: Position, width: number, height: number) => ({
  x: clamp(position.x - Math.floor(world.viewWidth / 2), 0, width - world.viewWidth),
  y: clamp(position.y - Math.floor(world.viewHeight / 2), 0, height - world.viewHeight),
})

const renderTiles = (
  width: number,
  height: number,
  getTerrain: (position: Position) => string,
) =>
  Array.from({ length: width * height }, (_, index) => {
    const position = { x: index % width, y: Math.floor(index / width) }

    return (
      <span
        className={`map-tile map-tile--${getTerrain(position)}`}
        key={`${position.x}-${position.y}`}
      />
    )
  })

export const MeetingPage = ({
  progress,
  onItemFound,
  onComplete,
  onSound,
}: MeetingPageProps) => {
  const completedRef = useRef(false)
  const [mode, setMode] = useState<MeetingMode>('world')
  const [player, setPlayer] = useState<Position>(startPosition)
  const [coffeePlayer, setCoffeePlayer] = useState<Position>({ x: 5, y: 5 })
  const [dialogVisible, setDialogVisible] = useState(false)
  const [finalPhraseVisible, setFinalPhraseVisible] = useState(false)
  const [hint, setHint] = useState('Иди к кофейне. У двери нажми ДЕЙСТВИЕ')
  const foundItems = progress.foundMeetingItems

  const foundCount = useMemo(
    () => meetingItems.filter((item) => foundItems.includes(item.id)).length,
    [foundItems],
  )
  const allItemsFound = foundCount === meetingItems.length
  const camera =
    mode === 'world'
      ? getCamera(player, world.width, world.height)
      : { x: 0, y: 0 }

  useEffect(() => {
    if (!finalPhraseVisible || completedRef.current) {
      return
    }

    completedRef.current = true
    onSound('success')
    const timer = window.setTimeout(onComplete, 2300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [finalPhraseVisible, onComplete, onSound])

  const collectItem = (itemId: string, message: string) => {
    if (!foundItems.includes(itemId)) {
      onSound('pickup')
      onItemFound(itemId)
      setHint(message)
    }
  }

  const move = (direction: Direction) => {
    if (finalPhraseVisible) {
      return
    }

    if (mode === 'coffee') {
      setCoffeePlayer((current) => {
        const next = getNextPosition(current, direction)

        if (
          next.x < 1 ||
          next.x >= coffeeRoom.width - 1 ||
          next.y < 1 ||
          next.y >= coffeeRoom.height
        ) {
          return current
        }

        setHint('Кофе лежит у стойки. Выход снизу')
        return next
      })
      return
    }

    setPlayer((current) => {
      const next = getNextPosition(current, direction)

      if (isWorldBlocked(next)) {
        return current
      }

      if (nearCell(next, zhenyaPosition)) {
        setDialogVisible(true)
      }

      setHint('Исследуй город, кофейню и парк')
      return next
    })
  }

  const handleAction = () => {
    if (finalPhraseVisible) {
      return
    }

    if (mode === 'coffee') {
      if (nearCell(coffeePlayer, coffeeCounter)) {
        collectItem('coffee', 'Кофе собран. Теперь найди парк у воды')
        return
      }

      if (sameCell(coffeePlayer, coffeeExit)) {
        setMode('world')
        setPlayer(coffeeDoor)
        setHint('Иди по дорожке вправо к парку у воды')
        onSound('click')
        return
      }

      setHint('Подойди к стойке или к выходу')
      onSound('click')
      return
    }

    if (sameCell(player, coffeeDoor)) {
      setMode('coffee')
      setCoffeePlayer({ x: 5, y: 5 })
      setHint('Ты в кофейне. Подойди к стойке')
      onSound('click')
      return
    }

    if (sameCell(player, benchPosition)) {
      collectItem('bench', 'Лавка у воды собрана. Теперь найди Женю')
      return
    }

    const interactiveSpot = interactiveSpots.find((spot) =>
      nearCell(player, { x: spot.x, y: spot.y }),
    )

    if (interactiveSpot) {
      setHint(interactiveSpot.message)
      onSound('click')
      return
    }

    if (nearCell(player, zhenyaPosition)) {
      setDialogVisible(true)

      if (!foundItems.includes('look')) {
        const completesLevel = foundCount === meetingItems.length - 1
        collectItem('look', 'Взгляд собран')

        if (completesLevel) {
          window.setTimeout(() => setFinalPhraseVisible(true), 650)
        }

        return
      }

      if (allItemsFound) {
        setFinalPhraseVisible(true)
        return
      }

      setHint('Сначала нужны кофе, лавка и взгляд')
      onSound('click')
      return
    }

    setHint('ДЕЙСТВИЕ работает у двери, стойки, лавки и Жени')
    onSound('click')
  }

  const swipeHandlers = useSwipeControls(move)

  return (
    <section className="level-page meeting-page page-fade">
      <div className="level-heading">
        <p>Уровень 1</p>
        <h1>Первая встреча</h1>
      </div>

      <div
        className={`meeting-stage game-stage ${mode === 'coffee' ? 'is-coffee' : ''}`}
        {...swipeHandlers}
      >
        <div
          className="meeting-map"
          style={
            {
              '--world-cols': mode === 'world' ? world.width : coffeeRoom.width,
              '--world-rows': mode === 'world' ? world.height : coffeeRoom.height,
              '--camera-x': camera.x,
              '--camera-y': camera.y,
            } as CSSProperties
          }
        >
          <div className="map-grid">
            {mode === 'world'
              ? renderTiles(world.width, world.height, getWorldTerrain)
              : renderTiles(coffeeRoom.width, coffeeRoom.height, getCoffeeTerrain)}
          </div>

          {mode === 'world' ? (
            <>
              <div
                className="map-building map-building--coffee"
                style={{ '--cell-x': 4, '--cell-y': 5 } as CSSProperties}
              >
                <span>CAFE</span>
              </div>
              <div
                className="map-label"
                style={{ '--cell-x': coffeeDoor.x, '--cell-y': coffeeDoor.y } as CSSProperties}
              >
                вход
              </div>
              <div
                className={`scene-item ${foundItems.includes('bench') ? 'is-found' : ''}`}
                style={{ '--cell-x': benchPosition.x, '--cell-y': benchPosition.y } as CSSProperties}
              >
                <span>🪑</span>
              </div>
              <div
                className="map-label map-label--park"
                style={{ '--cell-x': 24, '--cell-y': 13 } as CSSProperties}
              >
                парк скитские пруды
              </div>
              {decorations.map((item) => (
                <div
                  aria-label={item.kind}
                  className={`map-decor map-decor--${item.kind}`}
                  key={`${item.kind}-${item.x}-${item.y}`}
                  role="img"
                  style={{ '--cell-x': item.x, '--cell-y': item.y } as CSSProperties}
                />
              ))}
              {interactiveSpots.map((spot) => (
                <div
                  aria-label={spot.label}
                  className={`map-interactive map-interactive--${spot.id}`}
                  key={spot.id}
                  role="img"
                  style={{ '--cell-x': spot.x, '--cell-y': spot.y } as CSSProperties}
                />
              ))}
              <div
                className="sprite-cell"
                style={{ '--cell-x': zhenyaPosition.x, '--cell-y': zhenyaPosition.y } as CSSProperties}
              >
                <PixelSprite label="Женя" variant="zhenya" active={dialogVisible} />
              </div>
              <div
                className={`scene-item scene-item--look ${foundItems.includes('look') ? 'is-found' : ''}`}
                style={{ '--cell-x': zhenyaPosition.x + 1, '--cell-y': zhenyaPosition.y } as CSSProperties}
              >
                <span>✨</span>
              </div>
              <div
                className="sprite-cell"
                style={{ '--cell-x': player.x, '--cell-y': player.y } as CSSProperties}
              >
                <PixelSprite label="Игрок" variant="hero" active />
              </div>
            </>
          ) : (
            <>
              <div
                className={`scene-item ${foundItems.includes('coffee') ? 'is-found' : ''}`}
                style={{ '--cell-x': coffeeCounter.x, '--cell-y': coffeeCounter.y } as CSSProperties}
              >
                <span>☕</span>
              </div>
              <div
                className="map-counter"
                style={{ '--cell-x': 3, '--cell-y': 1 } as CSSProperties}
              />
              <div
                className="map-label"
                style={{ '--cell-x': coffeeExit.x, '--cell-y': coffeeExit.y } as CSSProperties}
              >
                выход
              </div>
              <div
                className="sprite-cell"
                style={{ '--cell-x': coffeePlayer.x, '--cell-y': coffeePlayer.y } as CSSProperties}
              >
                <PixelSprite label="Игрок" variant="hero" active />
              </div>
            </>
          )}
        </div>

        {dialogVisible && mode === 'world' ? (
          <div className="speech-bubble pixel-dissolve">
            {allItemsFound ? 'Я тогда понял...' : 'Сначала собери кофе, лавку и взгляд'}
          </div>
        ) : null}

        {finalPhraseVisible ? (
          <div className="meeting-final-phrase pixel-dissolve">
            <p>Ты для меня особенная</p>
          </div>
        ) : null}
      </div>

      <div className="level-panel">
        <p className="meeting-help">
          {hint} · собрано {foundCount}/3
        </p>
        <div className="control-pad" aria-label="Движение">
          <PixelButton aria-label="Вверх" onClick={() => move('up')} variant="ghost">
            ▲
          </PixelButton>
          <PixelButton aria-label="Влево" onClick={() => move('left')} variant="ghost">
            ◀
          </PixelButton>
          <PixelButton aria-label="Вправо" onClick={() => move('right')} variant="ghost">
            ▶
          </PixelButton>
          <PixelButton aria-label="Вниз" onClick={() => move('down')} variant="ghost">
            ▼
          </PixelButton>
        </div>
        <PixelButton onClick={handleAction}>ДЕЙСТВИЕ</PixelButton>
      </div>
    </section>
  )
}
