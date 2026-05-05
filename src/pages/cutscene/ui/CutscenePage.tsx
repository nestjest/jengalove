import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import type { Direction, HeroStyle } from '../../../entities/game/model/types'
import { useSwipeControls } from '../../../shared/lib/useSwipeControls'
import { PixelButton } from '../../../shared/ui/PixelButton'
import { PixelSprite } from '../../../shared/ui/PixelSprite'

type CutsceneVariant =
  | 'intro'
  | 'firstMeeting'
  | 'moments'
  | 'realization'
  | 'climax'

type CutscenePageProps = {
  heroStyle: HeroStyle
  variant: CutsceneVariant
  onComplete: () => void
  onHeroStyleChange: (heroStyle: HeroStyle) => void
  onSound: (name: 'click' | 'pickup' | 'success') => void
}

type Speaker = 'Текст' | 'Женя' | 'Я'

type DialogueLine = {
  speaker: Speaker
  text: string
}

type Shot = {
  title: string
  lines: DialogueLine[]
  scene: 'room' | 'phone' | 'mirror' | 'road' | 'meeting' | 'montage' | 'dark' | 'stars'
  choices?: string[]
  interactive?: 'style'
}

const line = (speaker: Speaker, text: string): DialogueLine => ({ speaker, text })

const shotsByVariant: Record<CutsceneVariant, Shot[]> = {
  intro: [
    {
      title: 'Пробуждение',
      lines: [line('Я', 'Обычное утро...')],
      scene: 'room',
    },
    {
      title: 'Телефон',
      lines: [
        line('Я', '...но что-то изменилось'),
        line('Женя', 'Доброе утро :)'),
        line('Женя', 'Как ты?'),
      ],
      scene: 'phone',
      choices: [
        'Теперь уже хорошо',
        'Сонный, но рад тебе',
        'Ждал твоего сообщения',
      ],
    },
    {
      title: 'Ожидание',
      lines: [
        line('Женя', 'Хаха :)'),
        line('Женя', 'Давай увидимся?'),
        line('Я', 'Я хотел выглядеть лучше, чем обычно'),
      ],
      scene: 'mirror',
      interactive: 'style',
    },
    {
      title: 'Дорога',
      lines: [
        line('Я', 'Почему я волнуюсь?'),
        line('Я', 'Это же просто встреча...'),
        line('Я', '...или нет?'),
      ],
      scene: 'road',
    },
  ],
  firstMeeting: [
    {
      title: 'Первая встреча',
      lines: [line('Текст', 'Женя стояла спиной'), line('Я', 'Я подошел ближе')],
      scene: 'meeting',
    },
    {
      title: 'Момент',
      lines: [
        line('Женя', 'Привет...'),
        line('Я', 'Привет'),
        line('Я', 'И все стало... другим'),
      ],
      scene: 'meeting',
    },
  ],
  moments: [
    {
      title: 'Мгновения',
      lines: [
        line('Текст', 'смех'),
        line('Текст', 'прогулка'),
        line('Текст', 'переписка ночью'),
        line('Текст', 'держимся за руки'),
      ],
      scene: 'montage',
    },
    {
      title: 'Мгновения',
      lines: [
        line('Я', 'Каждый момент...'),
        line('Я', 'становился важнее предыдущего'),
      ],
      scene: 'montage',
    },
  ],
  realization: [
    {
      title: 'Осознание',
      lines: [
        line('Я', 'И тогда я понял...'),
        line('Я', 'мне мало просто встреч'),
        line('Я', 'я хочу видеть ее всегда'),
      ],
      scene: 'dark',
    },
  ],
  climax: [
    {
      title: 'Кульминация',
      lines: [
        line('Я', 'Я не хочу просто моменты'),
        line('Я', 'Я хочу жизнь с тобой'),
        line('Женя', 'Я тоже...'),
      ],
      scene: 'stars',
    },
  ],
}

const styleOptions = [
  { label: 'куртка', outfit: 'jacket' as const },
  { label: 'рубашка', outfit: 'shirt' as const },
  { label: 'свитер', outfit: 'sweater' as const },
]

const hairOptions = [
  { label: 'обычно', hair: 'default' as const },
  { label: 'аккуратно', hair: 'neat' as const },
  { label: 'смело', hair: 'bold' as const },
]

export const CutscenePage = ({
  heroStyle,
  variant,
  onComplete,
  onHeroStyleChange,
  onSound,
}: CutscenePageProps) => {
  const shots = shotsByVariant[variant]
  const [shotIndex, setShotIndex] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [selectedReply, setSelectedReply] = useState('')
  const [styleIndex, setStyleIndex] = useState(() =>
    Math.max(0, styleOptions.findIndex((option) => option.outfit === heroStyle.outfit)),
  )
  const [hairIndex, setHairIndex] = useState(() =>
    Math.max(0, hairOptions.findIndex((option) => option.hair === heroStyle.hair)),
  )
  const shot = shots[shotIndex]
  const visibleLines = [shot.lines[lineIndex]]
  const choicesVisible = Boolean(shot.choices && lineIndex >= shot.lines.length - 1)
  const canContinue = !shot.choices || selectedReply.length > 0
  const heroOutfit = styleOptions[styleIndex].outfit
  const heroHair = hairOptions[hairIndex].hair

  const sceneClassName = useMemo(
    () => `cutscene-frame cutscene-frame--${shot.scene}`,
    [shot.scene],
  )

  const goToNextShot = () => {
    if (shot.interactive === 'style') {
      onHeroStyleChange({
        hair: heroHair,
        outfit: heroOutfit,
      })
    }

    onSound(shotIndex === shots.length - 1 ? 'success' : 'click')

    if (shotIndex === shots.length - 1) {
      onComplete()
      return
    }

    setLineIndex(0)
    setSelectedReply('')
    setShotIndex((current) => current + 1)
  }

  const next = () => {
    if (lineIndex < shot.lines.length - 1) {
      setLineIndex((current) => current + 1)
      onSound('click')
      return
    }

    if (!canContinue) {
      onSound('click')
      return
    }

    goToNextShot()
  }

  const changeStyle = (direction: Direction) => {
    if (shot.interactive !== 'style') {
      return
    }

    if (direction === 'left' || direction === 'right') {
      setStyleIndex((current) => {
        const nextIndex = direction === 'right'
          ? (current + 1) % styleOptions.length
          : (current + styleOptions.length - 1) % styleOptions.length

        onHeroStyleChange({
          hair: hairOptions[hairIndex].hair,
          outfit: styleOptions[nextIndex].outfit,
        })

        return nextIndex
      })
    }

    if (direction === 'up' || direction === 'down') {
      setHairIndex((current) => {
        const nextIndex = direction === 'down'
          ? (current + 1) % hairOptions.length
          : (current + hairOptions.length - 1) % hairOptions.length

        onHeroStyleChange({
          hair: hairOptions[nextIndex].hair,
          outfit: styleOptions[styleIndex].outfit,
        })

        return nextIndex
      })
    }

    onSound('click')
  }

  const swipeHandlers = useSwipeControls(changeStyle)

  const handleFrameClick = (event: MouseEvent<HTMLElement>) => {
    if (shot.interactive === 'style') {
      return
    }

    if ((event.target as HTMLElement).closest('button')) {
      return
    }

    next()
  }

  const chooseReply = (choice: string) => {
    setSelectedReply(choice)
    onSound('click')

    window.setTimeout(() => {
      setLineIndex(0)
      setSelectedReply('')
      setShotIndex((current) => Math.min(current + 1, shots.length - 1))
    }, 260)
  }

  return (
    <section className="cutscene-page page-fade">
      <div className="level-heading">
        <p>Кат-сцена</p>
        <h1>{shot.title}</h1>
      </div>

      <div className={sceneClassName} {...swipeHandlers} onClick={handleFrameClick}>
        {shot.scene === 'room' ? (
          <div className="pixel-room">
            <div className="room-bed">
              <PixelSprite hair={heroHair} label="Герой спит" outfit={heroOutfit} variant="hero" />
            </div>
            <div className="room-phone" />
            <div className="dust-particles" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}

        {shot.scene === 'phone' ? (
          <div className="phone-ui">
            <div className="phone-notch" />
            <div className="phone-status">09:17</div>
            <div className="phone-header">Женя</div>
            <div className="phone-notifications" aria-label="Уведомления от Жени">
              <div className="phone-notification phone-notification--one">
                <strong>Женя</strong>
                <span>Доброе утро :)</span>
              </div>
              <div className="phone-notification phone-notification--two">
                <strong>Женя</strong>
                <span>Как ты?</span>
              </div>
            </div>
          </div>
        ) : null}

        {shot.scene === 'mirror' ? (
          <div className="mirror-scene">
            <div className="mirror-panel">
              <PixelSprite active hair={heroHair} label="Герой у зеркала" outfit={heroOutfit} variant="hero" />
              <p className="mirror-goal">Выбери образ перед встречей с Женей</p>
            </div>
            <div className="style-panel">
              <span>одежда: {styleOptions[styleIndex].label}</span>
              <span>прическа: {hairOptions[hairIndex].label}</span>
              <p>Свайп влево/вправо меняет одежду</p>
              <p>Свайп вверх/вниз меняет прическу</p>
              <PixelButton
                onClick={goToNextShot}
                onPointerDown={(event) => {
                  event.stopPropagation()
                }}
              >
                ПРОДОЛЖИТЬ
              </PixelButton>
            </div>
          </div>
        ) : null}

        {shot.scene === 'road' ? <div className="road-parallax"><PixelSprite active hair={heroHair} label="Герой идет" outfit={heroOutfit} variant="hero" /></div> : null}
        {shot.scene === 'meeting' ? <div className="cutscene-meeting"><PixelSprite active hair={heroHair} label="Герой" outfit={heroOutfit} variant="hero" /><PixelSprite active label="Женя" variant="zhenya" /></div> : null}
        {shot.scene === 'montage' ? <div className="montage-grid"><span>смех</span><span>прогулка</span><span>ночной чат</span><span>руки</span><span>взгляд</span></div> : null}
        {shot.scene === 'dark' ? <div className="lonely-scene"><PixelSprite hair={heroHair} label="Герой" outfit={heroOutfit} variant="hero" /><div className="silent-phone" /></div> : null}
        {shot.scene === 'stars' ? <div className="stars-scene"><PixelSprite active hair={heroHair} label="Герой" outfit={heroOutfit} variant="hero" /><PixelSprite active label="Женя" variant="zhenya" /></div> : null}

        {shot.interactive !== 'style' ? (
          <div
            className="cutscene-text"
            onClick={(event) => {
              event.stopPropagation()
              next()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                next()
              }
            }}
            role="button"
            tabIndex={0}
          >
            {visibleLines.map((item, index) => (
              <div className="dialogue-line" key={`${item.speaker}-${item.text}-${index}`}>
                <strong>{item.speaker}</strong>
                <p className="typewriter-line">{item.text}</p>
              </div>
            ))}

            {shot.choices && choicesVisible ? (
              <div className="choice-row choice-row--inside">
                {shot.choices.map((choice) => (
                  <PixelButton
                    key={choice}
                    onClick={(event) => {
                      event.stopPropagation()
                      chooseReply(choice)
                    }}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                    }}
                    variant={selectedReply === choice ? 'primary' : 'ghost'}
                  >
                    {choice}
                  </PixelButton>
                ))}
              </div>
            ) : null}

            <span className="dialogue-next-arrow" aria-hidden="true">▼</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
