import { createFileRoute } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { MusicCard, MusicCardSkeleton } from '#/components/MusicCard'
import { QueueCard } from '#/components/QueueCard'
import { MusicController } from '#/components/MusicController'
import { Toaster } from 'sonner'
import LightRays from '#/components/LightRays'
import { useTheme } from '#/components/theme-provider'
import { useMusicPlayer } from '#/store/musicPlayer'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { theme } = useTheme()
  const { hasHydrated } = useMusicPlayer()

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

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
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col justify-between gap-6 p-4 font-mono md:h-full md:max-h-full md:p-8">
        <Header />
        <div className="my-2 flex min-h-0 w-full flex-1 flex-col items-stretch justify-center gap-4 sm:gap-6 md:flex-row">
          {!hasHydrated ? (
            <RootSkeliton />
          ) : (
            <>
              <MusicCard />
              <QueueCard />
            </>
          )}
        </div>
        <MusicController />
        <Toaster theme="system" />
      </div>
    </div>
  )
}

function RootSkeliton() {
  return (<>
    <MusicCardSkeleton />
    <div className="flex flex-col flex-1 h-full min-h-[40vh] sm:min-h-0 w-full max-w-lg jam-card p-6 gap-4">
      <div className="h-5 w-24 rounded bg-muted/60 animate-pulse" />
      <div className="h-16 w-full rounded-xl bg-muted/40 animate-pulse" />
      <div className="h-12 w-full rounded-lg bg-muted/30 animate-pulse" />
      <div className="h-12 w-full rounded-lg bg-muted/30 animate-pulse" />
    </div>
  </>)
}
