import { useEffect, useMemo, useState } from 'react'
import { useSwipeControls } from '../../../shared/lib/useSwipeControls'
import { PixelButton } from '../../../shared/ui/PixelButton'
import { PixelSprite } from '../../../shared/ui/PixelSprite'
import type { Direction } from '../../../entities/game/model/types'

type CutsceneVariant =
  | 'intro'
  | 'firstMeeting'
  | 'moments'
  | 'realization'
  | 'climax'

type CutscenePageProps = {
  variant: CutsceneVariant
  onComplete: () => void
  onSound: (name: 'click' | 'pickup' | 'success') => void
}

type DialogueLine = {
  speaker: 'Текст' | 'Женя' | 'Я'
  text: string
}

type Shot = {
  title: string
  lines: DialogueLine[]
  scene: 'room' | 'phone' | 'mirror' | 'road' | 'meeting' | 'montage' | 'dark' | 'stars'
  choices?: string[]
  interactive?: 'style'
}

const line = (speaker: DialogueLine['speaker'], text: string): DialogueLine => ({
  speaker,
  text,
})

const shotsByVariant: Record<CutsceneVariant, Shot[]> = {
  intro: [
    {
      title: 'Пробуждение',
      lines: [line('Текст', 'Обычное утро...')],
      scene: 'room',
    },
    {
      title: 'Телефон',
      lines: [
        line('Текст', '...но что-то изменилось'),
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
      lines: [
        line('Текст', 'Женя стояла спиной'),
        line('Текст', 'Я подошел ближе'),
      ],
      scene: 'meeting',
    },
    {
      title: 'Момент',
      lines: [
        line('Женя', 'Привет...'),
        line('Я', 'Привет'),
        line('Текст', 'И все стало... другим'),
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
        line('Текст', 'Каждый момент...'),
        line('Текст', 'становился важнее предыдущего'),
      ],
      scene: 'montage',
    },
  ],
  realization: [
    {
      title: 'Осознание',
      lines: [
        line('Текст', 'И тогда я понял...'),
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

export const CutscenePage = ({ variant, onComplete, onSound }: CutscenePageProps) => {
  const shots = shotsByVariant[variant]
  const [shotIndex, setShotIndex] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [selectedReply, setSelectedReply] = useState('')
  const [styleIndex, setStyleIndex] = useState(0)
  const [hairIndex, setHairIndex] = useState(0)
  const shot = shots[shotIndex]
  const visibleLines = shot.lines.slice(0, lineIndex + 1)
  const choicesVisible = Boolean(shot.choices && lineIndex >= shot.lines.length - 1)
  const canContinue = !shot.choices || selectedReply.length > 0

  useEffect(() => {
    setLineIndex(0)
    setSelectedReply('')
  }, [shotIndex])

  const sceneClassName = useMemo(
    () => `cutscene-frame cutscene-frame--${shot.scene}`,
    [shot.scene],
  )

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

    onSound(shotIndex === shots.length - 1 ? 'success' : 'click')

    if (shotIndex === shots.length - 1) {
      onComplete()
      return
    }

    setShotIndex((current) => current + 1)
  }

  const changeStyle = (direction: Direction) => {
    if (shot.interactive !== 'style') {
      return
    }

    if (direction === 'left' || direction === 'right') {
      setStyleIndex((current) =>
        direction === 'right'
          ? (current + 1) % styleOptions.length
          : (current + styleOptions.length - 1) % styleOptions.length,
      )
    }

    if (direction === 'up' || direction === 'down') {
      setHairIndex((current) =>
        direction === 'down'
          ? (current + 1) % hairOptions.length
          : (current + hairOptions.length - 1) % hairOptions.length,
      )
    }

    onSound('click')
  }

  const swipeHandlers = useSwipeControls(changeStyle)
  const heroOutfit = styleOptions[styleIndex].outfit
  const heroHair = hairOptions[hairIndex].hair

  return (
    <section className="cutscene-page page-fade">
      <div className="level-heading">
        <p>Кат-сцена</p>
        <h1>{shot.title}</h1>
      </div>

      <div className={sceneClassName} {...swipeHandlers}>
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
            <div className="phone-header">Женя ❤️</div>
            <div className="phone-message"><strong>Женя:</strong> Доброе утро :)</div>
            <div className="phone-message"><strong>Женя:</strong> Как ты?</div>
            {selectedReply ? <div className="phone-message is-player"><strong>Я:</strong> {selectedReply}</div> : null}
            {selectedReply ? <div className="phone-message"><strong>Женя:</strong> Хаха :) Давай увидимся?</div> : null}
          </div>
        ) : null}

        {shot.scene === 'mirror' ? (
          <div className="mirror-scene">
            <div className="mirror-panel">
              <PixelSprite
                active
                hair={heroHair}
                label="Герой у зеркала"
                outfit={heroOutfit}
                variant="hero"
              />
            </div>
            <div className="style-panel">
              <span>одежда: {styleOptions[styleIndex].label}</span>
              <span>прическа: {hairOptions[hairIndex].label}</span>
            </div>
          </div>
        ) : null}

        {shot.scene === 'road' ? <div className="road-parallax"><PixelSprite active hair={heroHair} label="Герой идет" outfit={heroOutfit} variant="hero" /></div> : null}
        {shot.scene === 'meeting' ? <div className="cutscene-meeting"><PixelSprite active hair={heroHair} label="Герой" outfit={heroOutfit} variant="hero" /><PixelSprite active label="Женя" variant="zhenya" /></div> : null}
        {shot.scene === 'montage' ? <div className="montage-grid"><span>смех</span><span>прогулка</span><span>ночной чат</span><span>руки</span><span>взгляд</span></div> : null}
        {shot.scene === 'dark' ? <div className="lonely-scene"><PixelSprite hair={heroHair} label="Герой" outfit={heroOutfit} variant="hero" /><div className="silent-phone" /></div> : null}
        {shot.scene === 'stars' ? <div className="stars-scene"><PixelSprite active hair={heroHair} label="Герой" outfit={heroOutfit} variant="hero" /><PixelSprite active label="Женя" variant="zhenya" /></div> : null}

        <div className="cutscene-text">
          {visibleLines.map((item, index) => (
            <div className="dialogue-line" key={`${item.speaker}-${item.text}-${index}`}>
              <strong>{item.speaker}</strong>
              <p className="typewriter-line">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {shot.choices && choicesVisible ? (
        <div className="choice-row">
          {shot.choices.map((choice) => (
            <PixelButton
              key={choice}
              onClick={() => {
                setSelectedReply(choice)
                onSound('click')
              }}
              variant={selectedReply === choice ? 'primary' : 'ghost'}
            >
              {choice}
            </PixelButton>
          ))}
        </div>
      ) : null}

      <div className="level-panel">
        {shot.interactive === 'style' ? (
          <p className="meeting-help">Свайп: влево/вправо одежда, вверх/вниз прическа</p>
        ) : null}
        <PixelButton disabled={!canContinue} onClick={next}>
          {shotIndex === shots.length - 1 && lineIndex === shot.lines.length - 1
            ? 'ДАЛЬШЕ'
            : 'ПРОДОЛЖИТЬ'}
        </PixelButton>
      </div>
    </section>
  )
}
