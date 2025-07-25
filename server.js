// server.js
import express from 'express'
import fs      from 'fs'
import path    from 'path'
import os      from 'os'
import { fileURLToPath } from 'url'
import { dirname        } from 'path'

// ─── Boilerplate for __dirname in ESM ──────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

// ─── App & Paths ──────────────────────────────────────────────────────────────
const app       = express()
const BUILD_DIR = path.join(__dirname, 'dist')

// ─── 1) Serve your built React app ────────────────────────────────────────────
app.use(express.static(BUILD_DIR))

// ─── 2) API: get the active Firefox profile folder ─────────────────────────────
app.get('/active-profile', (req, res) => {
  const roamBase  = path.join(os.homedir(), 'AppData','Roaming','Mozilla','Firefox','Profiles')
  const localBase = path.join(os.homedir(), 'AppData','Local', 'Mozilla','Firefox','Profiles')

  let dirs
  try {
    dirs = fs
      .readdirSync(roamBase, { withFileTypes: true })
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

  return res.status(404).json({ error: 'No active profile lock found' })
})

// ─── 3) Fallback: send index.html on any other route ───────────────────────────
//      Use a RegExp here instead of '*' so we avoid path‑to‑regexp issues.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'))
})

// ─── 4) Start server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
