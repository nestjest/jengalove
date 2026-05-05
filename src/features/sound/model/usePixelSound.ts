import { useCallback, useEffect, useRef } from 'react'

type SoundName = 'click' | 'pickup' | 'hit' | 'success'

const notes = [261.63, 329.63, 392, 523.25, 392, 329.63]

export const usePixelSound = () => {
  const contextRef = useRef<AudioContext | null>(null)
  const musicTimerRef = useRef<number | null>(null)
  const stepRef = useRef(0)

  const getContext = useCallback(() => {
    if (!contextRef.current) {
      contextRef.current = new AudioContext()
    }

    return contextRef.current
  }, [])

  const tone = useCallback(
    (frequency: number, duration: number, type: OscillatorType, gain = 0.04) => {
      const context = getContext()
      const oscillator = context.createOscillator()
      const volume = context.createGain()
      const now = context.currentTime

      oscillator.frequency.setValueAtTime(frequency, now)
      oscillator.type = type
      volume.gain.setValueAtTime(gain, now)
      volume.gain.exponentialRampToValueAtTime(0.001, now + duration)
      oscillator.connect(volume)
      volume.connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + duration)
    },
    [getContext],
  )

  const play = useCallback(
    (name: SoundName) => {
      if (name === 'click') {
        tone(720, 0.05, 'square', 0.03)
      }

      if (name === 'pickup') {
        tone(660, 0.07, 'square', 0.04)
        window.setTimeout(() => tone(990, 0.08, 'square', 0.035), 70)
      }

      if (name === 'hit') {
        tone(120, 0.15, 'sawtooth', 0.05)
      }

      if (name === 'success') {
        tone(523.25, 0.08, 'square', 0.04)
        window.setTimeout(() => tone(659.25, 0.08, 'square', 0.04), 85)
        window.setTimeout(() => tone(783.99, 0.12, 'square', 0.04), 170)
      }
    },
    [tone],
  )

  const startMusic = useCallback(() => {
    const context = getContext()

    if (context.state === 'suspended') {
      void context.resume()
    }

    if (musicTimerRef.current !== null) {
      return
    }

    musicTimerRef.current = window.setInterval(() => {
      const note = notes[stepRef.current % notes.length]
      stepRef.current += 1
      tone(note, 0.12, 'triangle', 0.018)
    }, 360)
  }, [getContext, tone])

  const stopMusic = useCallback(() => {
    if (musicTimerRef.current !== null) {
      window.clearInterval(musicTimerRef.current)
      musicTimerRef.current = null
    }
  }, [])

  useEffect(() => stopMusic, [stopMusic])

  return { play, startMusic, stopMusic }
}
