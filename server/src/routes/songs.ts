import {Hono} from 'hono'
import {fetchAudioStream, getPlaylist, search} from '../services/saavn'
import {AppError, BadRequestError} from '../utils/errors'

const router = new Hono()
  .get('/search', async (c) => {
    const query = c.req.query('q')?.trim()
    if (!query) {
      throw new BadRequestError("Missing required query parameter 'q'.")
    }

    try {
      const res = await search(query)
      return c.json(res)
    } catch (e: unknown) {
      if (e instanceof AppError) throw e
      console.error('Search Error:', e)
      const message = e instanceof Error ? e.message : String(e)
      throw new AppError(message || `Search failed for query "${query}".`, 500)
    }
  })
  .get('/playlist', async (c) => {
    const url = c.req.query('url')?.trim() || c.req.query('q')?.trim()
    if (!url) {
      throw new BadRequestError("Missing required query parameter 'url' or 'q'.")
    }

    try {
      const res = await getPlaylist(url)
      return c.json(res)
    } catch (e: unknown) {
      if (e instanceof AppError) throw e
      console.error('Playlist Fetch Error:', e)
      const message = e instanceof Error ? e.message : String(e)
      throw new AppError(message || `Failed to fetch playlist for "${url}".`, 500)
    }
  })
  .get('/stream/:songId', async (c) => {
    const songId = c.req.param('songId')?.trim()
    if (!songId) {
      throw new BadRequestError('Missing required song ID.')
    }

    try {
      return await fetchAudioStream(songId, c.req.header('Range'), c.req.raw.signal)
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        return new Response(null, {status: 499})
      }
      if (e instanceof AppError) throw e
      console.error('Stream Error:', e)
      const message = e instanceof Error ? e.message : String(e)
      throw new AppError(message || `Failed to extract stream for song ID "${songId}".`, 500)
    }
  })

export default router
