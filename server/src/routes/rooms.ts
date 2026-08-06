import { Hono } from 'hono'
import z from 'zod'
import { sValidator } from '@hono/standard-validator'
import {
  addToQueue,
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  nextTrack,
  previousTrack,
  removeFromQueue,
  seekPlayback,
  serializeRoom,
  togglePlayback,
} from '../services/rooms'
import { handleValidationError } from '../utils/errors'

const createRoomSchema = z.object({
  userId: z.string().trim().min(1),
  userName: z.string().trim().min(1),
  roomName: z.string().trim().min(1),
})

const getRoomSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
})

const joinRoomSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  userName: z.string().trim().min(1),
})

const leaveRoomSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
})

const musicSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  uploader: z.string().trim().min(1),
  duration: z.number().positive(),
  thumbnailUrl: z.string().trim().min(1),
})

const addToQueueSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  track: musicSchema,
})

const removeFromQueueSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  queueItemId: z.string().trim().min(1),
})

const playbackToggleSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  isPlaying: z.boolean().optional(),
})

const playbackSeekSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  seekTime: z.number().min(0),
})

const playbackActionSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
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
  .post('/playback/toggle', sValidator('json', playbackToggleSchema, handleValidationError), (c) => {
    const { roomId, userId, isPlaying } = c.req.valid('json')
    const room = togglePlayback(roomId, userId, isPlaying)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })
  .post('/playback/seek', sValidator('json', playbackSeekSchema, handleValidationError), (c) => {
    const { roomId, userId, seekTime } = c.req.valid('json')
    const room = seekPlayback(roomId, userId, seekTime)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })
  .post('/playback/next', sValidator('json', playbackActionSchema, handleValidationError), (c) => {
    const { roomId, userId } = c.req.valid('json')
    const room = nextTrack(roomId, userId)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })
  .post('/playback/previous', sValidator('json', playbackActionSchema, handleValidationError), (c) => {
    const { roomId, userId } = c.req.valid('json')
    const room = previousTrack(roomId, userId)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })

export default router

