import type { Song } from '#/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export async function searchSongs(query: string) {
  const res = await fetch(
    `${API_URL}/api/search?q=${encodeURIComponent(query)}`,
  )

  if (!res.ok) {
    throw new Error('Failed to fetch search results')
  }

  const resj = await res.json()
  const songs: Song[] = resj.map((raw: any) => ({
    id: raw.id,
    title: raw.title,
    uploader: raw.uploader || raw.channel,
    duration: raw.duration,
    thumbnailUrl: raw.thumbnails?.[raw.thumbnails.length - 1]?.url || '',
  }))

  return songs
}
