import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useMusicPlayer } from '#/store/musicPlayer'
import type { Music } from '#/types'
import { useEffect, useState } from 'react'
import { Search, Plus, Music2, RefreshCw } from 'lucide-react'

export function SearchMusic() {
  const [open, setOpen] = useState(false)
  const { query, setQuery, results, isLoading, isError, executeQuery, pushToQueue } = useMusicPlayer()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="flex items-center gap-2 px-3 py-1.5 h-9 text-xs text-muted-foreground font-normal">
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          </Button>
        }
      />
      <DialogContent className="flex max-h-[85vh] w-[95vw] sm:w-full flex-col gap-4 overflow-hidden rounded-xl p-4 sm:max-w-md sm:p-5 jam-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <Search className="h-4 w-4 text-muted-foreground" />
            Search Music
          </DialogTitle>
        </DialogHeader>

        <Input
          id="search"
          aria-label="Search music"
          placeholder="Type song or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="h-9 text-xs"
        />

        <div className="mt-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
          {isLoading && (
            <>
              <SearchItemSkeleton />
              <SearchItemSkeleton />
              <SearchItemSkeleton />
              <SearchItemSkeleton />
            </>
          )}

          {!isLoading && isError && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center">
              <p className="text-xs font-medium text-destructive">Failed to fetch search results</p>
              <button
                onClick={executeQuery}
                className="flex items-center gap-1 text-[11px] font-medium text-foreground hover:text-primary transition-colors cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <RefreshCw className="h-3 w-3" />
                Retry Search
              </button>
            </div>
          )}

          {!isLoading && !isError && results.length === 0 && query.trim() !== '' && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!isLoading &&
            !isError &&
            results.map((music: Music) => (
              <ResultCard
                key={music.id}
                music={music}
                onClick={() => {
                  pushToQueue(music)
                }}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SearchItemSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-card/60 p-2">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-muted"></div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted"></div>
          <div className="h-2 w-1/2 animate-pulse rounded bg-muted"></div>
        </div>
      </div>
      <div className="h-4 w-8 shrink-0 animate-pulse rounded bg-muted"></div>
    </div>
  )
}

interface ResultCardProps {
  music: Music
  onClick?: () => void
}

function ResultCard({ music, onClick }: ResultCardProps) {
  const formatDuration = (s: number) => {
    if (s == null || isNaN(s)) return '00:00'
    const mins = Math.floor(s / 60)
    const secs = String(s % 60).padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      onClick={onClick}
      className="group relative flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/40 bg-card/60 p-2 transition-all duration-150 hover:border-border hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted">
          {music.thumbnailUrl ? (
            <img
              src={music.thumbnailUrl}
              alt={music.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Music2 className="h-3.5 w-3.5" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Plus className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1 text-left">
          <h4 className="truncate text-xs font-medium text-foreground">
            {music.title}
          </h4>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
            {music.uploader}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="select-none rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {formatDuration(music.duration)}
        </span>
      </div>
    </div>
  )
}
