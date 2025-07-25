// server.js
import express from 'express'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ========== Serve React Static Frontend ==========
const buildPath = path.join(__dirname, 'dist')
app.use(express.static(buildPath))

// ========== API: Get Active Firefox Profile ==========
app.get('/active-profile', (req, res) => {
  const roamBase = path.join(
    os.homedir(), 'AppData', 'Roaming', 'Mozilla', 'Firefox', 'Profiles'
  )
  const localBase = path.join(
    os.homedir(), 'AppData', 'Local', 'Mozilla', 'Firefox', 'Profiles'
  )

  let dirs
  try {
    dirs = fs.readdirSync(roamBase, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
  } catch (err) {
    return res.status(500).json({ error: `Cannot list profiles: ${err.message}` })
  }

  for (const name of dirs) {
    const candidates = [
      path.join(roamBase,  name, 'parent.lock'),
      path.join(roamBase,  name, 'lock'),
      path.join(localBase, name, 'parent.lock'),
      path.join(localBase, name, 'lock'),
    ]

    if (candidates.some(fp => fs.existsSync(fp))) {
      return res.json({ profile: name })
    }
  }

  res.status(404).json({ error: 'No active profile lock found' })
})

// ========== Fallback for React Router ==========
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'))
})

// ========== Start Server ==========
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
