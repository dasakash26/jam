import { Hono } from "hono";
import { CONFIG, getStreamUrl, invalidateCache, search } from "../services/youtube";

const router = new Hono()
  .get("/search", async (c) => {
    const query = c.req.query("q")?.trim();
    if (!query) return c.json({ error: "Missing query parameter 'q'" }, 400);

    try {
      const res = await search(query);
      return c.json(res);
    } catch (e: any) {
      console.error("Search Error:", e);
      return c.json({ error: String(e.message) }, 500);
    }
  })
  .get("/stream/:songId", async (c) => {
    const songId = c.req.param("songId");
    if (!songId || !CONFIG.YOUTUBE_ID_REGEX.test(songId)) {
      return c.json({ error: "Invalid or missing songId format" }, 400);
    }

    try {
      let url = await getStreamUrl(songId);

      const headers = new Headers({
        "User-Agent": CONFIG.USER_AGENT,
        Referer: CONFIG.YOUTUBE_URL,
        Origin: CONFIG.YOUTUBE_URL,
      });

      const range = c.req.header("Range");
      if (range) {
        headers.set("Range", range);
      }

      let res = await fetch(url, {
        headers,
      });

      if (res.status === 403 || res.status === 404) {
        invalidateCache(songId);
        url = await getStreamUrl(songId);
        res = await fetch(url, {
          headers,
        });
      }

      if (!res.ok) {
        return c.json(
          { error: `Upstream error: ${res.statusText}` },
          res.status as any
        );
      }

      const resHeaders: Record<string, string> = {
        "Accept-Ranges": "bytes",
        "Content-Type": res.headers.get("Content-Type") ?? "audio/webm",
        "Cache-Control": "public, max-age=3600",
      };

      if (res.headers.has("Content-Length")) {
        resHeaders["Content-Length"] = res.headers.get("Content-Length")!;
      }
      if (res.headers.has("Content-Range")) {
        resHeaders["Content-Range"] = res.headers.get("Content-Range")!;
      }

      return new Response(res.body, {
        status: res.status,
        headers: resHeaders,
      });
    } catch (e: any) {
      if (e.name === "AbortError") {
        return new Response(null, { status: 499 });
      }
      console.error("Stream Error:", e);
      return c.json({ error: String(e.message) }, 500);
    }
  });

export default router;
