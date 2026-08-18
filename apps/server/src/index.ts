import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { healthRouter } from './routes/health'
import { logger } from 'hono/logger'
import { uploadRouter } from './routes/upload'
import { ensureBucketExists } from './lib/s3'
import { scrapePortfolio } from './scraper/portfolio'

const PORT = process.env.PORT || 8000

const app = new Hono()

ensureBucketExists().catch((err) => {
  console.error("Failed to initialize S3 bucket:", err)
})

app.use(cors({
    origin: '*'
}))
app.use(logger())

app.route('/api/health', healthRouter)
app.route('/api/upload', uploadRouter)

// Temporary test route for LinkedIn Scraper
app.post('/api/test-scrape', async (c) => {
  const { url } = await c.req.json()
  if (!url) {
    return c.json({ error: 'Portfolio URL is required' }, 400)
  }
  try {
    const profileData = await scrapePortfolio(url)
    return c.json({ success: true, data: profileData })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default {
  port: PORT,
  fetch: app.fetch,
}