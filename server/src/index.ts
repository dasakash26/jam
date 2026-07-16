import { Hono } from "hono";
import { logger } from "hono/logger";
import songRouter from "./routes/songs"

const app = new Hono();

app
  .use(logger())
  .get("/", async (c) => {
    return c.text("Hello Hono!");
  }).route("/api",songRouter)

export default {
  fetch: app.fetch,
  port: 8787,
};
