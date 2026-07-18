import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useSearch } from '#/store/search'
import { Card, CardContent } from './ui/card'
import type { Song } from '#/types'
import { useEffect, useState } from 'react'

export function SearchSong() {
  const [open, setOpen] = useState(false)
  const { query, setQuery, results, isLoading } = useSearch()

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
      <DialogTrigger render={<Button variant="outline">Search (⌘K)</Button>} />
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto p-4 flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            Search Songs
          </DialogTitle>
        </DialogHeader>

        <Input
          id="search"
          placeholder="Search for tracks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full"
        />

        <div className="flex flex-col gap-1.5 mt-1">
          {isLoading && (
            <div className="text-sm text-muted-foreground p-3 text-center animate-pulse">
              Searching tracks...
            </div>
          )}

          {!isLoading && results.length === 0 && query.trim() !== '' && (
            <div className="text-sm text-muted-foreground p-3 text-center">
              No results found for "{query}"
            </div>
          )}

          {!isLoading &&
            results.map((song: Song) => (
              <ResultCard
                key={song.id}
                song={song}
                onClick={() => {
                  console.log('Selected:', song.title)
                  setOpen(false)
                }}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ResultCardProps {
  song: Song
  onClick?: () => void
}

function ResultCard({ song, onClick }: ResultCardProps) {
  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = String(s % 60).padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors focus-within:ring-1 focus-within:ring-ring border-muted"
    >
      <CardContent className="flex items-center gap-2.5 p-2 text-sm">
        {song.thumbnailUrl && (
          <img
            src={song.thumbnailUrl}
            alt={song.title}
            className="w-8 h-8 rounded-md object-cover bg-muted shrink-0"
          />
        )}

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="font-medium tracking-tight text-xs text-foreground truncate">
            {song.title}
          </span>
          <span className="text-[10px] text-muted-foreground truncate leading-none">
            {song.uploader}
          </span>
        </div>

        <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">
          {formatDuration(song.duration)}
        </span>
      </CardContent>
    </Card>
  )
}
