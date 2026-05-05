import { levelOrder, levelTitles } from '../../../entities/game/model/content'
import type { GameProgress } from '../../../entities/game/model/types'

type GameHudProps = {
  progress: GameProgress
}

export const GameHud = ({ progress }: GameHudProps) => (
  <aside className="game-hud" aria-label="Прогресс">
    <div className="hud-meter">
      <span className="hud-icon" aria-hidden="true">
        ❤️
      </span>
      <div className="hud-bar" aria-label={`Любовь ${progress.love} из 100`}>
        <span style={{ width: `${progress.love}%` }} />
      </div>
      <strong>{progress.love}</strong>
    </div>

    <div className="hud-fragments">
      <span className="hud-icon" aria-hidden="true">
        💎
      </span>
      <div className="fragment-row">
        {levelOrder.map((level) => (
          <span
            className={progress.fragments.includes(level) ? 'is-filled' : ''}
            key={level}
            title={levelTitles[level]}
          />
        ))}
      </div>
    </div>
  </aside>
)
