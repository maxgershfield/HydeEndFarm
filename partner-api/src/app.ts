import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { CORS_ORIGIN } from './config.js'
import { registerV1 } from './routes/v1.js'

const app = express()
app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  })
)
app.use(express.json({ limit: '512kb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'oasis-partner-api' })
})

registerV1(app)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

export default app
