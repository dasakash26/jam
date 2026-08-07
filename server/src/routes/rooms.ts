import {Hono} from 'hono'
import {sValidator} from '@hono/standard-validator'
import {
  addToQueue,
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  nextTrack,
  previousTrack,
  removeFromQueue,
  serializeRoom,
  updatePlayback,
} from '../services/rooms'
import {
  addToQueueSchema,
  createRoomSchema,
  getRoomSchema,
  joinRoomSchema,
  leaveRoomSchema,
  playbackActionSchema,
  removeFromQueueSchema,
  updatePlaybackSchema,
} from '../schemas/rooms'
import {handleValidationError} from '../utils/errors'

const router = new Hono()
  .post('/', sValidator('json', createRoomSchema, handleValidationError), (c) => {
    const {userId, userName, roomName} = c.req.valid('json')
    const roomId = createRoom(roomName, userId, userName)
    return c.json({roomId})
  })
  .get('/', sValidator('query', getRoomSchema, handleValidationError), (c) => {
    const {roomId, userId} = c.req.valid('query')
    const room = getRoom(roomId, userId)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })
  .post('/join', sValidator('json', joinRoomSchema, handleValidationError), (c) => {
    const {roomId, userId, userName} = c.req.valid('json')
    const room = joinRoom(roomId, userId, userName)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })
  .post('/leave', sValidator('json', leaveRoomSchema, handleValidationError), (c) => {
    const {roomId, userId} = c.req.valid('json')
    leaveRoom(roomId, userId)
    return c.json({success: true})
  })
  .post('/queue/add', sValidator('json', addToQueueSchema, handleValidationError), (c) => {
    const {roomId, userId, tracks} = c.req.valid('json')
    const room = addToQueue(roomId, userId, tracks)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })
  .post('/queue/remove', sValidator('json', removeFromQueueSchema, handleValidationError), (c) => {
    const {roomId, userId, queueItemId} = c.req.valid('json')
    const room = removeFromQueue(roomId, userId, queueItemId)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })
  .post(
    '/playback/update',
    sValidator('json', updatePlaybackSchema, handleValidationError),
    (c) => {
      const {roomId, userId, isPlaying, seekTime} = c.req.valid('json')
      const room = updatePlayback(roomId, userId, {isPlaying, seekTime})
      return c.json({
        success: true,
        room: serializeRoom(room),
      })
    },
  )
  .post('/playback/next', sValidator('json', playbackActionSchema, handleValidationError), (c) => {
    const {roomId, userId} = c.req.valid('json')
    const room = nextTrack(roomId, userId)
    return c.json({
      success: true,
      room: serializeRoom(room),
    })
  })
  .post(
    '/playback/previous',
    sValidator('json', playbackActionSchema, handleValidationError),
    (c) => {
      const {roomId, userId} = c.req.valid('json')
      const room = previousTrack(roomId, userId)
      return c.json({
        success: true,
        room: serializeRoom(room),
      })
    },
  )

export default router
