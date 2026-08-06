import { Hono } from 'hono'
import { cors } from 'hono/cors'

const PORT = process.env.PORT || 8000

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('TalentLens Bun + Hono API Server is active!')
})

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'talentlens-server',
    timestamp: new Date().toISOString(),
  })
})

export default {
  port: PORT,
  fetch: app.fetch,
}