import { createFileRoute } from '@tanstack/react-router'
import { useMusicPlayer } from '#/store/musicPlayer'
import { JamApp } from '#/components/JamApp'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const player = useMusicPlayer()

  return <JamApp player={player} />
}
