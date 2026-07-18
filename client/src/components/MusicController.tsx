import { useMusicPlayer } from '#/store/musicPlayer'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { getStreamUrl } from '#/utils/api'
import type { Music } from '#/types'

const TrackInfo = ({ s }: { s?: Music }) => (
  <div className="flex items-center gap-3 overflow-hidden">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-xs text-muted-foreground">
      {s ? (
        <img
          src={s.thumbnailUrl}
          alt={s.title}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span className="text-base">♫</span>
      )}
    </div>
    <div className="grid truncate text-left text-xs">
      <span className="truncate font-semibold leading-tight text-foreground">
        {s ? s.title : 'No Track Selected'}
      </span>
      <span className="text-[10px] text-muted-foreground truncate">
        {s ? s.uploader : '—'}
      </span>
    </div>
  </div>
)

export function MusicController() {
  const {
    queue: q,
    history: hist,
    popFromQueue,
    playPrevious,
  } = useMusicPlayer()
  const s = q[0]
  const hasTrack = q.length > 0
  const hasHistory = hist.length > 0

  return (
    <div className="mx-auto flex w-full max-w-4xl shrink-0 items-center justify-between gap-6 rounded-full border-[0.05rem] px-6 py-3 shadow-xl">
      <div className="min-w-0 w-64 shrink-0">
        <TrackInfo s={hasTrack ? s : undefined} />
      </div>

      <div className="flex-1 max-w-md">
        {hasTrack ? (
          <AudioPlayer
            src={getStreamUrl(s.id)}
            autoPlay={true}
            showSkipControls={true}
            showJumpControls={false}
            onClickNext={() => popFromQueue()}
            onClickPrevious={() => {
              if (hasHistory) {
                playPrevious()
              }
            }}
            onEnded={() => popFromQueue()}
          />
        ) : (
          <div className="py-2 text-center text-xs text-muted-foreground">
            No track playing
          </div>
        )}
      </div>

      <div className="w-24 shrink-0" />
    </div>
  )
}
