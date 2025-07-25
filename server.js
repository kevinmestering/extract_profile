// server.js
import express from 'express'
import fs      from 'fs'
import path    from 'path'
import os      from 'os'
import { fileURLToPath } from 'url'
import { dirname        } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

const app       = express()
const BUILD_DIR = path.join(__dirname, 'dist')

// 1) Serve React build
app.use(express.static(BUILD_DIR))

// 2) API endpoint for active profile
app.get('/api/active-profile', (req, res) => {
  const roamBase  = path.join(os.homedir(), 'AppData','Roaming','Mozilla','Firefox','Profiles')
  const localBase = path.join(os.homedir(), 'AppData','Local', 'Mozilla','Firefox','Profiles')

  let dirs
  try {
    dirs = fs.readdirSync(roamBase, { withFileTypes: true })
             .filter(d => d.isDirectory())
             .map(d => d.name)
  } catch (err) {
    return res.status(500).json({ error: `Cannot list profiles: ${err.message}` })
  }

  for (const name of dirs) {
    const locks = [
      path.join(roamBase,  name, 'parent.lock'),
      path.join(roamBase,  name, 'lock'),
      path.join(localBase, name, 'parent.lock'),
      path.join(localBase, name, 'lock'),
    ]
    if (locks.some(fp => fs.existsSync(fp))) {
      return res.json({ profile: name })
    }
  }

  res.status(404).json({ error: 'No active profile lock found' })
})

// 3) Fallback: serve index.html for any other request (client‑side routing)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'))
})

// 4) Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
