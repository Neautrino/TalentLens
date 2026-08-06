import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { healthRouter } from './routes/health'
import { logger } from 'hono/logger'

const PORT = process.env.PORT || 8000

const app = new Hono()

app.use(cors({
    origin: '*'
}))
app.use(logger())

app.route('api/health', healthRouter)

export default {
  port: PORT,
  fetch: app.fetch,
}