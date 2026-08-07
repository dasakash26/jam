import type {Music, QueueItem, Room} from '../../types'
import {NotFoundError} from '../utils/errors'
import {
  ID_CHARSET,
  QUEUE_ITEM_ID_LENGTH,
  QUEUE_ITEM_ID_PREFIX,
  ROOM_HISTORY_MAX_LENGTH,
  ROOM_ID_LENGTH,
  ROOM_ID_PREFIX,
  ROOM_SWEEP_INTERVAL_MS,
  ROOM_USER_STALE_THRESHOLD_MS,
} from '../utils/config'

const rooms = new Map<string, Room>()

setInterval(() => {
  for (const [roomId, room] of rooms) {
    for (const [uid, user] of room.users) {
      if (Date.now() - user.pingedAt > ROOM_USER_STALE_THRESHOLD_MS) {
        room.users.delete(uid)
      }
    }
    if (room.users.size === 0) rooms.delete(roomId)
  }
}, ROOM_SWEEP_INTERVAL_MS)

function generateId(prefix: string, length: number): string {
  let id: string
  do {
    id = prefix
    for (let i = 0; i < length; i++) {
      id += ID_CHARSET.charAt(Math.floor(Math.random() * ID_CHARSET.length))
    }
  } while (rooms.has(id))
  return id
}

function requireRoom(roomId: string): Room {
  const room = rooms.get(roomId)
  if (!room) throw new NotFoundError(`Room "${roomId}" not found.`)
  return room
}

function requireUser(room: Room, userId: string) {
  const user = room.users.get(userId)
  if (!user) throw new NotFoundError('Session expired. Re-join the room.')
  return user
}

export function createRoom(roomName: string, userId: string, userName: string): string {
  const roomId = generateId(ROOM_ID_PREFIX, ROOM_ID_LENGTH)
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
  const room = requireRoom(roomId)
  room.users.set(userId, {userId, userName, pingedAt: Date.now()})
  return room
}

export function leaveRoom(roomId: string, userId: string): void {
  const room = rooms.get(roomId)
  if (!room) return
  room.users.delete(userId)
  if (room.users.size === 0) rooms.delete(roomId)
}

export function getRoom(roomId: string, userId: string): Room {
  const room = requireRoom(roomId)
  const user = requireUser(room, userId)
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

export function addToQueue(roomId: string, userId: string, tracks: Music[]): Room {
  const room = requireRoom(roomId)
  const user = requireUser(room, userId)

  for (const track of tracks) {
    room.queue.add({
      queueItemId: generateId(QUEUE_ITEM_ID_PREFIX, QUEUE_ITEM_ID_LENGTH),
      track,
      addedBy: {userId, userName: user.userName},
    })
  }
  return room
}

export function removeFromQueue(roomId: string, userId: string, queueItemId: string): Room {
  const room = requireRoom(roomId)
  requireUser(room, userId)

  for (const item of room.queue) {
    if (item.queueItemId === queueItemId) {
      room.queue.delete(item)
      break
    }
  }
  if (room.queue.size === 0) {
    room.isPlaying = false
  }
  return room
}

export function updatePlayback(
  roomId: string,
  userId: string,
  payload: {isPlaying: boolean; seekTime: number},
): Room {
  const room = requireRoom(roomId)
  requireUser(room, userId)
  room.seekTime = Math.max(0, payload.seekTime)
  room.isPlaying = payload.isPlaying
  room.updatedAt = Date.now()
  return room
}

export function nextTrack(roomId: string, userId: string): Room {
  const room = requireRoom(roomId)
  requireUser(room, userId)

  const [current] = room.queue
  if (current) {
    room.queue.delete(current)
    room.history.unshift(current)
    if (room.history.length > ROOM_HISTORY_MAX_LENGTH) {
      room.history.length = ROOM_HISTORY_MAX_LENGTH
    }
    room.isPlaying = room.queue.size > 0
    room.seekTime = 0
    room.updatedAt = Date.now()
  }
  return room
}

export function previousTrack(roomId: string, userId: string): Room {
  const room = requireRoom(roomId)
  requireUser(room, userId)

  if (room.history.length > 0) {
    const prev = room.history.shift()!
    room.queue = new Set<QueueItem>([prev, ...Array.from(room.queue)])
    room.isPlaying = true
    room.seekTime = 0
    room.updatedAt = Date.now()
  }
  return room
}
