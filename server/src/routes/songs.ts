import { Hono } from 'hono';
import { CONFIG, getStreamUrl, invalidateCache, search } from '../services/youtube';
import { AppError, BadRequestError, UpstreamError, type StatusCode } from '../utils/errors';

const router = new Hono()
  .get('/search', async (c) => {
    const query = c.req.query('q')?.trim();
    if (!query) {
      throw new BadRequestError("Missing required query parameter 'q'.");
    }

    try {
      const res = await search(query);
      return c.json(res);
    } catch (e: unknown) {
      if (e instanceof AppError) throw e;
      console.error('Search Error:', e);
      const message = e instanceof Error ? e.message : String(e);
      throw new AppError(message || `Search failed for query "${query}".`, 500);
    }
  })
  .get('/stream/:songId', async (c) => {
    const songId = c.req.param('songId');
    if (!songId || !CONFIG.YOUTUBE_ID_REGEX.test(songId)) {
      throw new BadRequestError(
        `Invalid song ID format: "${songId}". Expected 11 character YouTube video ID.`,
      );
    }

    try {
      let url = await getStreamUrl(songId);

      const headers = new Headers({
        'User-Agent': CONFIG.USER_AGENT,
        Referer: CONFIG.YOUTUBE_URL,
        Origin: CONFIG.YOUTUBE_URL,
      });

      const range = c.req.header('Range');
      if (range) {
        headers.set('Range', range);
      }

      let res = await fetch(url, {
        headers,
        signal: c.req.raw.signal,
      });

      if (res.status === 403 || res.status === 404) {
        res.body?.cancel();
        invalidateCache(songId);
        url = await getStreamUrl(songId);
        res = await fetch(url, {
          headers,
          signal: c.req.raw.signal,
        });
      }

      if (!res.ok) {
        res.body?.cancel();
        throw new UpstreamError(
          `Upstream streaming server returned status ${res.status}: ${res.statusText || 'Forbidden/Not Found'}`,
          res.status as StatusCode,
        );
      }

      const resHeaders: Record<string, string> = {
        'Accept-Ranges': 'bytes',
        'Content-Type': res.headers.get('Content-Type') ?? 'audio/webm',
        'Cache-Control': 'public, max-age=3600',
      };

      if (res.headers.has('Content-Length')) {
        resHeaders['Content-Length'] = res.headers.get('Content-Length')!;
      }
      if (res.headers.has('Content-Range')) {
        resHeaders['Content-Range'] = res.headers.get('Content-Range')!;
      }

      return new Response(res.body, {
        status: res.status,
        headers: resHeaders,
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        return new Response(null, { status: 499 });
      }
      if (e instanceof AppError) throw e;
      console.error('Stream Error:', e);
      const message = e instanceof Error ? e.message : String(e);
      throw new AppError(message || `Failed to extract stream for song ID "${songId}".`, 500);
    }
  });

export default router;
