import { PixelButton } from '../../../shared/ui/PixelButton'

type StartPageProps = {
  onStart: () => void
}

export const StartPage = ({ onStart }: StartPageProps) => (
  <section className="start-screen page-fade">
    <div className="start-heart" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
    <div className="start-city" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
    <div className="start-copy">
      <p className="press-start">PRESS START</p>
      <h1 className="typewriter">Это история про тебя... Женя ❤️</h1>
      <PixelButton className="start-button" onClick={onStart}>
        НАЧАТЬ
      </PixelButton>
    </div>
  </section>
)
