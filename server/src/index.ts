import {Hono} from 'hono'
import {logger} from 'hono/logger'
import {cors} from 'hono/cors'
import songRouter from './routes/songs'
import roomRouter from './routes/rooms'
import {handleError} from './middleware/error'
import {env} from './utils/env'
import {CORS_EXPOSED_HEADERS, CORS_MAX_AGE, SERVER_IDLE_TIMEOUT} from './utils/config'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: '*',
    exposeHeaders: CORS_EXPOSED_HEADERS,
    maxAge: CORS_MAX_AGE,
  }),
)

app.use(logger())

app
  .get('/', (c) => c.text('JAM API'))
  .route('/api/rooms', roomRouter)
  .route('/api', songRouter)

app.onError(handleError)

export default {
  fetch: app.fetch,
  port: env.PORT,
  hostname: '0.0.0.0',
  idleTimeout: SERVER_IDLE_TIMEOUT,
}
