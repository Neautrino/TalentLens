import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { healthRouter } from './routes/health'
import { logger } from 'hono/logger'
import { uploadRouter } from './routes/upload'

const PORT = process.env.PORT || 8000

const app = new Hono()

app.use(cors({
    origin: '*'
}))
app.use(logger())

app.route('/api/health', healthRouter)
app.route('/api/upload', uploadRouter)

export default {
  port: PORT,
  fetch: app.fetch,
}