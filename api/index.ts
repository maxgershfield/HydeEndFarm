/**
 * Vercel serverless entry: Express app (routes /health, /v1/...).
 * Incoming paths are /api, /api/v1/..., etc.; runtime strips /api for this handler.
 */
import app from '../partner-api/dist/app.js'

export default app
