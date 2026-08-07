import { Hono } from 'hono';
import { logger } from 'hono/logger';
import songRouter from './routes/songs';
import roomRouter from './routes/rooms';
import { cors } from 'hono/cors';

import { HTTPException } from 'hono/http-exception';
import { AppError } from './utils/errors';

const app = new Hono();

app
  .use(
    logger(),
    cors({
      origin: '*',
      exposeHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges'],
    }),
  )
  .get('/', async (c) => {
    return c.text('Hello Hono!');
  })
  .route('/api/rooms', roomRouter)
  .route('/api', songRouter);

app.onError((err, c) => {
  console.error('Unhandled Server Error:', err);

  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: err.message,
        code: err.code,
      },
      err.statusCode,
    );
  }

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status,
    );
  }

  return c.json(
    {
      success: false,
      error: err.message || 'An unexpected internal server error occurred.',
    },
    500,
  );
});


export default {
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8787,
};
