import { useMusicPlayer } from '#/store/musicPlayer'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { getStreamUrl } from '#/utils/api'
import { toast } from 'sonner'
import { TrackInfo } from './TrackInfo'

export function MusicController() {
  const { queue: q, history: hist, popFromQueue, playPrevious } = useMusicPlayer()
  const s = q[0]
  const hasTrack = q.length > 0
  const hasHistory = hist.length > 0

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 jam-card px-4 py-3 sm:px-5 sm:py-2.5">
      <div className="w-full sm:w-64 shrink-0 flex justify-center sm:justify-start">
        <TrackInfo s={hasTrack ? s : undefined} />
      </div>

      <div className="flex-1 w-full max-w-md">
        <div className={!hasTrack && !hasHistory ? 'hidden' : 'block'}>
          <AudioPlayer
            className="[&_.rhap_volume-controls]:hidden sm:[&_.rhap_volume-controls]:flex [&_.rhap_main-controls]:w-full [&_.rhap_main-controls]:justify-center"
            src={hasTrack ? getStreamUrl(s.id) : ''}
            autoPlay
            showSkipControls
            showJumpControls={false}
            onClickNext={hasTrack ? popFromQueue : undefined}
            onClickPrevious={() => hasHistory && playPrevious()}
            onEnded={hasTrack ? popFromQueue : undefined}
            onError={() => {
              if (hasTrack) {
                toast.error(`Unable to stream "${s.title}"`, {
                  description: 'Skipping to next available track in queue...',
                })
                popFromQueue()
              }
            }}
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
