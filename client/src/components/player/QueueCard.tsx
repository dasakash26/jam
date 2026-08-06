import { Card, CardHeader, CardTitle } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'
import { ListMusic, Trash2 } from 'lucide-react'
import type { Music, QueueItem } from '#/types'
import { QItemCard } from './QItemCard'

interface QueueCardProps {
  queue: QueueItem[]
  history: QueueItem[]
  onClearQueue?: () => void
  onClearHistory?: () => void
  onRemoveFromQueue?: (queueItemId: string) => void
  onAddToQueue: (song: Music) => void
  onPlayNext?: (song: Music) => void
}

const EmptyQ = () => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8">
    <ListMusic className="text-muted-foreground/40" />
    <CardTitle className="text-sm text-muted-foreground">Queue is empty</CardTitle>
  </div>
)

export function QueueCard({
  queue: q,
  history: hist,
  onClearQueue,
  onClearHistory,
  onRemoveFromQueue,
  onAddToQueue,
  onPlayNext,
}: QueueCardProps) {
  const upcoming = q.slice(1)
  const current = q.length ? q[0] : null
  const hasContent = hist.length > 0 || q.length > 0

  return (
    <Card className="flex flex-col flex-1 h-full min-h-[420px] sm:min-h-0 w-full max-w-lg overflow-hidden jam-card jam-card-hover">
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3 sm:py-2.5 sm:px-4 shrink-0 border-b border-border/40">
        <CardTitle className="flex items-center gap-2 text-foreground text-xs sm:text-sm font-bold">
          <ListMusic className="h-3.5 w-3.5 text-primary" />
          Queue
        </CardTitle>
        {q.length > 1 && onClearQueue && (
          <button
            onClick={onClearQueue}
            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer p-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Trash2 className="h-3 w-3" />
            Clear Queue
          </button>
        )}
      </CardHeader>
      <ScrollArea className="flex-1 min-h-0 py-1.5 pb-2">
        <div className="flex flex-col gap-2.5 px-3 sm:px-4">
          {!hasContent ? (
            <EmptyQ />
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="flex flex-col gap-1">
                  <h3 className="px-1 text-xs sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Upcoming ({upcoming.length})
                  </h3>
                  {upcoming.map((item: QueueItem) => (
                    <QItemCard
                      key={item.queueItemId}
                      item={item}
                      canRemove
                      onRemove={onRemoveFromQueue}
                      onAddToQueue={onAddToQueue}
                      onPlayNext={onPlayNext}
                    />
                  ))}
                </div>
              )}

              {q.length > 0 && current && (
                <div className="flex flex-col gap-1 p-1.5 sm:p-1 rounded-xl bg-muted/40 border border-border/50">
                  <div className="flex items-center gap-2 px-2 pt-0.5">
                    <h3 className="text-xs font-semibold text-foreground">Now Playing</h3>
                  </div>
                  <QItemCard
                    item={current}
                    isCurrent
                    onAddToQueue={onAddToQueue}
                    onPlayNext={onPlayNext}
                  />
                </div>
              )}

              {hist.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      History ({hist.length})
                    </h3>
                    {onClearHistory && (
                      <button
                        onClick={onClearHistory}
                        className="text-xs sm:text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1.5 sm:p-0 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {hist.map((item: QueueItem, idx: number) => (
                    <QItemCard
                      key={item.queueItemId || `hist-${idx}`}
                      item={item}
                      isHistory
                      onAddToQueue={onAddToQueue}
                      onPlayNext={onPlayNext}
                    />
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

