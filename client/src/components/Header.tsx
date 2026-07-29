import { Disc3 } from 'lucide-react'
import { ModeToggle } from './mode-toggle'
import { SearchMusic } from './MusicSearch'
import { useMusicPlayer } from '#/store/musicPlayer'

export function Header() {
  const { queue: q } = useMusicPlayer()

  return (
    <div className="flex items-center justify-between mx-auto w-full max-w-2xl shrink-0 gap-2 px-3 py-2 md:gap-4 md:px-5 md:py-2.5 jam-card">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground">
          <Disc3 className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="select-none text-base font-bold tracking-tight text-foreground">
            JAM
          </h1>
          <span className="flex items-center justify-center rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {q.length} in queue
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SearchMusic />
        <ModeToggle />
      </div>
    </div>
  )
}
