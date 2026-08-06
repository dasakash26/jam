import { X, MoreVertical, Plus, ListPlus } from 'lucide-react'
import type { Music, QueueItem } from '#/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { formatDuration, getInitials } from '#/utils/formatters'
import { ImageWithFallback } from '../visual/ImageWithFallback'
import { EqualizerIcon } from '../visual/EqualizerIcon'

interface QItemCardProps {
  item: QueueItem
  isCurrent?: boolean
  isHistory?: boolean
  canRemove?: boolean
  onAddToQueue?: (song: Music) => void
  onPlayNext?: (song: Music) => void
  onRemove?: (queueItemId: string) => void
}

export function QItemCard({
  item,
  isCurrent,
  canRemove,
  onAddToQueue,
  onPlayNext,
  onRemove,
}: QItemCardProps) {
  const { track: song, queueItemId, addedBy } = item

  return (
    <div className="group flex items-center gap-2.5 rounded-lg p-1.5 sm:p-1 transition-colors hover:bg-muted/50">
      <div className="relative overflow-hidden rounded-md shrink-0 h-8.5 w-8.5 sm:h-8 sm:w-8">
        <ImageWithFallback
          src={song.thumbnailUrl}
          alt={song.title}
          className="h-full w-full object-cover shadow-xs"
        />
      </div>

      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5 min-w-0">
          <h4
            className={`truncate text-xs font-medium ${isCurrent ? 'text-primary font-semibold' : 'text-foreground'}`}
          >
            {song.title}
          </h4>
          {isCurrent && <EqualizerIcon className="h-3 w-3 text-primary shrink-0" />}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 truncate text-[11px] sm:text-[10px] text-muted-foreground">
          <span className="truncate">{song.uploader}</span>
          {addedBy?.userName && (
            <div
              title={`Queued by ${addedBy.userName}`}
              className="inline-flex items-center gap-1 rounded-full bg-muted/90 border border-border/80 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground shrink-0"
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[8px] uppercase">
                {getInitials(addedBy.userName)}
              </span>
              <span className="max-w-[70px] truncate text-foreground/90 font-medium">
                {addedBy.userName}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 pr-1">
        <span className="text-xs sm:text-[10px] font-mono text-muted-foreground">
          {formatDuration(song.duration)}
        </span>

        {canRemove && onRemove && (
          <button
            onClick={() => onRemove(queueItemId)}
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            title="Remove from queue"
          >
            <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            title="Track options"
          >
            <MoreVertical className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onPlayNext && (
              <DropdownMenuItem
                onClick={() => onPlayNext(song)}
                className="cursor-pointer text-xs flex items-center gap-2"
              >
                <ListPlus className="h-3.5 w-3.5 text-primary" />
                Play Next
              </DropdownMenuItem>
            )}
            {onAddToQueue && (
              <DropdownMenuItem
                onClick={() => onAddToQueue(song)}
                className="cursor-pointer text-xs flex items-center gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Add to Queue
              </DropdownMenuItem>
            )}
            {canRemove && onRemove && (
              <DropdownMenuItem
                onClick={() => onRemove(queueItemId)}
                className="cursor-pointer text-xs text-destructive flex items-center gap-2 focus:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

