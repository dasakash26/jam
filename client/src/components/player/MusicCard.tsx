import { Card, CardTitle, CardDescription } from '../ui/card'
import { Music2, AlertCircle, RefreshCw } from 'lucide-react'
import type { Music } from '#/types'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { ImageWithFallback } from '../visual/ImageWithFallback'
import { MusicCardSkeleton } from '../visual/Skeletons'
import { formatDuration, getInitials } from '#/utils/formatters'

export { MusicCardSkeleton }

interface MusicCardProps {
  currentSong?: Music
  addedBy?: { userId: string; userName: string }
  isLoading?: boolean
  isError?: boolean
  error?: string
  onRetry?: () => void
}

export function MusicCard({
  currentSong: s,
  addedBy,
  isLoading,
  isError,
  error,
  onRetry,
}: MusicCardProps) {
  if (isLoading) {
    return <MusicCardSkeleton />
  }

  if (isError) {
    return (
      <Card className="flex flex-1 h-full min-h-0 w-full max-w-lg flex-col overflow-hidden jam-card">
        <div className="relative flex-1 min-h-0 overflow-hidden bg-muted/40">
          <ImageWithFallback
            src={s?.thumbnailUrl}
            alt={s?.title || 'Error'}
            className="h-full w-full object-cover opacity-30 blur-xs"
          />
        </div>

        <Separator />

        <div className="relative z-10 flex items-center justify-between gap-3 border-t border-destructive/30 bg-destructive/10 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-semibold text-destructive">
                Stream Error
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {error || 'Unable to stream selected track.'}
              </span>
            </div>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="shrink-0 flex items-center gap-1.5 text-xs border-destructive/40 hover:bg-destructive/15 text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          )}
        </div>
      </Card>
    )
  }

  if (!s) {
    return <EmptyMusicCard />
  }

  return (
    <Card className="flex flex-col flex-1 h-full min-h-[420px] sm:min-h-0 w-full max-w-lg overflow-hidden jam-card jam-card-hover p-4 sm:p-5 gap-3.5">
      <div className="relative w-full flex-1 min-h-[220px] sm:min-h-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg shadow-black/15 group bg-muted/40">
        <ImageWithFallback
          src={s.thumbnailUrl}
          alt={s.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute bottom-2.5 right-2.5 select-none rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-mono font-medium text-white backdrop-blur-md border border-white/10 shadow-xs">
          {formatDuration(s.duration)}
        </span>
      </div>

      <div className="flex flex-col justify-center gap-0.5 px-1 py-0.5 shrink-0">
        <h2 className="line-clamp-1 text-sm sm:text-base font-bold tracking-tight text-foreground">
          {s.title}
        </h2>
        <div className="flex items-center gap-2 truncate text-xs font-medium text-muted-foreground">
          <span className="truncate">{s.uploader}</span>
          {addedBy?.userName && (
            <div
              title={`Queued by ${addedBy.userName}`}
              className="flex items-center gap-1.5 rounded-full bg-muted/80 border border-border/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0"
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[8px] uppercase">
                {getInitials(addedBy.userName)}
              </span>
              <span className="max-w-[110px] truncate text-foreground/90 font-semibold">{addedBy.userName}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export function EmptyMusicCard() {
  return (
    <Card className="flex flex-col flex-1 h-full min-h-0 w-full max-w-lg items-center justify-center jam-card jam-card-hover p-6 text-center">
      <Music2 className="mb-2 h-6 w-6 text-muted-foreground/60" />
      <CardTitle className="mb-1 text-sm font-medium text-foreground">
        No Song Playing
      </CardTitle>
      <CardDescription className="text-xs">Search and add tracks to play</CardDescription>
    </Card>
  )
}
