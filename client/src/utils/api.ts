import type { Music, Room } from '#/types'
import { ApiError } from './errors'
import { safeUUID } from './uuid'

export function getApiUrl() {
  if (typeof window !== 'undefined') {
    const envUrl = import.meta.env.VITE_API_URL
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl
    }
    const hostname = window.location.hostname
    const port = window.location.port ? `:${window.location.port}` : ''
    return `${window.location.protocol}//${hostname}${port}`
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3000'
}

async function parseApiError(res: Response, fallbackMessage: string): Promise<ApiError> {
  let message = `${fallbackMessage} (${res.status} ${res.statusText || 'Error'})`
  let code: string | undefined

  try {
    const body = await res.json()
    if (body && typeof body === 'object') {
      if (typeof body.code === 'string' && body.code.trim()) {
        code = body.code.trim()
      }
      if (typeof body.error === 'string' && body.error.trim()) {
        message = body.error.trim()
      } else if (typeof body.message === 'string' && body.message.trim()) {
        message = body.message.trim()
      }
    }
  } catch {
    try {
      const text = await res.text()
      if (text && text.trim()) message = text.trim()
    } catch {}
  }

  return new ApiError(message, res.status, code)
}

export async function searchMusic(query: string) {
  const baseUrl = getApiUrl()
  const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}`)

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to fetch search results')
  }

  const resj = await res.json()
  const musicList: Music[] = resj.map(
    (raw: {
      id: string
      title: string
      uploader?: string
      channel?: string
      duration?: number
      thumbnails?: { url: string }[]
    }) => ({
      id: raw.id,
      title: raw.title,
      uploader: raw.uploader || raw.channel || 'Unknown',
      duration: Number(raw.duration) || 0,
      thumbnailUrl: raw.thumbnails?.[raw.thumbnails.length - 1]?.url || '',
    }),
  )

  return musicList
}

export function getStreamUrl(songId: string) {
  return `${getApiUrl()}/api/stream/${songId}`
}

export async function createRoomApi(roomName: string, userName: string, userId?: string) {
  const baseUrl = getApiUrl()
  const res = await fetch(`${baseUrl}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId || safeUUID(),
      userName,
      roomName,
    }),
  })

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to create room')
  }

  return (await res.json()) as { roomId: string }
}

export async function joinRoomApi(roomId: string, userName: string, userId?: string) {
  const baseUrl = getApiUrl()
  const res = await fetch(`${baseUrl}/api/rooms/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomId,
      userId: userId || safeUUID(),
      userName,
    }),
  })

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to join room')
  }

  return (await res.json()) as { success: boolean; room: Room }
}

export async function leaveRoomApi(roomId: string, userId: string) {
  const baseUrl = getApiUrl()
  fetch(`${baseUrl}/api/rooms/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId }),
  }).catch(() => {})
}

export async function getRoomApi(roomId: string, userId: string) {
  const baseUrl = getApiUrl()
  const res = await fetch(
    `${baseUrl}/api/rooms?roomId=${encodeURIComponent(roomId)}&userId=${encodeURIComponent(userId)}`,
  )

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to fetch room details')
  }

  const data = (await res.json()) as { success: boolean; room: Room }
  return data.room
}

export async function addToRoomQueueApi(roomId: string, userId: string, track: Music) {
  const baseUrl = getApiUrl()
  const res = await fetch(`${baseUrl}/api/rooms/queue/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId, track }),
  })

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to add track to room queue')
  }

  return (await res.json()) as { success: boolean; room: Room }
}

export async function removeFromRoomQueueApi(roomId: string, userId: string, queueItemId: string) {
  const baseUrl = getApiUrl()
  const res = await fetch(`${baseUrl}/api/rooms/queue/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId, queueItemId }),
  })

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to remove track from room queue')
  }

  return (await res.json()) as { success: boolean; room: Room }
}

export async function toggleRoomPlaybackApi(roomId: string, userId: string, isPlaying?: boolean) {
  const baseUrl = getApiUrl()
  const res = await fetch(`${baseUrl}/api/rooms/playback/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId, isPlaying }),
  })

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to toggle room playback')
  }

  return (await res.json()) as { success: boolean; room: Room }
}

export async function seekRoomPlaybackApi(roomId: string, userId: string, seekTime: number) {
  const baseUrl = getApiUrl()
  const res = await fetch(`${baseUrl}/api/rooms/playback/seek`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId, seekTime }),
  })

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to seek room playback')
  }

  return (await res.json()) as { success: boolean; room: Room }
}

export async function nextRoomTrackApi(roomId: string, userId: string) {
  const baseUrl = getApiUrl()
  const res = await fetch(`${baseUrl}/api/rooms/playback/next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId }),
  })

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to skip to next track')
  }

  return (await res.json()) as { success: boolean; room: Room }
}

export async function previousRoomTrackApi(roomId: string, userId: string) {
  const baseUrl = getApiUrl()
  const res = await fetch(`${baseUrl}/api/rooms/playback/previous`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId }),
  })

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to play previous track')
  }

  return (await res.json()) as { success: boolean; room: Room }
}


