import { createFileRoute } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { MusicCard } from '#/components/MusicCard'
import { QueueCard } from '#/components/QueueCard'
import { MusicController } from '#/components/MusicController'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="mx-auto flex h-dvh max-h-dvh w-full max-w-7xl flex-col justify-between gap-6 overflow-hidden p-6 font-mono md:p-8">
      <Header />
      <div className="my-2 flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-6 md:flex-row">
        <MusicCard />
        <QueueCard />
      </div>
      <MusicController />
    </div>
  )
}
