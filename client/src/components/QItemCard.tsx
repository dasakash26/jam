import { X, Plus } from 'lucide-react'
import { useMusicPlayer } from '#/store/musicPlayer'
import type { Music } from '#/types'
import { Button } from '@base-ui/react'

interface QItemCardProps {
  song: Music
  isCurrent?: boolean
  isHistory?: boolean
  canRemove?: boolean
  queueIndex?: number
}

const formatDuration = (time: number) => {
  if (time == null || isNaN(time)) return '00:00'
  const mins = Math.floor(time / 60)
  const secs = Math.floor(time % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function QItemCard({ song, isCurrent, canRemove, queueIndex }: QItemCardProps) {
  const { pushToQueue, removeFromQueue } = useMusicPlayer()

  return (
    <div className="group flex items-center gap-3 rounded-lg p-2 sm:p-1.5 transition-colors hover:bg-muted/50">
      <Button
        className="group/thumb relative cursor-pointer border-0 bg-transparent p-0 overflow-hidden rounded-md shrink-0"
        onClick={() => pushToQueue(song)}
        title="Add to queue"
      >
        <img
          src={song.thumbnailUrl}
          alt={song.title}
          className="h-10 w-10 sm:h-9 sm:w-9 object-cover shadow-xs"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-150 group-hover/thumb:opacity-100">
          <Plus className="h-3.5 w-3.5 text-white" />
        </div>
      </Button>

      <div className="min-w-0 flex-1 text-left">
        <h4 className={`truncate text-sm sm:text-xs font-medium ${isCurrent ? 'text-primary font-semibold' : 'text-foreground'}`}>
          {song.title}
        </h4>
        <p className="text-xs sm:text-[10px] text-muted-foreground truncate mt-0.5">
          {song.uploader}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 pr-1">
        <span className="text-xs sm:text-[10px] font-mono text-muted-foreground">
          {formatDuration(song.duration)}
        </span>
        {canRemove && queueIndex !== undefined && (
          <button
            onClick={() => removeFromQueue(queueIndex)}
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 text-muted-foreground hover:text-destructive transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:opacity-100 rounded-sm"
            title="Remove from queue"
          >
            <X className="h-4 w-4 sm:h-3 sm:w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
