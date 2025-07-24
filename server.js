// server.js (ES‑module or CJS; match your project)
import express from 'express'    // or: const express = require('express')
import fs      from 'fs'
import path    from 'path'
import os      from 'os'

const app = express()

app.get('/active-profile', (req, res) => {
  const roamBase = path.join(
    os.homedir(),
    'AppData','Roaming',
    'Mozilla','Firefox','Profiles'
  )
  const localBase = path.join(
    os.homedir(),
    'AppData','Local',
    'Mozilla','Firefox','Profiles'
  )

  let dirs;
  try {
    // read only directories under Roaming\Profiles
    dirs = fs.readdirSync(roamBase, { withFileTypes: true })
             .filter(d => d.isDirectory())
             .map(d => d.name)
  } catch (err) {
    return res.status(500).json({ error: `Cannot list profiles: ${err.message}` })
  }

  // for each profile folder name...
  for (const name of dirs) {
    // candidate lock paths
    const candidates = [
      path.join(roamBase,  name, 'parent.lock'),
      path.join(roamBase,  name, 'lock'),         // older FF versions
      path.join(localBase, name, 'parent.lock'),
      path.join(localBase, name, 'lock'),
    ]

    // if any lock file exists → this is the active profile
    if (candidates.some(fp => fs.existsSync(fp))) {
      return res.json({ profile: name })
    }
  }

  // none found
  res.status(404).json({ error: 'No active profile lock found' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`)
})
