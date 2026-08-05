import { Header } from './Header'
import { MusicCard } from './MusicCard'
import { QueueCard } from './QueueCard'
import { MusicController } from './MusicController'
import { RootSkeleton } from './Skeletons'
import { Toaster } from 'sonner'
import LightRays from './LightRays'
import { useTheme } from './theme-provider'
import type { Music } from '#/types'

export interface PlayerState {
  queue: Music[]
  history: Music[]
  isLoading: boolean
  isError?: boolean
  error?: string
  hasHydrated?: boolean
  clearQueue: () => void
  clearHistory: () => void
  removeFromQueue: (index: number) => void
  pushToQueue: (song: Music) => void
  playNextTrack: (song: Music) => void
  popFromQueue: () => void
  playPrevious: () => void
  executeQuery: () => void
}

interface JamAppProps {
  player: PlayerState
}

export function JamApp({ player }: JamAppProps) {
  const { theme } = useTheme()

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const currentSong = player.queue[0]
  const hasHistory = player.history.length > 0

  return (
    <div className="relative w-full max-h-none overflow-y-auto md:h-dvh md:max-h-dvh md:overflow-hidden">
      <LightRays
        raysColor={isDark ? '#fbbf24' : '#d97706'}
        lightSpread={1.8}
        rayLength={3.0}
        raysSpeed={1.2}
        saturation={1.8}
        mouseInfluence={0.08}
      />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col justify-between gap-6 p-4 md:h-full md:max-h-full md:p-8">
        <Header queueLength={player.queue.length} />
        <div className="my-2 flex min-h-0 w-full flex-1 flex-col items-stretch justify-center gap-4 sm:gap-6 md:flex-row">
          {player.hasHydrated === false ? (
            <RootSkeleton />
          ) : (
            <>
              <MusicCard
                currentSong={currentSong}
                isLoading={player.isLoading && player.queue.length === 0}
                isError={player.isError}
                error={player.error}
                onRetry={player.executeQuery}
              />
              <QueueCard
                queue={player.queue}
                history={player.history}
                onClearQueue={player.clearQueue}
                onClearHistory={player.clearHistory}
                onRemoveFromQueue={player.removeFromQueue}
                onAddToQueue={player.pushToQueue}
                onPlayNext={player.playNextTrack}
              />
            </>
          )}
        </div>
        <MusicController
          currentSong={currentSong}
          hasHistory={hasHistory}
          onNext={player.popFromQueue}
          onPrevious={player.playPrevious}
          onError={player.popFromQueue}
        />
        <Toaster theme="system" />
      </div>
    </div>
  )
}
