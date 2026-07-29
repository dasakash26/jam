import { Card, CardTitle, CardDescription } from './ui/card'
import { Music2 } from 'lucide-react'
import { useMusicPlayer } from '#/store/musicPlayer'

export function MusicCard() {
  const { queue: q, isLoading } = useMusicPlayer()
  const s = q[0]

  if (isLoading && q.length === 0) {
    return <MusicCardSkeleton />
  }

  if (!s || q.length === 0) {
    return (
      <Card className="flex flex-col flex-1 h-full min-h-0 w-full max-w-lg items-center justify-center jam-card jam-card-hover">
        <Music2 className="mb-2 h-6 w-6 text-muted-foreground/60" />
        <CardTitle className="mb-1 text-sm font-medium text-foreground">No Song Playing</CardTitle>
        <CardDescription className="text-xs">Search and add tracks to play</CardDescription>
      </Card>
    )
  }

  return (
    <Card className="flex flex-1 h-full min-h-0 w-full max-w-lg flex-col overflow-hidden jam-card jam-card-hover">
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <img
          src={s.thumbnailUrl}
          alt={s.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />

        <div className="absolute left-4 top-4 z-10 flex w-fit max-w-[calc(100%-2rem)] items-center gap-2.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1.5 backdrop-blur-md shadow-xs">
          <img
            src={s.thumbnailUrl}
            alt={s.uploader}
            className="h-7 w-7 shrink-0 rounded-full border border-border/50 object-cover"
          />
          <div className="flex min-w-0 flex-col pr-1.5">
            <span className="truncate text-xs font-medium leading-none text-foreground">
              {s.uploader}
            </span>
            <span className="mt-1 text-[10px] font-medium leading-none text-muted-foreground">
              Now Playing
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-1.5 border-t border-border/50 bg-card/85 p-5 backdrop-blur-md">
        <h2 className="line-clamp-1 text-base font-semibold tracking-tight text-foreground">
          {s.title}
        </h2>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          Streaming live from JAM music network. Duration:{' '}
          {Math.floor(s.duration / 60)}m {s.duration % 60}s.
        </p>
      </div>
    </Card>
  )
}

export function MusicCardSkeleton() {
  return (
    <Card className="flex flex-1 h-full min-h-0 w-full max-w-lg flex-col overflow-hidden jam-card">
      <div className="flex-1 min-h-0 bg-muted/60 animate-pulse" />
      <div className="flex flex-col gap-2 border-t border-border/50 bg-card/85 p-5">
        <div className="h-4 w-3/4 rounded bg-muted/60 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-muted/40 animate-pulse" />
      </div>
    </Card>
  )
}
