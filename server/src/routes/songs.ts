import { Hono } from "hono";
import { getStreamUrl, search } from "../services/youtube";

const router = new Hono()
  .get("/search", async (c) => {
    const query = c.req.query("q");
    if (!query) return c.json({ error: "Missing query parameter 'q'" }, 400);

    try {
      const res = await search(query);
      return c.json(res);
    } catch (e: any) {
      console.log(e);
      return c.json({ error: String(e.message) }, 500);
    }
  })
  .get("/stream/:songId", async (c) => {
    const songId = c.req.param("songId");
    if (!songId) return c.json({ error: "Missing songId" }, 400);

    try {
      const url = await getStreamUrl(songId);

      const headers = new Headers();
      const range = c.req.header("Range");
      if (range) {
        headers.set("Range", range);
      }
      const userAgent = c.req.header("User-Agent");
      if (userAgent) {
        headers.set("User-Agent", userAgent);
      }

      const res = await fetch(url, {
        headers,
      });

      return new Response(res.body, {
        status: res.status,
        headers: {
          "Content-Type": res.headers.get("Content-Type") ?? "audio/webm",
          "Content-Length": res.headers.get("Content-Length") ?? "",
          "Content-Range": res.headers.get("Content-Range") ?? "",
          "Accept-Ranges": "bytes",
        },
      });
    } catch (e: any) {
      console.log(e);
      return c.json({ error: String(e.message) }, 500);
    }
  });

export default router;
