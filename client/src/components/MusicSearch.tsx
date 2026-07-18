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
import { Card, CardContent } from './ui/card'
import type { Music } from '#/types'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

export function SearchMusic() {
  const [open, setOpen] = useState(false)
  const { query, setQuery, results, isLoading, pushToQueue } = useMusicPlayer()

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
          <Button variant="outline">
            <Search />
          </Button>
        }
      />
      <DialogContent className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto p-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg tracking-tight">
            Search Music
          </DialogTitle>
        </DialogHeader>

        <Input
          id="search"
          placeholder="Search for tracks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <div className="mt-1 flex flex-col gap-1.5">
          {isLoading && (
            <div className="animate-pulse p-3 text-center text-sm text-muted-foreground">
              Searching tracks...
            </div>
          )}

          {!isLoading && results.length === 0 && query.trim() !== '' && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!isLoading &&
            results.map((music: Music) => (
              <ResultCard
                key={music.id}
                music={music}
                onClick={() => {
                  pushToQueue(music)
                  console.log('Selected:', music.title)
                  // setOpen(false)
                }}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ResultCardProps {
  music: Music
  onClick?: () => void
}

function ResultCard({ music, onClick }: ResultCardProps) {
  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = String(s % 60).padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer border-muted transition-colors hover:bg-accent hover:text-accent-foreground focus-within:ring-1 focus-within:ring-ring"
    >
      <CardContent className="flex items-center gap-2.5 p-2">
        {music.thumbnailUrl && (
          <img
            src={music.thumbnailUrl}
            alt={music.title}
            className="h-8 w-8 shrink-0 rounded-md bg-muted object-cover"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-xs font-medium tracking-tight text-foreground">
            {music.title}
          </span>
          <span className="text-[10px] text-muted-foreground truncate leading-none">
            {music.uploader}
          </span>
        </div>

        <span className="ml-2 shrink-0 text-xs tabular-nums text-muted-foreground">
          {formatDuration(music.duration)}
        </span>
      </CardContent>
    </Card>
  )
}
