import { Button } from './ui/button'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from './ui/command'
import { useMusicPlayer } from '#/store/musicPlayer'
import { useShallow } from 'zustand/react/shallow'
import type { Music } from '#/types'
import { useEffect, useState } from 'react'
import { Search, Plus, RefreshCw } from 'lucide-react'
import { formatDuration } from '#/utils/formatters'
import { ImageWithFallback } from './ImageWithFallback'
import { SearchItemSkeleton } from './Skeletons'

export { SearchItemSkeleton }

export function SearchMusic() {
  const [open, setOpen] = useState(false)
  const { query, setQuery, results, isLoading, isError, executeQuery, pushToQueue } = useMusicPlayer(
    useShallow((state) => ({
      query: state.query,
      setQuery: state.setQuery,
      results: state.results,
      isLoading: state.isLoading,
      isError: state.isError,
      executeQuery: state.executeQuery,
      pushToQueue: state.pushToQueue,
    })),
  )

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
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 h-9 text-xs text-muted-foreground font-normal cursor-pointer"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false} className="sm:max-w-lg jam-card overflow-hidden">
        <CommandInput
          placeholder="Search song or artist..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[380px] p-1.5 space-y-0.5 overflow-y-auto">
          {isLoading && (
            <div className="space-y-1 p-0.5">
              <SearchItemSkeleton />
              <SearchItemSkeleton />
              <SearchItemSkeleton />
              <SearchItemSkeleton />
            </div>
          )}

          {!isLoading && isError && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center my-2">
              <p className="text-xs font-medium text-destructive">Failed to fetch search results</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={executeQuery}
                className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Search
              </Button>
            </div>
          )}

          {!isLoading && !isError && results.length === 0 && query.trim() !== '' && (
            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
              No results found for &quot;{query}&quot;.
            </CommandEmpty>
          )}

          {!isLoading &&
            !isError &&
            results.map((music: Music) => (
              <CommandItem
                key={music.id}
                value={music.id}
                onSelect={() => {
                  pushToQueue(music)
                  setOpen(false)
                }}
                className="group flex cursor-pointer items-center justify-between gap-2.5 rounded-md px-2 py-1.5 transition-colors data-[selected=true]:bg-accent/80 data-[selected=true]:text-accent-foreground hover:bg-accent/50"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted/60">
                    <ImageWithFallback
                      src={music.thumbnailUrl}
                      alt={music.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                      <Plus className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <h4 className="truncate text-xs font-medium text-foreground group-data-[selected=true]:text-accent-foreground">
                      {music.title}
                    </h4>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground group-data-[selected=true]:text-accent-foreground/80">
                      {music.uploader}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="select-none rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground group-data-[selected=true]:bg-background/20 group-data-[selected=true]:text-accent-foreground">
                    {formatDuration(music.duration)}
                  </span>
                </div>
              </CommandItem>
            ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}


