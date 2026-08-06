import { Disc3 } from 'lucide-react'
import { ModeToggle } from './visual/mode-toggle'
import { SearchMusic } from './player/MusicSearch'
import { JoinRoom } from './room/JoinRoom'
import { UserProfileBadge } from './user/UserProfileBadge'

interface HeaderProps {
  queueLength?: number
}

export function Header({ queueLength = 0 }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mx-auto w-full max-w-3xl shrink-0 gap-3 px-4 py-2.5 sm:px-5 sm:py-3 jam-card rounded-2xl sm:rounded-full">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground">
          <Disc3 className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="select-none text-base font-bold tracking-tight text-foreground">
            JAM
          </h1>
          <span className="hidden sm:flex items-center justify-center rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {queueLength} in queue
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <SearchMusic />
        <JoinRoom />
        <UserProfileBadge />
        <ModeToggle />
      </div>
    </div>
  )
}
