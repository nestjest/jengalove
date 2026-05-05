import { useRef } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { loveWords } from '../../../entities/game/model/content'
import type { GameProgress } from '../../../entities/game/model/types'
import { PixelButton } from '../../../shared/ui/PixelButton'

type WhyPageProps = {
  progress: GameProgress
  onWordCollect: (word: string) => void
  onComplete: () => void
  onSound: (name: 'pickup' | 'success') => void
}

const wordPositions = [
  { left: 14, top: 24 },
  { left: 62, top: 18 },
  { left: 20, top: 66 },
  { left: 68, top: 62 },
]

export const WhyPage = ({
  progress,
  onWordCollect,
  onComplete,
  onSound,
}: WhyPageProps) => {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const wordRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const collectedWords = progress.collectedWords
  const allCollected = loveWords.every((word) => collectedWords.includes(word))

  const collect = (word: string) => {
    if (!collectedWords.includes(word)) {
      onSound('pickup')
      onWordCollect(word)
    }
  }

  const collectByPoint = (event: PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current

    if (!stage) {
      return
    }

    for (const word of loveWords) {
      const element = wordRefs.current[word]

      if (!element || collectedWords.includes(word)) {
        continue
      }

      const rect = element.getBoundingClientRect()
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom

      if (isInside) {
        collect(word)
      }
    }
  }

  return (
    <section className="level-page page-fade">
      <div className="level-heading">
        <p>Уровень 4</p>
        <h1>Почему ты</h1>
      </div>

      <div
        className={`words-stage game-stage ${allCollected ? 'is-complete' : ''}`}
        onPointerDown={collectByPoint}
        onPointerMove={collectByPoint}
        ref={stageRef}
      >
        {loveWords.map((word, index) => (
          <button
            className={`floating-word ${collectedWords.includes(word) ? 'is-collected' : ''}`}
            key={word}
            onClick={() => collect(word)}
            ref={(node) => {
              wordRefs.current[word] = node
            }}
            style={{
              '--word-left': `${wordPositions[index].left}%`,
              '--word-top': `${wordPositions[index].top}%`,
            } as CSSProperties}
            type="button"
          >
            {word}
          </button>
        ))}

        {allCollected ? (
          <div className="heart-phrase pixel-dissolve">
            <div className="word-heart" aria-hidden="true">
              ❤️
            </div>
            <p>Ты — моя самая важная часть жизни</p>
          </div>
        ) : null}
      </div>

      <div className="level-panel">
        <div className="objective-list">
          {loveWords.map((word) => (
            <span className={collectedWords.includes(word) ? 'is-done' : ''} key={word}>
              {word}
            </span>
          ))}
        </div>
        <PixelButton
          disabled={!allCollected}
          onClick={() => {
            onSound('success')
            onComplete()
          }}
        >
          ДАЛЬШЕ
        </PixelButton>
      </div>
    </section>
  )
}
