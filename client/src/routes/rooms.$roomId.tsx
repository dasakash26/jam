import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  queryOptions,
  useSuspenseQuery,
  // useQueryClient,
} from '@tanstack/react-query'
import { getRoomApi, joinRoomApi } from '#/utils/api'
import { useUserStore } from '#/store/user'
import { ErrorBox } from '#/components/visual/ErrorBox'
import type { Room, User } from '#/types'

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
  const { userName } = useUserStore()

  console.debug(`[ROOM]: ${userName} joining ${roomId.slice(0, 5)}`)

  useEffect(() => {
    // queryClient.invalidateQueries({ queryKey: ['room', roomId] })
    return () => {
      console.debug(`[ROOM]: ${userName} leaving ${roomId.slice(0, 5)}`)
      // ;(async () => await leaveRoomApi(roomId, userId))()
    }
  }, [])

  return (
    <div className="p-4 sm:p-5 space-y-4">
      <h1 className="text-xl font-bold">{room.name}</h1>
      <p className="text-xs text-muted-foreground">Room ID: {room.id}</p>

      <div className="mt-4">
        <h2 className="text-sm font-semibold">Listeners ({room.users.length})</h2>
        <ul className="mt-2 space-y-1">
          {room.users.map((user: User) => (
            <li
              key={user.id}
              className="text-xs bg-secondary text-secondary-foreground p-2 rounded"
            >
              {user.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
