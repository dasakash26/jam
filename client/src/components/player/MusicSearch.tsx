import { Button } from '../ui/button'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from '../ui/command'
import { useMusicPlayer } from '#/store/musicPlayer'
import { useShallow } from 'zustand/react/shallow'
import type { Music } from '#/types'
import { useEffect, useState } from 'react'
import { Search, Plus, RefreshCw, AlertCircle, ListMusic } from 'lucide-react'

import { formatDuration } from '#/utils/formatters'
import { ImageWithFallback } from '../visual/ImageWithFallback'
import { SearchItemSkeleton } from '../visual/Skeletons'
import { useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useUserStore } from '#/store/user'
import { addToRoomQueueApi } from '#/utils/api'
import { toast } from 'sonner'

export { SearchItemSkeleton }

export function SearchMusic() {
  const [open, setOpen] = useState(false)
  const params = useParams({ strict: false })
  const queryClient = useQueryClient()
  const { userId } = useUserStore()

  const handleAddTrack = async (music: Music) => {
    if (params.roomId) {
      try {
        await addToRoomQueueApi(params.roomId, userId, [music])
        queryClient.invalidateQueries({ queryKey: ['room', params.roomId] })
        toast.success('Added to Room Queue', {
          description: `${music.title} • ${music.uploader}`,
        })
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        toast.error('Failed to add to room queue', { description: errorMsg })
      }
    } else {
      pushToQueue(music)
    }
    setOpen(false)
  }

  const {
    query,
    setQuery,
    results,
    isLoading,
    isError,
    error,
    executeQuery,
    pushToQueue,
  } = useMusicPlayer(
    useShallow((state) => ({
      query: state.query,
      setQuery: state.setQuery,
      results: state.results,
      isLoading: state.isLoading,
      isError: state.isError,
      error: state.error,
      executeQuery: state.executeQuery,
      pushToQueue: state.pushToQueue,
    })),
  )

  const isPlaylistQuery = /[?&]list=/.test(query) || /^PL[a-zA-Z0-9_-]+$/.test(query.trim())

  const handleAddAllPlaylist = async () => {
    if (params.roomId) {
      try {
        await addToRoomQueueApi(params.roomId, userId, results)
        queryClient.invalidateQueries({ queryKey: ['room', params.roomId] })
        toast.success('Playlist Added to Room', {
          description: `${results.length} tracks added to room queue`,
        })
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        toast.error('Failed to add playlist to room queue', { description: errorMsg })
      }
    } else {
      pushToQueue(results)
    }
    setOpen(false)
  }

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
        <span className="hidden sm:inline">Search or paste playlist...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        shouldFilter={false}
        className="sm:max-w-lg jam-card overflow-hidden"
      >
        <CommandInput
          placeholder="Search song or paste YouTube playlist URL..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[380px] p-2.5 space-y-1.5 overflow-y-auto">
          {isLoading && (
            <div className="space-y-1.5 p-1">
              <SearchItemSkeleton />
              <SearchItemSkeleton />
              <SearchItemSkeleton />
              <SearchItemSkeleton />
            </div>
          )}

          {!isLoading && isError && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center my-2 shadow-xs">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-xs font-semibold text-foreground">Search Failed</p>
              <p className="text-xs text-muted-foreground max-w-sm break-words leading-relaxed">
                {error || 'Failed to fetch results or parse playlist'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={executeQuery}
                className="mt-2 h-8 px-3 text-xs gap-1.5 border-border hover:border-primary/50 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && results.length === 0 && query.trim() !== '' && (
            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
              No results found for &quot;{query}&quot;.
            </CommandEmpty>
          )}

          {!isLoading && !isError && results.length > 0 && isPlaylistQuery && (
            <div className="mb-2.5 flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 p-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <ListMusic className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  Playlist Detected ({results.length} tracks)
                </span>
              </div>
              <Button size="sm" onClick={handleAddAllPlaylist} className="h-7 px-3 text-xs font-medium cursor-pointer shadow-xs">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add All
              </Button>
            </div>
          )}





          {!isLoading &&
            !isError &&
            results.map((music: Music) => (
              <CommandItem
                key={music.id}
                value={music.id}
                onSelect={() => {
                  handleAddTrack(music)
                }}
                className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-all border border-transparent data-[selected=true]:bg-primary/20 data-[selected=true]:border-primary/50 data-[selected=true]:shadow-xs aria-selected:bg-primary/20 aria-selected:border-primary/50 hover:bg-muted/50"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted/60">
                    <ImageWithFallback
                      src={music.thumbnailUrl}
                      alt={music.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <h4 className="truncate text-xs font-semibold text-foreground group-data-[selected=true]:text-primary group-aria-selected:text-primary">
                      {music.title}
                    </h4>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground group-data-[selected=true]:text-foreground">
                      {music.uploader}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="select-none rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground group-data-[selected=true]:bg-primary/30 group-data-[selected=true]:text-primary">
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
