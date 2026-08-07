import crypto from 'node:crypto'
import {UpstreamError, type StatusCode} from '../utils/errors'
import {
  SAAVN_API_BASE,
  SAAVN_API_VERSION,
  SAAVN_DES_KEY,
  SAAVN_IMAGE_SMALL_SIZES,
  SAAVN_IMAGE_TARGET_SIZE,
  SAAVN_QUALITY_FALLBACKS,
  SAAVN_SEARCH_RESULTS_LIMIT,
  SAAVN_TARGET_QUALITY,
  STREAM_CACHE_EVICT_COUNT,
  STREAM_CACHE_MAX_SIZE,
  STREAM_CACHE_TTL_MS,
  STREAM_CACHE_CONTROL,
  STREAM_DEFAULT_CONTENT_TYPE,
} from '../utils/config'

export interface TrackEntry {
  id: string
  title: string
  uploader?: string
  channel?: string
  duration?: number
  thumbnails?: Array<{url: string}>
}

const DES_KEY = Buffer.from(SAAVN_DES_KEY, 'utf-8')
const urlCache = new Map<string, {url: string; expiresAt: number}>()

function decryptMediaUrl(encryptedUrl: string): string {
  const decipher = crypto.createDecipheriv('des-ecb', DES_KEY, null)
  decipher.setAutoPadding(true)
  let decrypted = decipher.update(Buffer.from(encryptedUrl, 'base64'), undefined, 'utf-8')
  decrypted += decipher.final('utf-8')
  for (const quality of SAAVN_QUALITY_FALLBACKS) {
    if (quality !== SAAVN_TARGET_QUALITY) {
      decrypted = decrypted.replace(quality, SAAVN_TARGET_QUALITY)
    }
  }
  return decrypted
}

function cleanHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function resolveImageUrl(image: unknown): string {
  let raw = ''
  if (typeof image === 'string') {
    raw = image
  } else if (Array.isArray(image) && image.length > 0) {
    const last = image[image.length - 1]
    raw = typeof last === 'string' ? last : (last?.url ?? last?.link ?? '')
  }
  if (!raw.trim()) return ''
  for (const small of SAAVN_IMAGE_SMALL_SIZES) {
    raw = raw.replace(small, SAAVN_IMAGE_TARGET_SIZE)
  }
  return raw
}

function resolveArtistName(song: Record<string, any>): string {
  if (
    typeof song.more_info?.primary_artists === 'string' &&
    song.more_info.primary_artists.trim()
  ) {
    return song.more_info.primary_artists
  }
  if (typeof song.more_info?.singers === 'string' && song.more_info.singers.trim()) {
    return song.more_info.singers
  }
  const primary = song.more_info?.artistMap?.primary_artists
  if (Array.isArray(primary) && primary.length > 0) {
    const names = primary.map((a: any) => a.name).filter(Boolean)
    if (names.length > 0) return names.join(', ')
  }
  const artists = song.more_info?.artistMap?.artists
  if (Array.isArray(artists) && artists.length > 0) {
    const names = artists.map((a: any) => a.name).filter(Boolean)
    if (names.length > 0) return names.join(', ')
  }
  return (
    song.more_info?.music ||
    song.more_info?.singers ||
    song.more_info?.primary_artists ||
    (typeof song.subtitle === 'string' && song.subtitle.trim() ? song.subtitle : '') ||
    'Unknown Artist'
  )
}

function mapSongToTrack(song: Record<string, any>): TrackEntry {
  const imageUrl = resolveImageUrl(song.image)
  return {
    id: song.id,
    title: cleanHtml(song.title || 'Untitled Track'),
    uploader: cleanHtml(resolveArtistName(song)),
    channel: cleanHtml(song.more_info?.album || ''),
    duration: parseInt(song.more_info?.duration || song.duration || '0', 10),
    thumbnails: imageUrl ? [{url: imageUrl}] : [],
  }
}

function saavnUrl(call: string, params: Record<string, string>): string {
  const p = new URLSearchParams({
    __call: call,
    _format: 'json',
    _marker: '0',
    api_version: SAAVN_API_VERSION,
    ...params,
  })
  return `${SAAVN_API_BASE}?${p.toString()}`
}

function evictOldestCacheEntries(): void {
  const iterator = urlCache.keys()
  for (let i = 0; i < STREAM_CACHE_EVICT_COUNT; i++) {
    const {value, done} = iterator.next()
    if (done) break
    urlCache.delete(value)
  }
}

export function invalidateCache(songId: string): void {
  urlCache.delete(songId)
}

function scoreTrack(track: TrackEntry, query: string): number {
  const q = query.toLowerCase().trim()
  const title = track.title.toLowerCase()
  const uploader = (track.uploader || '').toLowerCase()

  let score = 0
  if (title === q) score += 100
  else if (title.startsWith(q)) score += 60
  else if (title.includes(q)) score += 30

  if (uploader === q) score += 40
  else if (uploader.includes(q)) score += 20

  if (track.duration && track.duration > 0) score += 10
  if (track.thumbnails && track.thumbnails.length > 0) score += 5

  return score
}

export async function search(query: string): Promise<TrackEntry[]> {
  const q = query.trim()
  if (!q) return []

  if (/jiosaavn\.com\/(?:album|featured|playlist)\//i.test(q) || /list=/i.test(q)) {
    try {
      const playlistTracks = await getPlaylist(q)
      if (playlistTracks.length > 0) return playlistTracks
    } catch {
      // Fallback to text search
    }
  }

  const trackMap = new Map<string, TrackEntry>()

  const autoUrl = saavnUrl('autocomplete.get', {query: q})
  const searchUrl = saavnUrl('search.getResults', {
    p: '1',
    n: String(SAAVN_SEARCH_RESULTS_LIMIT),
    q,
  })

  const [autoResult, searchResult] = await Promise.allSettled([
    fetch(autoUrl).then((r) => (r.ok ? r.json() : null)),
    fetch(searchUrl).then((r) => (r.ok ? r.json() : null)),
  ])

  if (autoResult.status === 'fulfilled' && autoResult.value) {
    const autoData = autoResult.value as {
      topquery?: {data?: Record<string, any>[]}
      songs?: {data?: Record<string, any>[]}
    }
    const topSongs = (autoData.topquery?.data ?? []).filter((item) => item.type === 'song')
    const songsData = autoData.songs?.data ?? []

    for (const song of [...topSongs, ...songsData]) {
      if (song.id) {
        trackMap.set(song.id, mapSongToTrack(song))
      }
    }
  }

  if (searchResult.status === 'fulfilled' && searchResult.value) {
    const searchData = searchResult.value as {results?: Record<string, any>[]}
    const results = (searchData.results ?? []).filter(
      (song) => song.type === 'song' || song.more_info?.encrypted_media_url,
    )

    for (const song of results) {
      if (song.id) {
        const existing = trackMap.get(song.id)
        const mapped = mapSongToTrack(song)
        if (!existing) {
          trackMap.set(song.id, mapped)
        } else {
          trackMap.set(song.id, {
            ...existing,
            duration: existing.duration || mapped.duration,
            thumbnails: existing.thumbnails?.length ? existing.thumbnails : mapped.thumbnails,
            uploader: existing.uploader !== 'Unknown Artist' ? existing.uploader : mapped.uploader,
          })
        }
      }
    }
  }

  const tracks = Array.from(trackMap.values())
  tracks.sort((a, b) => scoreTrack(b, q) - scoreTrack(a, q))

  return tracks
}

export async function getPlaylist(input: string): Promise<TrackEntry[]> {
  const cleanInput = input.trim()
  const match =
    cleanInput.match(/(?:album\/|list=)([a-zA-Z0-9_-]+)/) || cleanInput.match(/^([a-zA-Z0-9_-]+)$/)
  const albumId = match?.[1] ?? cleanInput

  const url = saavnUrl('content.getAlbumDetails', {albumid: albumId})
  const res = await fetch(url)
  if (!res.ok) return search(cleanInput)

  try {
    const data = (await res.json()) as {list?: Record<string, any>[]}
    const list = data.list ?? []
    if (list.length === 0) return search(cleanInput)
    return list.map(mapSongToTrack)
  } catch {
    return search(cleanInput)
  }
}

export async function getStreamUrl(songId: string): Promise<string> {
  const cached = urlCache.get(songId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url
  }

  const url = saavnUrl('song.getDetails', {pids: songId})
  const res = await fetch(url)
  if (!res.ok) {
    throw new UpstreamError(
      `JioSaavn song details failed with status ${res.status}`,
      res.status as StatusCode,
    )
  }

  const data = (await res.json()) as Record<string, any>
  const song = Object.values(data)[0]

  if (!song || !song.more_info?.encrypted_media_url) {
    throw new UpstreamError(`Failed to resolve audio stream for song "${songId}".`, 404)
  }

  const streamUrl = decryptMediaUrl(song.more_info.encrypted_media_url)

  if (urlCache.size >= STREAM_CACHE_MAX_SIZE) {
    evictOldestCacheEntries()
  }
  urlCache.set(songId, {url: streamUrl, expiresAt: Date.now() + STREAM_CACHE_TTL_MS})
  console.log(`[saavn] cached 320kbps stream for "${songId}"`)

  return streamUrl
}

export async function fetchAudioStream(
  songId: string,
  rangeHeader?: string,
  signal?: AbortSignal,
): Promise<Response> {
  let streamUrl = await getStreamUrl(songId)

  const headers = new Headers()
  if (rangeHeader) headers.set('Range', rangeHeader)

  let res = await fetch(streamUrl, {headers, signal})

  if (res.status === 403 || res.status === 404) {
    res.body?.cancel()
    invalidateCache(songId)
    streamUrl = await getStreamUrl(songId)
    res = await fetch(streamUrl, {headers, signal})
  }

  if (!res.ok) {
    res.body?.cancel()
    throw new UpstreamError(
      `Upstream CDN returned ${res.status}: ${res.statusText || 'error'}`,
      res.status as StatusCode,
    )
  }

  const resHeaders: Record<string, string> = {
    'Accept-Ranges': 'bytes',
    'Content-Type': res.headers.get('Content-Type') ?? STREAM_DEFAULT_CONTENT_TYPE,
    'Cache-Control': STREAM_CACHE_CONTROL,
  }
  const contentLength = res.headers.get('Content-Length')
  const contentRange = res.headers.get('Content-Range')
  if (contentLength) resHeaders['Content-Length'] = contentLength
  if (contentRange) resHeaders['Content-Range'] = contentRange

  return new Response(res.body, {status: res.status, headers: resHeaders})
}
