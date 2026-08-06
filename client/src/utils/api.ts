import type { Music, Room } from '#/types'
import { ApiError } from './errors'

export function getApiUrl() {
  const apiUrl = import.meta.env.VITE_API_URL
  const serverApiUrl = import.meta.env.VITE_API_URL

  if (!apiUrl || !serverApiUrl) throw new Error('API URL not defined')

  if (typeof window !== 'undefined') {
    return apiUrl
  }
  return serverApiUrl
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
      userId: userId || crypto.randomUUID(),
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
      userId: userId || crypto.randomUUID(),
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

