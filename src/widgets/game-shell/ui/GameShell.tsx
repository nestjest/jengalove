import type { PropsWithChildren } from 'react'
import type { GameProgress, SceneKey } from '../../../entities/game/model/types'
import { GameHud } from '../../hud/ui/GameHud'
import { PixelButton } from '../../../shared/ui/PixelButton'

type GameShellProps = PropsWithChildren<{
  progress: GameProgress
  scene: SceneKey
  onReset: () => void
  shaking?: boolean
}>

export const GameShell = ({
  children,
  progress,
  scene,
  onReset,
  shaking = false,
}: GameShellProps) => (
  <main className={`game-shell ${scene === 'start' ? 'is-start-scene' : ''} ${shaking ? 'is-shaking' : ''}`}>
    <div className="scanline" aria-hidden="true" />
    <div className="pixel-particles" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
    {scene !== 'start' ? (
      <div className="game-topbar">
        <GameHud progress={progress} />
        <PixelButton aria-label="Сбросить прогресс" onClick={onReset} variant="ghost">
          RESET
        </PixelButton>
      </div>
    ) : null}
    {children}
  </main>
)
