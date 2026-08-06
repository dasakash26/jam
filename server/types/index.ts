export interface User {
  userId: string
  userName: string
  timeOutId?: ReturnType<typeof setTimeout>
}

export interface Music {
  id: string
  title: string
  uploader: string
  duration: number
  thumbnailUrl: string
}

export interface QueueItem {
  queueItemId: string
  track: Music
  addedBy: {
    userId: string
    userName: string
  }
}

export interface Room {
  id: string
  name: string
  users: Map<string, User>
  queue: Set<QueueItem>
  history: Music[]
  isPlaying: boolean
}
