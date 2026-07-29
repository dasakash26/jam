import { Card, CardHeader, CardTitle } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { ListMusic, Trash2 } from 'lucide-react'
import { useMusicPlayer } from '#/store/musicPlayer'
import type { Music } from '#/types'
import { QItemCard } from './QItemCard'

const EmptyQ = () => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8">
    <ListMusic className="text-muted-foreground/40" />
    <CardTitle className="text-sm text-muted-foreground">Queue is empty</CardTitle>
  </div>
)

export function QueueCard() {
  const { queue: q, history: hist, clearQueue, clearHistory } = useMusicPlayer()
  const upcoming = q.slice(1)
  const current = q[0]
  const hasContent = hist.length > 0 || q.length > 0

  return (
    <Card className="flex flex-col flex-1 h-full min-h-[40vh] sm:min-h-0 w-full max-w-lg jam-card jam-card-hover">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <ListMusic className="h-4 w-4 text-muted-foreground" />
          Queue
        </CardTitle>
        {q.length > 1 && (
          <button
            onClick={clearQueue}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer p-1.5 sm:p-0 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Trash2 className="h-3 w-3" />
            Clear Queue
          </button>
        )}
      </CardHeader>
      <ScrollArea className="flex-1 min-h-0 pb-6 max-h-[55vh] sm:max-h-none">
        <div className="flex flex-col gap-6 px-4 sm:px-6">
          {!hasContent ? (
            <EmptyQ />
          ) : (
            <>
              {hist.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      History
                    </h3>
                    <button
                      onClick={clearHistory}
                      className="text-xs sm:text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1.5 sm:p-0 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      Clear
                    </button>
                  </div>
                  {hist.slice(-3).map((song: Music, idx: number) => (
                    <QItemCard key={`hist-${song.id}-${idx}`} song={song} isHistory />
                  ))}
                </div>
              )}

              {q.length > 0 && current && (
                <div className="flex flex-col gap-1.5 p-2 sm:p-1.5 rounded-xl bg-muted/40 border border-border/50">
                  <div className="flex items-center gap-2 px-2.5 pt-1 sm:pt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-sm sm:text-xs font-semibold text-foreground">
                      Now Playing
                    </h3>
                  </div>
                  <QItemCard song={current} isCurrent queueIndex={0} />
                </div>
              )}

              {upcoming.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <h3 className="px-1 text-xs sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Upcoming ({upcoming.length})
                  </h3>
                  {upcoming.map((song: Music, idx: number) => (
                    <QItemCard key={`${song.id}-${idx}`} song={song} canRemove queueIndex={idx + 1} />
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
