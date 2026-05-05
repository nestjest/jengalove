import { useEffect, useMemo, useRef, useState } from 'react'
import { memoryCards } from '../../../entities/game/model/content'
import type { GameProgress } from '../../../entities/game/model/types'
import { PixelButton } from '../../../shared/ui/PixelButton'

type MomentsPageProps = {
  progress: GameProgress
  onPairMatched: (pairId: string) => void
  onComplete: () => void
  onSound: (name: 'click' | 'pickup' | 'success') => void
}

type Card = {
  id: string
  pairId: string
  title: string
  symbol: string
  image?: string
}

const shuffle = <T,>(items: T[]) =>
  [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item)

export const MomentsPage = ({
  progress,
  onPairMatched,
  onComplete,
  onSound,
}: MomentsPageProps) => {
  const timeoutRef = useRef<number | null>(null)
  const [openCards, setOpenCards] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const cards = useMemo<Card[]>(
    () =>
      shuffle(
        memoryCards.flatMap((card) => [
          { ...card, id: `${card.pairId}-a` },
          { ...card, id: `${card.pairId}-b` },
        ]),
      ),
    [],
  )

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    },
    [],
  )

  const matchedPairs = progress.matchedMemoryPairs
  const allMatched = matchedPairs.length >= memoryCards.length

  const openCard = (card: Card) => {
    if (openCards.includes(card.id) || matchedPairs.includes(card.pairId)) {
      return
    }

    onSound('click')

    const nextOpenCards = [...openCards, card.id]
    setOpenCards(nextOpenCards)

    if (nextOpenCards.length !== 2) {
      return
    }

    const [firstCardId] = nextOpenCards
    const firstCard = cards.find((item) => item.id === firstCardId)

    if (!firstCard) {
      setOpenCards([])
      return
    }

    if (firstCard.pairId === card.pairId) {
      timeoutRef.current = window.setTimeout(() => {
        onSound('pickup')
        onPairMatched(card.pairId)
        setMessage('Помнишь это?')
        setOpenCards([])
      }, 420)
      return
    }

    timeoutRef.current = window.setTimeout(() => {
      setOpenCards([])
      setMessage('')
    }, 720)
  }

  return (
    <section className="level-page page-fade">
      <div className="level-heading">
        <p>Уровень 2</p>
        <h1>Наши моменты</h1>
      </div>

      <div className="memory-grid" aria-label="Карточки воспоминаний">
        {cards.map((card) => {
          const isOpen = openCards.includes(card.id) || matchedPairs.includes(card.pairId)

          return (
            <button
              aria-label={isOpen ? card.title : 'Закрытая карточка'}
              className={`memory-card ${isOpen ? 'is-open' : ''}`}
              key={card.id}
              onClick={() => openCard(card)}
              type="button"
            >
              <span className="memory-card-back">?</span>
              <span className="memory-card-front">
                {card.image ? (
                  <img alt={card.title} src={card.image} />
                ) : (
                  <span className="memory-symbol">{card.symbol}</span>
                )}
                <strong>{card.title}</strong>
              </span>
            </button>
          )
        })}
      </div>

      <div className="level-panel">
        <p className="match-message">{message || `${matchedPairs.length}/4`}</p>
        <PixelButton
          disabled={!allMatched}
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
