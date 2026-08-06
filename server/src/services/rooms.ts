import type { Music, QueueItem, Room } from '../../types'
import { NotFoundError } from '../utils/errors'

const PING_INTERVAL = 5 * 1000
const rooms = new Map<string, Room>()

export function createRoom(roomName: string, userId: string, userName: string) {
  const roomId = crypto.randomUUID()

  // setup room
  rooms.set(roomId, {
    id: roomId,
    name: roomName,
    users: new Map(),
    queue: new Set<QueueItem>(),
    history: [],
    isPlaying: false,
    seekTime: 0,
    updatedAt: Date.now(),
  })

  joinRoom(roomId, userId, userName)
  return roomId
}

export function joinRoom(roomId: string, userId: string, userName: string): Room {
  const room = rooms.get(roomId)

  if (!room) {
    throw new NotFoundError(`Unable to join room "${roomId}". Room does not exist.`)
  }

  const existingUser = room.users.get(userId)
  if (existingUser?.timeOutId) {
    clearTimeout(existingUser.timeOutId)
  }

  room.users.set(userId, {
    userId,
    userName,
    timeOutId: setTimeout(() => {
      try {
        leaveRoom(roomId, userId)
      } catch {}
    }, PING_INTERVAL),
  })

  return room
}

export function leaveRoom(roomId: string, userId: string): void {
  const room = rooms.get(roomId)
  if (!room) return

  const user = room.users.get(userId)
  if (user?.timeOutId) {
    clearTimeout(user.timeOutId)
  }

  room.users.delete(userId)
  if (room.users.size === 0) {
    rooms.delete(roomId)
  }
}

export function getRoom(roomId: string, userId: string): Room {
  const room = rooms.get(roomId)
  if (!room) {
    throw new NotFoundError(`Room "${roomId}" was not found`)
  }

  const user = room.users.get(userId)
  if (!user) {
    throw new NotFoundError(`session expired.`)
  }

  if (user.timeOutId) {
    clearTimeout(user.timeOutId)
  }

  user.timeOutId = setTimeout(() => {
    try {
      leaveRoom(roomId, userId)
    } catch {}
  }, PING_INTERVAL)

  return room
}

export function serializeRoom(room: Room) {
  return {
    ...room,
    users: Array.from(room.users.values()).map(({ timeOutId, ...u }) => u),
    queue: Array.from(room.queue),
  }
}

export function addToQueue(roomId: string, userId: string, track: Music) {
  const room = rooms.get(roomId)
  if (!room) {
    throw new NotFoundError(`Room "${roomId}" was not found`)
  }

  const user = room.users.get(userId)
  if (!user) {
    throw new NotFoundError(`session expired.`)
  }

  room.queue.add({
    queueItemId: crypto.randomUUID(),
    track,
    addedBy: {
      userId,
      userName: user.userName,
    },
  })

  return room
}

export function removeFromQueue(roomId: string, userId: string, queueItemId: string) {
  const room = rooms.get(roomId)
  if (!room) {
    throw new NotFoundError(`Room "${roomId}" was not found`)
  }

  const user = room.users.get(userId)
  if (!user) {
    throw new NotFoundError(`session expired.`)
  }

  for (const item of room.queue) {
    if (item.queueItemId === queueItemId) {
      room.queue.delete(item)
      break
    }
  }

  room.isPlaying = room.queue.size > 0
  return room
}

export function togglePlayback(roomId: string, userId: string, isPlaying?: boolean) {
  const room = rooms.get(roomId)
  if (!room) {
    throw new NotFoundError(`Room "${roomId}" was not found`)
  }

  const user = room.users.get(userId)
  if (!user) {
    throw new NotFoundError(`session expired.`)
  }

  const nextIsPlaying = typeof isPlaying === 'boolean' ? isPlaying : !room.isPlaying
  if (room.isPlaying && !nextIsPlaying) {
    const elapsed = (Date.now() - room.updatedAt) / 1000
    room.seekTime = Math.max(0, room.seekTime + elapsed)
  }

  room.isPlaying = nextIsPlaying
  room.updatedAt = Date.now()
  return room
}

export function seekPlayback(roomId: string, userId: string, seekTime: number) {
  const room = rooms.get(roomId)
  if (!room) {
    throw new NotFoundError(`Room "${roomId}" was not found`)
  }

  const user = room.users.get(userId)
  if (!user) {
    throw new NotFoundError(`session expired.`)
  }

  room.seekTime = Math.max(0, seekTime)
  room.updatedAt = Date.now()
  return room
}

export function nextTrack(roomId: string, userId: string) {
  const room = rooms.get(roomId)
  if (!room) {
    throw new NotFoundError(`Room "${roomId}" was not found`)
  }

  const user = room.users.get(userId)
  if (!user) {
    throw new NotFoundError(`session expired.`)
  }

  const queueArray = Array.from(room.queue)
  if (queueArray.length > 0) {
    const playedItem = queueArray[0]
    if (playedItem) {
      room.queue.delete(playedItem)
      room.history.unshift(playedItem)
      room.isPlaying = room.queue.size > 0
      room.seekTime = 0
      room.updatedAt = Date.now()
    }
  }

  return room
}

export function previousTrack(roomId: string, userId: string) {
  const room = rooms.get(roomId)
  if (!room) {
    throw new NotFoundError(`Room "${roomId}" was not found`)
  }

  const user = room.users.get(userId)
  if (!user) {
    throw new NotFoundError(`session expired.`)
  }

  if (room.history.length > 0) {
    const prevItem = room.history.shift()
    if (prevItem) {
      const newQueue = new Set<QueueItem>([prevItem, ...Array.from(room.queue)])
      room.queue = newQueue
      room.isPlaying = true
      room.seekTime = 0
      room.updatedAt = Date.now()
    }
  }

  return room
}
