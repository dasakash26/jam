import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  queryOptions,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  addToRoomQueueApi,
  getRoomApi,
  joinRoomApi,
  leaveRoomApi,
  nextRoomTrackApi,
  previousRoomTrackApi,
  removeFromRoomQueueApi,
  seekRoomPlaybackApi,
  toggleRoomPlaybackApi,
} from '#/utils/api'
import { useUserStore } from '#/store/user'
import { ErrorBox } from '#/components/visual/ErrorBox'
import type { Music, Room } from '#/types'
import { Header, MusicCard, MusicController, QueueCard } from '#/components'
import LightRays from '#/components/visual/LightRays'
import { toast, Toaster } from 'sonner'

export const roomQueryOptions = (roomId: string) =>
  queryOptions<Room>({
    queryKey: ['room', roomId],
    queryFn: () => {
      const { userId } = useUserStore.getState()
      return getRoomApi(roomId, userId)
    },
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  })

export const Route = createFileRoute('/rooms/$roomId')({
  ssr: false,
  loader: async ({ context: { queryClient }, params: { roomId } }) => {
    const { userId, userName } = useUserStore.getState()

    console.log(`[ROOM]: ${userName} joining ${roomId.slice(0, 5)}`)
    await joinRoomApi(roomId, userName, userId)

    queryClient.ensureQueryData(roomQueryOptions(roomId))
  },
  pendingComponent: RoomLoading,
  errorComponent: RoomError,
  component: RoomPage,
})

function RoomLoading() {
  return (
    <div className="p-4 sm:p-5 text-xs text-muted-foreground">
      Loading room details...
    </div>
  )
}

function RoomError({ error }: ErrorComponentProps) {
  const message =
    error instanceof Error ? error.message : 'Room not found or server unavailable.'

  return (
    <div className="p-6 max-w-md mx-auto my-8">
      <ErrorBox title="Unable to Load Room" message={message} />
    </div>
  )
}

function RoomPage() {
  const { roomId } = Route.useParams()
  const { data: room } = useSuspenseQuery(roomQueryOptions(roomId))
  const { userId, userName } = useUserStore()
  const queryClient = useQueryClient()

  const currentItem = room.queue[0]
  const currentSong = currentItem?.track
  const hasHistory = room.history.length > 0

  console.debug(`[ROOM]: ${userName} joining ${roomId.slice(0, 5)}`)

  const handleAddToQueue = async (song: Music) => {
    try {
      await addToRoomQueueApi(roomId, userId, song)
      queryClient.invalidateQueries({ queryKey: ['room', roomId] })
      toast.success('Added to Room Queue', { description: song.title })
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      toast.error('Failed to add track', { description: errorMsg })
    }
  }

  const handleRemoveFromQueue = async (queueItemId: string) => {
    try {
      await removeFromRoomQueueApi(roomId, userId, queueItemId)
      queryClient.invalidateQueries({ queryKey: ['room', roomId] })
      toast.info('Removed from Room Queue')
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      toast.error('Failed to remove track', { description: errorMsg })
    }
  }

  const handleNext = async () => {
    try {
      await nextRoomTrackApi(roomId, userId)
      queryClient.invalidateQueries({ queryKey: ['room', roomId] })
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      toast.error('Failed to skip track', { description: errorMsg })
    }
  }

  const handlePrevious = async () => {
    try {
      await previousRoomTrackApi(roomId, userId)
      queryClient.invalidateQueries({ queryKey: ['room', roomId] })
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      toast.error('Failed to play previous track', { description: errorMsg })
    }
  }

  const handleSeek = async (seekTime: number) => {
    try {
      await seekRoomPlaybackApi(roomId, userId, seekTime)
      queryClient.invalidateQueries({ queryKey: ['room', roomId] })
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      toast.error('Failed to sync seek position', { description: errorMsg })
    }
  }

  const handlePlayPause = async (isPlaying: boolean) => {
    try {
      await toggleRoomPlaybackApi(roomId, userId, isPlaying)
      queryClient.invalidateQueries({ queryKey: ['room', roomId] })
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      toast.error('Failed to sync playback', { description: errorMsg })
    }
  }

  useEffect(() => {
    return () => {
      console.debug(`[ROOM]: ${userName} leaving ${roomId.slice(0, 5)}`)
      // leaveRoomApi(roomId, userId).catch(() => {})
    }
  }, [roomId, userId, userName])

  const songDuration = currentSong?.duration ?? 0
  const elapsed = room.isPlaying && room.updatedAt ? (Date.now() - room.updatedAt) / 1000 : 0
  const rawSeek = (room.seekTime || 0) + elapsed
  const targetSeekTime = songDuration > 0 ? Math.min(Math.max(0, rawSeek), songDuration - 0.5) : 0

  return (
    <div className="relative min-h-dvh w-full overflow-y-auto md:h-dvh md:max-h-dvh md:overflow-hidden">
      <LightRays mouseInfluence={0.5} />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-start md:justify-between gap-3 sm:gap-5 p-3 sm:p-4 md:p-6 pb-32 sm:pb-36 md:h-full md:max-h-full md:pb-28">
        <Header queueLength={room.queue.length} />
        <div className="my-auto flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 sm:gap-6 md:flex-row md:items-stretch max-w-5xl mx-auto md:h-[calc(100dvh-170px)] md:max-h-155 lg:max-h-165">
          <MusicCard currentSong={currentSong} addedBy={currentItem?.addedBy} />
          <QueueCard
            queue={room.queue}
            history={room.history}
            onAddToQueue={handleAddToQueue}
            onRemoveFromQueue={handleRemoveFromQueue}
          />
        </div>
        <div className="fixed bottom-3 sm:bottom-4 left-0 right-0 z-50 px-3 sm:px-6 max-w-4xl mx-auto pointer-events-none">
          <div className="pointer-events-auto w-full">
            <MusicController
              currentSong={currentSong}
              hasHistory={hasHistory}
              targetSeekTime={targetSeekTime}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSeek={handleSeek}
              isPlaying={room.isPlaying}
              onPlayPause={handlePlayPause}
              onError={handleNext}
            />
          </div>
        </div>
        <Toaster theme="system" />
      </div>
    </div>
  )
}

