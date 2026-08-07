import z from 'zod'

export const createRoomSchema = z.object({
  userId: z.string().trim().min(1),
  userName: z.string().trim().min(1),
  roomName: z.string().trim().min(1),
})

export const getRoomSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
})

export const joinRoomSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  userName: z.string().trim().min(1),
})

export const leaveRoomSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
})

export const musicSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  uploader: z.string().trim().min(1),
  duration: z.number().positive(),
  thumbnailUrl: z.string().trim().min(1),
})

export const addToQueueSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  tracks: z.array(musicSchema).min(1),
})

export const removeFromQueueSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  queueItemId: z.string().trim().min(1),
})

export const updatePlaybackSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  isPlaying: z.boolean(),
  seekTime: z.number().min(0),
})

export const playbackActionSchema = z.object({
  roomId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
})
