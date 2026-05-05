import { levelOrder } from '../../../entities/game/model/content'
import type { CSSProperties } from 'react'
import type { GameProgress } from '../../../entities/game/model/types'
import { PixelButton } from '../../../shared/ui/PixelButton'

type FinalPageProps = {
  progress: GameProgress
  onOpen: () => void
  onSound: (name: 'click' | 'success') => void
}

export const FinalPage = ({ progress, onOpen, onSound }: FinalPageProps) => {
  const unlocked = levelOrder.every((level) => progress.fragments.includes(level))

  return (
    <section className="final-page page-fade">
      <div className="level-heading">
        <p>Финал</p>
        <h1>Сердце воспоминаний</h1>
      </div>

      <div className={`memory-heart ${unlocked ? 'is-unlocked' : ''}`} aria-hidden="true">
        {levelOrder.map((level, index) => (
          <span
            className={progress.fragments.includes(level) ? 'is-filled' : ''}
            key={level}
            style={{ '--heart-index': index } as CSSProperties}
          />
        ))}
      </div>

      {unlocked ? (
        <div className="final-panel">
          <PixelButton
            onClick={() => {
              onSound('success')
              onOpen()
            }}
          >
            ОТКРЫТЬ
          </PixelButton>

          {progress.finalOpened ? (
            <div className="video-frame pixel-dissolve">
              <video controls poster="/final-poster.jpg">
                <source src="/final-video.mp4" type="video/mp4" />
              </video>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="final-panel">
          <p>Фрагменты еще не собраны</p>
          <PixelButton onClick={() => onSound('click')} variant="ghost">
            ЗАКРЫТО
          </PixelButton>
        </div>
      )}
    </section>
  )
}
