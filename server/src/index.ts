import { Hono } from "hono";
import { logger } from "hono/logger";
import songRouter from "./routes/songs";
import roomRouter from "./routes/rooms";
import { cors } from "hono/cors";

const app = new Hono();

app
  .use(
    logger(),
    cors({
      origin: "*",
      exposeHeaders: ["Content-Length", "Content-Range", "Accept-Ranges"],
    }),
  )
  .get("/", async (c) => {
    return c.text("Hello Hono!");
  })
  .route("/api/rooms", roomRouter)
  .route("/api", songRouter)

export default {
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8787,
};
