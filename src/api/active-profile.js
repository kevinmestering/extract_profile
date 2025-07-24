// api/active-profile.js
import fs   from 'fs'
import path from 'path'
import os   from 'os'

export default async function handler(request, response) {
  const roamBase = path.join(os.homedir(), 'AppData','Roaming','Mozilla','Firefox','Profiles')
  const localBase = path.join(os.homedir(), 'AppData','Local','Mozilla','Firefox','Profiles')

  let dirs
  try {
    dirs = fs.readdirSync(roamBase, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
  } catch (err) {
    return response.status(500).json({ error: `Cannot list profiles: ${err.message}` })
  }

  for (const name of dirs) {
    const locks = [
      path.join(roamBase,  name, 'parent.lock'),
      path.join(roamBase,  name, 'lock'),
      path.join(localBase, name, 'parent.lock'),
      path.join(localBase, name, 'lock'),
    ]
    if (locks.some(fp => fs.existsSync(fp))) {
      return response.status(200).json({ profile: name })
    }
  }

  return response.status(404).json({ error: 'No active profile lock found' })
}
