import { Hono } from "hono";
import { logger } from "hono/logger";
import songRouter from "./routes/songs";
import { cors } from "hono/cors";

const app = new Hono();

app
  .use(
    logger(),
    cors({
      origin: "*",
    }),
  )
  .get("/", async (c) => {
    return c.text("Hello Hono!");
  })
  .route("/api", songRouter);

export default {
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8787,
};
