import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS for cross-origin requests from frontend (Next.js port 3000)
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
  port: 3001,
  fetch: app.fetch,
}