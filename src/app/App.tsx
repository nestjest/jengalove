import { useState } from 'react'
import { ConfessionPage } from '../pages/confession/ui/ConfessionPage'
import { CutscenePage } from '../pages/cutscene/ui/CutscenePage'
import { FinalPage } from '../pages/final/ui/FinalPage'
import { MeetingPage } from '../pages/meeting/ui/MeetingPage'
import { MomentsPage } from '../pages/moments/ui/MomentsPage'
import { StartPage } from '../pages/start/ui/StartPage'
import { TrialsPage } from '../pages/trials/ui/TrialsPage'
import { WhyPage } from '../pages/why/ui/WhyPage'
import { useGameProgress } from '../features/progress/model/useGameProgress'
import { usePixelSound } from '../features/sound/model/usePixelSound'
import { GameShell } from '../widgets/game-shell/ui/GameShell'
import './styles/index.css'

export const App = () => {
  const game = useGameProgress()
  const sound = usePixelSound()
  const [shaking, setShaking] = useState(false)

  const triggerShake = () => {
    setShaking(true)
    window.setTimeout(() => setShaking(false), 420)
  }

  const startGame = () => {
    sound.startMusic()
    sound.play('click')
    game.goToScene('introCutscene')
  }

  const scene = game.progress.currentScene

  return (
    <GameShell
      onReset={() => {
        sound.play('click')
        game.resetProgress()
      }}
      progress={game.progress}
      scene={scene}
      shaking={shaking}
    >
      {scene === 'start' ? <StartPage onStart={startGame} /> : null}

      {scene === 'introCutscene' ? (
        <CutscenePage
          onComplete={() => game.goToScene('meeting')}
          onSound={sound.play}
          variant="intro"
        />
      ) : null}

      {scene === 'meeting' ? (
        <MeetingPage
          onComplete={() => game.completeLevel('meeting')}
          onItemFound={game.collectMeetingItem}
          onSound={sound.play}
          progress={game.progress}
        />
      ) : null}

      {scene === 'firstMeetingCutscene' ? (
        <CutscenePage
          onComplete={() => game.goToScene('moments')}
          onSound={sound.play}
          variant="firstMeeting"
        />
      ) : null}

      {scene === 'moments' ? (
        <MomentsPage
          onComplete={() => game.completeLevel('moments')}
          onPairMatched={game.matchMemoryPair}
          onSound={sound.play}
          progress={game.progress}
        />
      ) : null}

      {scene === 'momentsCutscene' ? (
        <CutscenePage
          onComplete={() => game.goToScene('trials')}
          onSound={sound.play}
          variant="moments"
        />
      ) : null}

      {scene === 'trials' ? (
        <TrialsPage
          onComplete={() => game.completeLevel('trials')}
          onLoveChange={game.changeLove}
          onShake={triggerShake}
          onSound={sound.play}
        />
      ) : null}

      {scene === 'realizationCutscene' ? (
        <CutscenePage
          onComplete={() => game.goToScene('why')}
          onSound={sound.play}
          variant="realization"
        />
      ) : null}

      {scene === 'why' ? (
        <WhyPage
          onComplete={() => game.completeLevel('why')}
          onSound={sound.play}
          onWordCollect={game.collectWord}
          progress={game.progress}
        />
      ) : null}

      {scene === 'confession' ? (
        <ConfessionPage
          onComplete={() => game.completeLevel('confession')}
          onSolved={game.solveConfession}
          onSound={sound.play}
          progress={game.progress}
        />
      ) : null}

      {scene === 'climaxCutscene' ? (
        <CutscenePage
          onComplete={() => game.goToScene('final')}
          onSound={sound.play}
          variant="climax"
        />
      ) : null}

      {scene === 'final' ? (
        <FinalPage
          onOpen={game.openFinalVideo}
          onSound={sound.play}
          progress={game.progress}
        />
      ) : null}
    </GameShell>
  )
}
