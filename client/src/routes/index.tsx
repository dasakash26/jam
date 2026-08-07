import { createFileRoute } from '@tanstack/react-router'
import { useHomePlayerSlice } from '#/store/musicPlayer'
import { Header } from '#/components/Header'
import { MusicCard } from '#/components/player/MusicCard'
import { QueueCard } from '#/components/player/QueueCard'
import { MusicController } from '#/components/player/MusicController'
import { RootSkeleton } from '#/components/visual/Skeletons'
import LightRays from '#/components/visual/LightRays'
import { Toaster } from 'sonner'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const {
    queue,
    history,
    hasHydrated,
    isLoading,
    isError,
    error,
    executeQuery,
    clearQueue,
    clearHistory,
    removeFromQueue,
    pushToQueue,
    playNextTrack,
    popFromQueue,
    playPrevious,
  } = useHomePlayerSlice()

  const hasHistory = history.length > 0
  const currentSong = queue[0]?.track

  return (
    <div className="relative min-h-dvh w-full overflow-y-auto md:h-dvh md:max-h-dvh md:overflow-hidden">
      <LightRays mouseInfluence={0.5} />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-start md:justify-between gap-3 sm:gap-5 p-3 sm:p-4 md:p-6 pb-32 sm:pb-36 md:h-full md:max-h-full md:pb-28">
        <Header />
        <div className="my-auto flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 sm:gap-6 md:flex-row md:items-stretch max-w-5xl mx-auto md:h-[calc(100dvh-170px)] md:max-h-155 lg:max-h-165">
          {hasHydrated === false ? (
            <RootSkeleton />
          ) : (
            <>
              <MusicCard
                currentSong={currentSong}
                isLoading={isLoading && queue.length === 0}
                isError={isError}
                error={error}
                onRetry={executeQuery}
              />
              <QueueCard
                queue={queue}
                history={history}
                onClearQueue={clearQueue}
                onClearHistory={clearHistory}
                onRemoveFromQueue={removeFromQueue}
                onAddToQueue={pushToQueue}
                onPlayNext={playNextTrack}
              />
            </>
          )}
        </div>
        <div className="fixed bottom-3 sm:bottom-4 left-0 right-0 z-50 px-3 sm:px-6 max-w-4xl mx-auto pointer-events-none">
          <div className="pointer-events-auto w-full">
            <MusicController
              currentSong={currentSong}
              hasHistory={hasHistory}
              onNext={popFromQueue}
              onPrevious={playPrevious}
              onError={popFromQueue}
            />
          </div>
        </div>
        <Toaster theme="system" />
      </div>
    </div>
  )
}
