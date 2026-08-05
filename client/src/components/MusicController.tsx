import { useRef, useState, useEffect } from 'react'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { getStreamUrl } from '#/utils/api'
import { toast } from 'sonner'
import { TrackInfo } from './TrackInfo'
import type { Music } from '#/types'

interface MusicControllerProps {
  currentSong?: Music
  hasHistory: boolean
  onNext?: () => void
  onPrevious?: () => void
  onError?: () => void
}

export function MusicController({
  currentSong: s,
  hasHistory,
  onNext,
  onPrevious,
  onError,
}: MusicControllerProps) {
  const hasTrack = !!s
  const retryCountRef = useRef(0)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [streamSrc, setStreamSrc] = useState('')

  useEffect(() => {
    retryCountRef.current = 0
    setStreamSrc(s ? getStreamUrl(s.id) : '')
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [s?.id])

  const handleAudioError = () => {
    if (!s) return

    if (retryCountRef.current < 3) {
      retryCountRef.current += 1
      const delayMs = Math.pow(2, retryCountRef.current - 1) * 1000 
      toast.warning(`Retrying playback for "${s.title}" (Attempt ${retryCountRef.current}/3)...`)
      
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = setTimeout(() => {
        setStreamSrc(`${getStreamUrl(s.id)}?retry=${Date.now()}`)
      }, delayMs)
    } else {
      toast.error(`Unable to stream "${s.title}" after retries.`)
      onError?.()
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 jam-card px-4 py-3 sm:px-5 sm:py-2.5">
      <div className="w-full sm:w-64 shrink-0 flex justify-center sm:justify-start">
        <TrackInfo s={hasTrack ? s : undefined} />
      </div>

      <div className="flex-1 w-full max-w-md">
        <div className={!hasTrack && !hasHistory ? 'hidden' : 'block'}>
          <AudioPlayer
            className="[&_.rhap_volume-controls]:hidden sm:[&_.rhap_volume-controls]:flex [&_.rhap_main-controls]:w-full [&_.rhap_main-controls]:justify-center"
            src={streamSrc}
            autoPlay
            showSkipControls
            showJumpControls={false}
            onClickNext={hasTrack ? onNext : undefined}
            onClickPrevious={hasHistory ? onPrevious : undefined}
            onEnded={hasTrack ? onNext : undefined}
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

