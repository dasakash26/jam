import { Disc3 } from 'lucide-react'
import { ModeToggle } from './visual/mode-toggle'
import { SearchMusic } from './player/MusicSearch'
import { JoinRoom } from './room/JoinRoom'
import { RoomDetails } from './room/RoomDetails'
import { UserProfileBadge } from './user/UserProfileBadge'
import { HelpDialog } from './HelpDialog'
import { useParams } from '@tanstack/react-router'

interface HeaderProps {
  queueLength?: number
}

export function Header({ queueLength: _queueLength }: HeaderProps) {
  const params = useParams({ strict: false })
  const inRoom = Boolean(params.roomId)

  return (
    <div className="flex items-center justify-between mx-auto w-full max-w-5xl shrink-0 gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3 jam-card rounded-2xl sm:rounded-full">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary shadow-xs">
          <Disc3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin-slow" />
        </div>
        <h1 className="select-none text-sm sm:text-base font-extrabold tracking-wider text-foreground">
          JAM
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <SearchMusic />
        {inRoom ? <RoomDetails /> : <JoinRoom />}
        <HelpDialog className="hidden sm:flex" />
        <UserProfileBadge />
        <ModeToggle className="hidden sm:flex" />
      </div>
    </div>
  )
}

