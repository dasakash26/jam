import type { Music, QueueItem, Room } from '../../types'
import { NotFoundError } from '../utils/errors'

const SWEEP_INTERVAL = 15 * 1000
const STALE_THRESHOLD = 45 * 1000
const rooms = new Map<string, Room>()

let cleanUpInterval

if (!cleanUpInterval) {
  cleanUpInterval = setInterval(() => {
    rooms.forEach((room) => {
      room.users.forEach((user) => {
        const delta = Date.now() - user.pingedAt
        if (delta > STALE_THRESHOLD) room.users.delete(user.userId)
      })
      if (room.users.size === 0) {
        rooms.delete(room.id)
      }
    })
  }, SWEEP_INTERVAL)
}

function generateId(prefix = '', length = 6): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz'
  let id = ''
  do {
    id = prefix
    for (let i = 0; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  } while (rooms.has(id))
  return id
}

export function createRoom(roomName: string, userId: string, userName: string) {
  const roomId = generateId('room_', 6)

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

  room.users.set(userId, {
    userId,
    userName,
    pingedAt: Date.now(),
  })

  return room
}

export function leaveRoom(roomId: string, userId: string): void {
  const room = rooms.get(roomId)
  if (!room) return

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

  user.pingedAt = Date.now()
  return room
}

export function serializeRoom(room: Room) {
  return {
    ...room,
    users: Array.from(room.users.values()),
    queue: Array.from(room.queue),
  }
}

export function addToQueue(roomId: string, userId: string, tracks: Music[]) {
  const room = rooms.get(roomId)
  if (!room) {
    throw new NotFoundError(`Room "${roomId}" was not found`)
  }

  const user = room.users.get(userId)
  if (!user) {
    throw new NotFoundError(`session expired.`)
  }

  for (const track of tracks) {
    room.queue.add({
      queueItemId: generateId('item_', 6),
      track,
      addedBy: {
        userId,
        userName: user.userName,
      },
    })
  }

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

export function updatePlayback(
  roomId: string,
  userId: string,
  payload: { isPlaying: boolean; seekTime: number },
) {
  const room = rooms.get(roomId)
  if (!room) {
    throw new NotFoundError(`Room "${roomId}" was not found`)
  }

  const user = room.users.get(userId)
  if (!user) {
    throw new NotFoundError(`session expired.`)
  }

  room.seekTime = Math.max(0, payload.seekTime)
  room.isPlaying = payload.isPlaying
  room.updatedAt = Date.now()
  return room
}

export function togglePlayback(roomId: string, userId: string, isPlaying?: boolean) {
  const room = rooms.get(roomId)
  const nextIsPlaying = typeof isPlaying === 'boolean' ? isPlaying : !(room?.isPlaying ?? false)
  return updatePlayback(roomId, userId, { isPlaying: nextIsPlaying, seekTime: room?.seekTime ?? 0 })
}

export function seekPlayback(roomId: string, userId: string, seekTime: number) {
  const room = rooms.get(roomId)
  return updatePlayback(roomId, userId, { isPlaying: room?.isPlaying ?? false, seekTime })
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
