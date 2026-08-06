import { X, MoreVertical, Plus, ListPlus } from 'lucide-react'
import type { Music } from '#/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { formatDuration } from '#/utils/formatters'
import { ImageWithFallback } from '../visual/ImageWithFallback'
import { EqualizerIcon } from '../visual/EqualizerIcon'

interface QItemCardProps {
  song: Music
  isCurrent?: boolean
  isHistory?: boolean
  canRemove?: boolean
  queueIndex?: number
  onAddToQueue?: (song: Music) => void
  onPlayNext?: (song: Music) => void
  onRemove?: (index: number) => void
}

export function QItemCard({
  song,
  isCurrent,
  canRemove,
  queueIndex,
  onAddToQueue,
  onPlayNext,
  onRemove,
}: QItemCardProps) {
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
        <p className="text-[11px] sm:text-[10px] text-muted-foreground truncate">
          {song.uploader}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 pr-1">
        <span className="text-xs sm:text-[10px] font-mono text-muted-foreground">
          {formatDuration(song.duration)}
        </span>

        {canRemove && queueIndex !== undefined && onRemove && (
          <button
            onClick={() => onRemove(queueIndex)}
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
            {canRemove && queueIndex !== undefined && onRemove && (
              <DropdownMenuItem
                onClick={() => onRemove(queueIndex)}
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
