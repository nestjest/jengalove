import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Direction, HeroStyle } from '../../../entities/game/model/types'
import { useSwipeControls } from '../../../shared/lib/useSwipeControls'
import { PixelButton } from '../../../shared/ui/PixelButton'
import { PixelSprite } from '../../../shared/ui/PixelSprite'

type TrialsPageProps = {
  heroStyle: HeroStyle
  onLoveChange: (delta: number) => void
  onComplete: () => void
  onShake: () => void
  onSound: (name: 'hit' | 'success') => void
}

type Position = {
  x: number
  y: number
}

const mazeRows = [
  'S....#..D..#....',
  '.###.#.###.#.##.',
  '...#...#...#...D',
  '##.#####.#.###.#',
  '...#.....#...#..',
  '.#.###D#####.#.#',
  '.#...#.....#...#',
  '.###.#.###.###.#',
  '.#...#.#Q#.....#',
  '.#.###.#.#####.#',
  '.#.....#...D...#',
  '.#####.###.###.#',
  '.......Q...#...G',
]

const maze = mazeRows.map((row) => row.split(''))

const startPosition = { x: 0, y: 0 }

const mazeCamera = {
  viewWidth: 7,
  viewHeight: 6,
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const getCamera = (position: Position) => ({
  x: clamp(
    position.x - Math.floor(mazeCamera.viewWidth / 2),
    0,
    maze[0].length - mazeCamera.viewWidth,
  ),
  y: clamp(
    position.y - Math.floor(mazeCamera.viewHeight / 2),
    0,
    maze.length - mazeCamera.viewHeight,
  ),
})

const isWall = (position: Position) => maze[position.y]?.[position.x] === '#'

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

export const TrialsPage = ({
  heroStyle,
  onLoveChange,
  onComplete,
  onShake,
  onSound,
}: TrialsPageProps) => {
  const [player, setPlayer] = useState<Position>(startPosition)
  const [finished, setFinished] = useState(false)
  const camera = getCamera(player)

  const move = (direction: Direction) => {
    if (finished) {
      return
    }

    const next = getNextPosition(player, direction)
    const cell = maze[next.y]?.[next.x]

    if (!cell || isWall(next)) {
      return
    }

    setPlayer(next)

    if (cell === 'D' || cell === 'Q') {
      onLoveChange(-5)
      onShake()
      onSound('hit')
    }

    if (cell === 'G') {
      setFinished(true)
      onSound('success')
    }
  }

  const swipeHandlers = useSwipeControls((direction) => move(direction))

  return (
    <section className="level-page trials-page page-fade">
      <div className="level-heading">
        <p>Уровень 3</p>
        <h1>Испытания</h1>
      </div>

      <div className="maze-stage game-stage" {...swipeHandlers}>
        <div
          className="maze-map"
          style={
            {
              '--maze-cols': maze[0].length,
              '--maze-rows': maze.length,
              '--maze-camera-x': camera.x,
              '--maze-camera-y': camera.y,
            } as CSSProperties
          }
        >
          <div className="maze-grid">
            {maze.map((row, y) =>
              row.map((cell, x) => (
                <div
                  className={`maze-cell maze-cell--${cell === '#' ? 'wall' : 'path'}`}
                  key={`${x}-${y}`}
                >
                  {cell === 'D' ? <span className="maze-hazard">сомнения</span> : null}
                  {cell === 'Q' ? <span className="maze-hazard">ссора</span> : null}
                  {cell === 'G' ? <PixelSprite label="Женя" variant="zhenya" active /> : null}
                  {player.x === x && player.y === y ? (
                    <PixelSprite
                      active
                      hair={heroStyle.hair}
                      label="Игрок"
                      outfit={heroStyle.outfit}
                      variant="hero"
                    />
                  ) : null}
                </div>
              )),
            )}
          </div>
        </div>
      </div>

      <div className="level-panel">
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
        {finished ? (
          <div className="ending-note pixel-dissolve">
            <p>Но мы всегда находили путь друг к другу</p>
            <PixelButton onClick={onComplete}>ДАЛЬШЕ</PixelButton>
          </div>
        ) : null}
      </div>
    </section>
  )
}
