import { Card, CardTitle, CardDescription } from './ui/card'
import { Music2 } from 'lucide-react'
import { useMusicPlayer } from '#/store/musicPlayer'

export function MusicCard() {
  const { queue: q } = useMusicPlayer()
  const s = q[0]

  if (q.length === 0) {
    return (
      <Card className="h-140 w-full max-w-lg flex-1 items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center">
        <Music2 className="mb-2 h-8 w-8 animate-pulse text-primary" />
        <CardTitle className="mb-1 font-bold">No Song Playing</CardTitle>
        <CardDescription>Search and add tracks to play</CardDescription>
      </Card>
    )
  }

  return (
    <Card
      className="relative h-140 w-full max-w-lg flex-1 rounded-3xl border bg-contain bg-center bg-no-repeat p-6 text-left shadow-2xl"
      style={{ backgroundImage: `url(${s.thumbnailUrl})` }}
    >
      <div className="relative z-10 flex h-full w-full flex-col justify-between gap-8">
        <div className="flex w-fit max-w-full items-center gap-3 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-md">
          <img
            src={s.thumbnailUrl}
            alt={s.uploader}
            className="h-8 w-8 shrink-0 rounded-full border border-white/20 object-cover shadow-md "
          />
          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-bold text-white leading-tight truncate">
              {s.uploader}
            </span>
            <span className="text-[9px] text-white/60">Now Playing</span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
          <h2 className="text-xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
            {s.title}
          </h2>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-white/70">
            Streaming live from JAM music network. Duration:{' '}
            {Math.floor(s.duration / 60)}m {s.duration % 60}s. Enjoy
            high-fidelity audio playback.
          </p>
        </div>
      </div>
    </Card>
  )
}
