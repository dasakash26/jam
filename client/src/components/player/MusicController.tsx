import { useRef, useState, useEffect } from 'react'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { getStreamUrl } from '#/utils/api'
import { toast } from 'sonner'
import { TrackInfo } from './TrackInfo'
import type { Music } from '#/types'
import { useWakeLock } from '#/hooks/WakeLock'

interface MusicControllerProps {
  currentSong?: Music
  hasHistory: boolean
  targetSeekTime?: number
  isPlaying?: boolean
  onNext?: () => void
  onPrevious?: () => void
  onSeek?: (seekTime: number) => void
  onPlayPause?: (isPlaying: boolean) => void
  onError?: () => void
}

const IGNORE_LAG_DELTA = 0.3
const SEEK_LOCK_INTERVAL = 0.5

export function MusicController({
  currentSong: s,
  hasHistory,
  targetSeekTime,
  isPlaying,
  onNext,
  onPrevious,
  onSeek,
  onPlayPause,
  onError,
}: MusicControllerProps) {
  const hasTrack = !!s
  const playerRef = useRef<AudioPlayer>(null)
  const isSeekingRef = useRef(false)
  const lastSeekedAt = useRef<number | null>(null)
  const retryCountRef = useRef(0)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [streamSrc, setStreamSrc] = useState('')

  useWakeLock(isPlaying)

  useEffect(() => {
    retryCountRef.current = 0
    setStreamSrc(s ? getStreamUrl(s.id) : '')
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [s?.id])

  useEffect(() => {
    const player = playerRef.current
    if (!player || targetSeekTime == undefined) return

    const audio = player.audio.current
    const lagTime = audio.currentTime - targetSeekTime

    console.log('[audio sync] ', lagTime)
    if (Math.abs(lagTime) > IGNORE_LAG_DELTA && !isSeekingRef.current) {
      audio.currentTime = targetSeekTime
    }
  }, [targetSeekTime])

  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    const audio = player.audio.current

    let cleanupListeners: (() => void) | null = null

    if (audio.paused && isPlaying) {
      audio.play().catch((err: DOMException) => {
        if (err.name === 'NotAllowedError') {
          const resumeAudio = () => {
            if (audio.paused) {
              audio.play().catch(() => {})
            }
            cleanupListeners?.()
          }

          cleanupListeners = () => {
            window.removeEventListener('click', resumeAudio)
            window.removeEventListener('touchstart', resumeAudio)
            window.removeEventListener('keydown', resumeAudio)
          }

          window.addEventListener('click', resumeAudio)
          window.addEventListener('touchstart', resumeAudio)
          window.addEventListener('keydown', resumeAudio)
        }
      })
    } else if (!audio.paused && !isPlaying) {
      audio.pause()
    }

    return () => {
      cleanupListeners?.()
    }
  }, [isPlaying])

  const handleAudioError = () => {
    if (!s) return

    if (retryCountRef.current < 5) {
      retryCountRef.current += 1
      const delayMs = Math.pow(2, retryCountRef.current - 1) * 1000
      toast.warning(`Retrying playback for "${s.title}"`, {
        description: `Attempt ${retryCountRef.current} of 3 failed. Retrying in ${delayMs / 1000}s...`,
      })

      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = setTimeout(() => {
        setStreamSrc(`${getStreamUrl(s.id)}?retry=${Date.now()}`)
      }, delayMs)
    } else {
      toast.error('Audio Stream Failed', {
        description: `Unable to stream "${s.title}". The audio stream link expired or upstream server returned an error. Skipping track...`,
      })
      onError?.()
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 jam-card rounded-2xl sm:rounded-full px-4 py-3 sm:px-6 sm:py-2">
      <div className="w-full sm:w-64 shrink-0 flex justify-center sm:justify-start">
        <TrackInfo s={hasTrack ? s : undefined} />
      </div>

      <div className="flex-1 w-full max-w-md">
        <div className={!hasTrack && !hasHistory ? 'hidden' : 'block'}>
          <AudioPlayer
            ref={playerRef}
            className="[&_.rhap_volume-controls]:hidden sm:[&_.rhap_volume-controls]:flex [&_.rhap_main-controls]:w-full [&_.rhap_main-controls]:justify-center"
            src={streamSrc || undefined}
            autoPlay
            showSkipControls
            showJumpControls={false}
            onClickNext={hasTrack ? onNext : undefined}
            onClickPrevious={hasHistory ? onPrevious : undefined}
            onEnded={hasTrack ? onNext : undefined}
            onSeeking={() => {
              isSeekingRef.current = true
            }}
            onSeeked={(e) => {
              isSeekingRef.current = false
              if (lastSeekedAt.current) {
                const delayS = (Date.now() - lastSeekedAt.current) / 1000
                if (delayS <= SEEK_LOCK_INTERVAL) return
              }

              onSeek?.((e.target as HTMLAudioElement).currentTime)
              lastSeekedAt.current = Date.now()
            }}
            onPlay={() => onPlayPause?.(true)}
            onPause={() => onPlayPause?.(false)}
            onError={handleAudioError}
          />
        </div>
        {!hasTrack && !hasHistory && (
          <div className="py-2 text-center text-xs text-muted-foreground">
            No track playing
          </div>
        )}
      </div>
    </div>
  )
}
