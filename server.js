// server.js
import express from 'express'
import multer  from 'multer'
import fs      from 'fs'
import path    from 'path'
import os      from 'os'
import { fileURLToPath } from 'url'
import { dirname        } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

const app    = express()
const upload = multer()       // in-memory

// Serve React from /dist
app.use(express.static(path.join(__dirname, 'dist')))

/**
 * Parses the text of profiles.ini and returns the active profile folder.
 */
function parseProfilesINI(text) {
  const lines = text.split(/\r?\n/)
  let lastProfile = null
  let section = null
  const sections = []
  for (const line of lines) {
    let m
    if ((m = line.match(/^LastProfile=(\d+)$/))) {
      lastProfile = m[1]
    } else if ((m = line.match(/^\[Profile(\d+)\]$/))) {
      section = { index: m[1], folder: null, isDefault: false }
      sections.push(section)
    } else if (section && (m = line.match(/^Path=(.+)$/))) {
      section.folder = m[1].split(/[\\/]/).pop()
    } else if (section && (m = line.match(/^Default=(\d+)$/))) {
      section.isDefault = (m[1] === '1')
    }
  }
  // 1) Try LastProfile
  if (lastProfile !== null) {
    const lp = sections.find(s => s.index === lastProfile)
    if (lp && lp.folder) return lp.folder
  }
  // 2) Then Default=1
  const def = sections.find(s => s.isDefault)
  if (def && def.folder) return def.folder
  // 3) Fallback to first
  if (sections.length > 0 && sections[0].folder) return sections[0].folder

  throw new Error('No LastProfile or Default=1 found')
}

// New route: accept an uploaded profiles.ini
app.post(
  '/api/upload-profiles-ini',
  upload.single('ini'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Missing file upload field "ini"' })
    }
    try {
      const text = req.file.buffer.toString('utf8')
      const profile = parseProfilesINI(text)
      return res.json({ profile })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
)

// Fallback: React router
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
