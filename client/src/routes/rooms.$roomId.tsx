import { useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { Home, Radio } from 'lucide-react'

import {
  addToRoomQueueApi,
  getRoomApi,
  joinRoomApi,
  nextRoomTrackApi,
  previousRoomTrackApi,
  removeFromRoomQueueApi,
  updateRoomPlaybackApi,
} from '#/utils/api'
import { useUserStore } from '#/store/user'
import { RootSkeleton } from '#/components/visual/Skeletons'
import { Button } from '#/components/ui/button'

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
    <div className="relative min-h-dvh w-full overflow-hidden">
      <LightRays mouseInfluence={0.5} />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-start md:justify-between gap-3 sm:gap-5 p-3 sm:p-4 md:p-6 pb-28">
        <Header />
        <RootSkeleton />
      </div>
    </div>
  )
}

function RoomError({ error }: ErrorComponentProps) {
  const message =
    error instanceof Error ? error.message : 'Room not found or server unavailable.'

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex items-center justify-center p-4">
      <LightRays mouseInfluence={0.5} />
      <div className="relative z-10 w-full max-w-md mx-auto space-y-4 text-center">
        <div className="jam-card rounded-2xl p-6 sm:p-8 border border-border/60 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive">
            <Radio className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Unable to Join Room
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed wrap-break-words">
              {message}
            </p>
          </div>
          <div className="pt-2">
            <Button
              render={<Link to="/" />}
              size="sm"
              className="h-9 px-4 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <Home className="mr-1.5 h-3.5 w-3.5" />
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoomPage() {
  const { roomId } = Route.useParams()
  const { data: room } = useSuspenseQuery(roomQueryOptions(roomId))
  const { userId, userName } = useUserStore()
  const queryClient = useQueryClient()

  const currentItem = room.queue.length > 0 ? room.queue[0] : null
  const currentSong = currentItem?.track
  const hasHistory = room.history.length > 0

  console.debug(`[ROOM]: ${userName} joining ${roomId.slice(0, 5)}`)

  const addToQueueMutation = useMutation({
    mutationFn: (song: Music | Music[]) => addToRoomQueueApi(roomId, userId, song),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['room', roomId], data.room)
      const title = Array.isArray(variables)
        ? `${variables.length} tracks`
        : variables.title
      toast.success('Added to Room Queue', { description: title })
    },

    onError: (err: Error) => {
      toast.error('Failed to add track', { description: err.message })
    },
  })

  const removeFromQueueMutation = useMutation({
    mutationFn: (queueItemId: string) =>
      removeFromRoomQueueApi(roomId, userId, queueItemId),
    onSuccess: (data) => {
      queryClient.setQueryData(['room', roomId], data.room)
      toast.info('Removed from Room Queue')
    },
    onError: (err: Error) => {
      toast.error('Failed to remove track', { description: err.message })
    },
  })

  const nextTrackMutation = useMutation({
    mutationFn: () => nextRoomTrackApi(roomId, userId),
    onSuccess: (data) => {
      queryClient.setQueryData(['room', roomId], data.room)
    },
    onError: (err: Error) => {
      toast.error('Failed to skip track', { description: err.message })
    },
  })

  const previousTrackMutation = useMutation({
    mutationFn: () => previousRoomTrackApi(roomId, userId),
    onSuccess: (data) => {
      queryClient.setQueryData(['room', roomId], data.room)
    },
    onError: (err: Error) => {
      toast.error('Failed to play previous track', { description: err.message })
    },
  })

  const updatePlaybackMutation = useMutation({
    mutationFn: (payload: { isPlaying: boolean; seekTime: number }) =>
      updateRoomPlaybackApi(roomId, userId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['room', roomId], data.room)
    },
    onError: (err: Error) => {
      toast.error('Failed to sync playback', { description: err.message })
    },
  })

  useEffect(() => {
    return () => {
      console.debug(`[ROOM]: ${userName} leaving ${roomId.slice(0, 5)}`)
    }
  }, [roomId, userId, userName])

  const songDuration = currentSong?.duration ?? 0
  const elapsed =
    room.isPlaying && room.updatedAt ? (Date.now() - room.updatedAt) / 1000 : 0
  const rawSeek = (room.seekTime || 0) + elapsed
  const targetSeekTime =
    songDuration > 0 ? Math.min(Math.max(0, rawSeek), songDuration - 0.5) : 0

  return (
    <div className="relative min-h-dvh w-full overflow-y-auto md:h-dvh md:max-h-dvh md:overflow-hidden">
      <LightRays mouseInfluence={0.5} />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-start md:justify-between gap-3 sm:gap-5 p-3 sm:p-4 md:p-6 pb-32 sm:pb-36 md:h-full md:max-h-full md:pb-28">
        <Header />
        <div className="my-auto flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 sm:gap-6 md:flex-row md:items-stretch max-w-5xl mx-auto md:h-[calc(100dvh-170px)] md:max-h-155 lg:max-h-165">
          <MusicCard currentSong={currentSong} addedBy={currentItem?.addedBy} />
          <QueueCard
            queue={room.queue}
            history={room.history}
            onAddToQueue={(song) => addToQueueMutation.mutate(song)}
            onPlayNext={(song) => addToQueueMutation.mutate(song)}
            onRemoveFromQueue={(queueItemId) =>
              removeFromQueueMutation.mutate(queueItemId)
            }
          />
        </div>
        <div className="fixed bottom-3 sm:bottom-4 left-0 right-0 z-50 px-3 sm:px-6 max-w-4xl mx-auto pointer-events-none">
          <div className="pointer-events-auto w-full">
            <MusicController
              currentSong={currentSong}
              hasHistory={hasHistory}
              targetSeekTime={targetSeekTime}
              onNext={() => nextTrackMutation.mutate()}
              onPrevious={() => previousTrackMutation.mutate()}
              onSeek={(seekTime) =>
                updatePlaybackMutation.mutate({ isPlaying: room.isPlaying, seekTime })
              }
              isPlaying={room.isPlaying}
              onPlayPause={(isPlaying) =>
                updatePlaybackMutation.mutate({ isPlaying, seekTime: targetSeekTime })
              }
              onError={() => nextTrackMutation.mutate()}
            />
          </div>
        </div>
        <Toaster theme="system" />
      </div>
    </div>
  )
}
