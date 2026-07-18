import { createFileRoute } from '@tanstack/react-router'
import { SearchSong } from '#/components/SongSearch'
import { ModeToggle } from '#/components/mode-toggle'
import { PlayIcon } from 'lucide-react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="p-8">
      <div className="flex justify-between border-2 p-2 rounded-lg">
        <div className='flex space-x-2'>
          <PlayIcon className="border-2 w-10 h-10 p-1 rounded-2xl hover:scale-104" />
          <h1 className="text-4xl font-bold">JAM</h1>
        </div>
        <div className="flex space-x-2 align-middle">
          <ModeToggle />
          <SearchSong />
        </div>
      </div>
      <p className="mt-4 text-lg max-w-xl ">Songs</p>
    </div>
  )
}
