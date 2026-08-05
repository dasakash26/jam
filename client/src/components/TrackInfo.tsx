import type { Music } from '#/types'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Music2 } from 'lucide-react'

interface TrackInfoProps {
  s?: Music
}

export function TrackInfo({ s }: TrackInfoProps) {
  return (
    <div className="flex items-center gap-3 overflow-hidden w-full">
      <Avatar className="h-10 w-10 shrink-0 rounded-lg border border-border">
        <AvatarImage src={s?.thumbnailUrl} alt={s?.title} className="rounded-lg object-cover" />
        <AvatarFallback className="rounded-lg bg-muted/60 text-muted-foreground">
          <Music2 className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col text-left text-xs min-w-0 flex-1">
        <span className="truncate font-medium text-foreground">
          {s ? s.title : 'No Track Selected'}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="truncate text-[10px] text-muted-foreground">
            {s ? s.uploader : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

