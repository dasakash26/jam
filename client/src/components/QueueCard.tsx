import { Card, CardHeader, CardTitle } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { ListMusic } from 'lucide-react'
import { useMusicPlayer } from '#/store/musicPlayer'
import type { Music } from '#/types'
import { Button } from '@base-ui/react'

const EmptyQ = () => (
  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6">
    <ListMusic className="mb-2 text-muted-foreground/40" />
    <CardTitle className="text-sm font-semibold">Queue is empty</CardTitle>
  </div>
)

const formatDuration = (time: number) => {
  if (isNaN(time)) return '00:00'
  const mins = Math.floor(time / 60)
  const secs = Math.floor(time % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function QueueCard() {
  const { queue: q, history: hist } = useMusicPlayer()
  const upcoming = q.slice(1)
  const current = q[0]
  const hasContent = hist.length > 0 || q.length > 0

  return (
    <Card className="h-140 min-h-0 w-full max-w-lg flex-1 rounded-3xl">
      <CardHeader className="border-b py-4">
        <CardTitle className="flex items-center gap-2 font-bold tracking-wider text-foreground">
          <ListMusic className="h-4 w-4 text-primary" />
          Queue
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1 min-h-0 pb-6">
        <div className="flex flex-col gap-6 px-6 pt-4">
          {!hasContent ? (
            <EmptyQ />
          ) : (
            <>
              {/* History Section */}
              {hist.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    History
                  </h3>
                  {hist.map((song: Music, i: number) => (
                    <QMusicCard key={`queue-${i}-${song.id}`} song={song} />
                  ))}
                </div>
              )}

              {/* Now Playing Section */}
              {q.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="px-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Now Playing
                  </h3>
                  <QMusicCard key="current" song={current} />
                </div>
              )}

              {/* Upcoming Section */}
              {upcoming.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Upcoming
                  </h3>
                  {upcoming.map((song: Music, i: number) => (
                    <QMusicCard key={`queue-${i}-${song.id}`} song={song} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}

function QMusicCard({ key, song }: { key: string; song: Music }) {
  const { pushToQueue } = useMusicPlayer()
  return (
    <div
      key={key}
      className="flex items-center justify-between gap-4 rounded-lg p-2"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          className="cursor-pointer"
          onClick={() => {
            pushToQueue(song)
          }}
        >
          <img
            src={song.thumbnailUrl}
            alt={song.title}
            className="h-9 w-9 shrink-0 rounded-lg object-cover shadow-sm"
          />
        </Button>

        <div className="min-w-0 flex-1 text-left">
          <h4 className="truncate text-xs font-semibold text-foreground">
            {song.title}
          </h4>
          <p className="text-[10px] text-muted-foreground truncate">
            {song.uploader}
          </p>
        </div>
      </div>
      <span className="shrink-0 select-none pr-1 text-[10px] text-muted-foreground">
        {formatDuration(song.duration)}
      </span>
    </div>
  )
}
