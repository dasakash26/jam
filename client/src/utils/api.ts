import type { Music, Room } from '#/types'
import { ApiError } from './errors'
import { generateId } from './uuid'
import { BASE_API_URL, USER_ID_PREFIX } from '#/config'

export function getApiUrl(): string {
  return BASE_API_URL;
}

function customFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)

  const fullUrl =
    url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')
      ? url
      : `${getApiUrl()}${url.startsWith('/') ? '' : '/'}${url}`

  return fetch(fullUrl, { ...init, headers })
}

async function parseApiError(res: Response, fallbackMessage: string): Promise<ApiError> {
  let message = `${fallbackMessage} (${res.status} ${res.statusText || 'Error'})`
  let code: string | undefined

  try {
    const body = await res.json()
    if (body && typeof body === 'object') {
      if (typeof body.code === 'string' && body.code.trim()) code = body.code.trim()
      if (typeof body.error === 'string' && body.error.trim()) message = body.error.trim()
      else if (typeof body.message === 'string' && body.message.trim())
        message = body.message.trim()
    }
  } catch {
    try {
      const text = await res.text()
      if (text?.trim()) message = text.trim()
    } catch {}
  }

  return new ApiError(message, res.status, code)
}

function mapRawTrack(raw: {
  id: string
  title: string
  uploader?: string
  channel?: string
  duration?: number
  thumbnails?: { url: string }[]
}): Music {
  return {
    id: raw.id,
    title: raw.title,
    uploader: raw.uploader || raw.channel || 'Unknown',
    duration: Number(raw.duration) || 0,
    thumbnailUrl: raw.thumbnails?.[raw.thumbnails.length - 1]?.url ?? '',
  }
}

export async function searchMusic(query: string): Promise<Music[]> {
  const res = await customFetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw await parseApiError(res, 'Failed to fetch search results')
  const data = await res.json()
  return (data as any[]).map(mapRawTrack)
}

export async function fetchPlaylist(playlistUrl: string): Promise<Music[]> {
  const res = await customFetch(`/api/playlist?url=${encodeURIComponent(playlistUrl)}`)
  if (!res.ok) throw await parseApiError(res, 'Failed to fetch playlist')
  const data = await res.json()
  return (data as any[]).map(mapRawTrack)
}

export function getStreamUrl(songId: string): string {
  return `${getApiUrl()}/api/stream/${songId}`
}

export async function createRoomApi(
  roomName: string,
  userName: string,
  userId?: string,
): Promise<{ roomId: string }> {
  const res = await customFetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId || generateId(USER_ID_PREFIX),
      userName,
      roomName,
    }),
  })
  if (!res.ok) throw await parseApiError(res, 'Failed to create room')
  return res.json()
}

export async function joinRoomApi(
  roomId: string,
  userName: string,
  userId?: string,
): Promise<{ success: boolean; room: Room }> {
  const res = await customFetch('/api/rooms/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId: userId || generateId(USER_ID_PREFIX), userName }),
  })
  if (!res.ok) throw await parseApiError(res, 'Failed to join room')
  return res.json()
}

export async function leaveRoomApi(roomId: string, userId: string): Promise<void> {
  customFetch('/api/rooms/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId }),
  }).catch(() => {})
}

export async function getRoomApi(roomId: string, userId: string): Promise<Room> {
  const res = await customFetch(
    `/api/rooms?roomId=${encodeURIComponent(roomId)}&userId=${encodeURIComponent(userId)}`,
  )
  if (!res.ok) throw await parseApiError(res, 'Failed to fetch room details')
  const data = (await res.json()) as { success: boolean; room: Room }
  return data.room
}

export async function addToRoomQueueApi(
  roomId: string,
  userId: string,
  trackOrTracks: Music | Music[],
): Promise<{ success: boolean; room: Room }> {
  const tracks = Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks]
  const res = await customFetch('/api/rooms/queue/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId, tracks }),
  })
  if (!res.ok) throw await parseApiError(res, 'Failed to add track(s) to room queue')
  return res.json()
}

export async function removeFromRoomQueueApi(
  roomId: string,
  userId: string,
  queueItemId: string,
): Promise<{ success: boolean; room: Room }> {
  const res = await customFetch('/api/rooms/queue/remove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId, queueItemId }),
  })
  if (!res.ok) throw await parseApiError(res, 'Failed to remove track from room queue')
  return res.json()
}

export async function updateRoomPlaybackApi(
  roomId: string,
  userId: string,
  payload: { isPlaying: boolean; seekTime: number },
): Promise<{ success: boolean; room: Room }> {
  const res = await customFetch('/api/rooms/playback/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId, ...payload }),
  })
  if (!res.ok) throw await parseApiError(res, 'Failed to update room playback')
  return res.json()
}

export async function nextRoomTrackApi(
  roomId: string,
  userId: string,
): Promise<{ success: boolean; room: Room }> {
  const res = await customFetch('/api/rooms/playback/next', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId }),
  })
  if (!res.ok) throw await parseApiError(res, 'Failed to skip to next track')
  return res.json()
}

export async function previousRoomTrackApi(
  roomId: string,
  userId: string,
): Promise<{ success: boolean; room: Room }> {
  const res = await customFetch('/api/rooms/playback/previous', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId }),
  })
  if (!res.ok) throw await parseApiError(res, 'Failed to play previous track')
  return res.json()
}
