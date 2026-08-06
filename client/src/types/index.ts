export interface Music {
  id: string
  title: string
  uploader: string
  duration: number
  thumbnailUrl: string
}

export interface User {
  userId: string
  userName: string
}

export interface QueueItem {
  queueItemId: string
  track: Music
  addedBy?: {
    userId: string
    userName: string
  }
}

export interface Room {
  id: string
  name: string
  hostId: string
  users: User[]
  queue: QueueItem[]
  history: QueueItem[]
  isPlaying: boolean
  seekTime: number
  updatedAt: number
}

