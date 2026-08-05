import { Card, CardTitle, CardDescription } from './ui/card'
import { Music2, AlertCircle, RefreshCw } from 'lucide-react'
import type { Music } from '#/types'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { ImageWithFallback } from './ImageWithFallback'
import { MusicCardSkeleton } from './Skeletons'
import { formatDuration } from '#/utils/formatters'

export { MusicCardSkeleton }

interface MusicCardProps {
  currentSong?: Music
  isLoading?: boolean
  isError?: boolean
  error?: string
  onRetry?: () => void
}

export function MusicCard({
  currentSong: s,
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
    <Card className="flex flex-1 h-full min-h-0 w-full max-w-lg flex-col overflow-hidden jam-card jam-card-hover p-0 border border-border/60 bg-card">
      <div className="relative flex-1 min-h-0 w-full overflow-hidden">
        <ImageWithFallback
          src={s.thumbnailUrl}
          alt={s.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      <div className="flex flex-col justify-center gap-1 p-4 sm:p-5 border-t border-border/40 bg-card/95">
        <h2 className="line-clamp-1 text-base sm:text-lg font-bold tracking-tight text-foreground">
          {s.title}
        </h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span className="truncate max-w-[260px] font-medium">{s.uploader}</span>
          <span className="select-none text-[8px] text-muted-foreground/60">•</span>
          <span className="font-mono text-xs font-normal text-muted-foreground">{formatDuration(s.duration)}</span>
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
      <CardDescription className="text-xs">
        Search and add tracks to play
      </CardDescription>
    </Card>
  )
}


