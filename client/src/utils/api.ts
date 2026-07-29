import type { Music } from '#/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export async function searchMusic(query: string) {
  const res = await fetch(
    `${API_URL}/api/search?q=${encodeURIComponent(query)}`,
  )

  if (!res.ok) {
    throw new Error('Failed to fetch search results')
  }

  const resj = await res.json()
  const musicList: Music[] = resj.map((raw: any) => ({
    id: raw.id,
    title: raw.title,
    uploader: raw.uploader || raw.channel,
    duration: Number(raw.duration) || 0,
    thumbnailUrl: raw.thumbnails?.[raw.thumbnails.length - 1]?.url || '',
  }))

  return musicList
}

export function getStreamUrl(songId: string) {
  return `${API_URL}/api/stream/${songId}`
}
