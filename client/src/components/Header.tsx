import { Disc3 } from 'lucide-react'
import { ModeToggle } from './mode-toggle'
import { SearchMusic } from './MusicSearch'
import { useMusicPlayer } from '#/store/musicPlayer'

export function Header() {
  const { queue: q } = useMusicPlayer()
  const hasTrack = q.length > 0

  return (
    <div className="flex items-center justify-between mx-auto w-full max-w-2xl shrink-0 gap-4 rounded-full border-[0.05rem] px-6 py-3 shadow-lg transition-transform hover:scale-101">
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <Disc3
            className={`h-5 w-5 text-primary ${hasTrack ? 'animate-spin [animation-duration:6s]' : ''}`}
          />
        </div>
        <h1 className="select-none bg-linear-to-r from-primary to-primary/60 bg-clip-text text-2xl font-bold tracking-wider">
          JAM
        </h1>
      </div>
      <div className="flex items-center space-x-3">
        <SearchMusic />
        <ModeToggle />
      </div>
    </div>
  )
}
