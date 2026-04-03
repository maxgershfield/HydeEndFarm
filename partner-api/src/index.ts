import app from './app.js'
import { PORT } from './config.js'

app.listen(PORT, () => {
  console.log(`Partner API http://127.0.0.1:${PORT}  (health /health, syndicate /v1/syndicate/me)`)
})
