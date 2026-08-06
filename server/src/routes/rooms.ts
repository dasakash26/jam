import { Hono } from 'hono'
import z from 'zod'
import { sValidator } from '@hono/standard-validator'
import {
  addToQueue,
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  removeFromQueue,
  serializeRoom,
} from '../services/rooms'
import { handleValidationError } from '../utils/errors'

const createRoomSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  roomName: z.string(),
})

const getRoomSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
})

const joinRoomSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  userName: z.string(),
})

const leaveRoomSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
})

const musicSchema = z.object({
  id: z.string(),
  title: z.string(),
  uploader: z.string(),
  duration: z.number(),
  thumbnailUrl: z.string(),
})

const addToQueueSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  track: musicSchema,
})

const removeFromQueueSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  queueItemId: z.string(),
})

const router = new Hono()
  .post('/', sValidator('json', createRoomSchema, handleValidationError), (c) => {
    const { userId, userName, roomName } = c.req.valid('json')
    const roomId = createRoom(roomName, userId, userName)
    return c.json({ roomId })
  })
  .get('/', sValidator('query', getRoomSchema, handleValidationError), (c) => {
    const { roomId, userId } = c.req.valid('query')
    const room = getRoom(roomId, userId)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })
  .post('/join', sValidator('json', joinRoomSchema, handleValidationError), (c) => {
    const { roomId, userId, userName } = c.req.valid('json')
    const room = joinRoom(roomId, userId, userName)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })
  .post('/leave', sValidator('json', leaveRoomSchema, handleValidationError), (c) => {
    const { roomId, userId } = c.req.valid('json')
    leaveRoom(roomId, userId)
    return c.json({ success: true })
  })
  .post('/queue/add', sValidator('json', addToQueueSchema, handleValidationError), (c) => {
    const { roomId, userId, track } = c.req.valid('json')
    const room = addToQueue(roomId, userId, track)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })
  .post('/queue/remove', sValidator('json', removeFromQueueSchema, handleValidationError), (c) => {
    const { roomId, userId, queueItemId } = c.req.valid('json')
    const room = removeFromQueue(roomId, userId, queueItemId)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })

export default router

