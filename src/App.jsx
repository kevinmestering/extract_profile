// src/App.jsx
import { useState } from 'react'

export default function App() {
  const [profile, setProfile] = useState('')
  const [error, setError]     = useState(null)

  function onFileChange(e) {
    setError(null)
    setProfile('')
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = reader.result
        // parse profiles.ini
        const lines = text.split(/\r?\n/)
        let lastIdx = null
        let section = null
        const profiles = []

        for (const line of lines) {
          let m
          if ((m = line.match(/^LastProfile=(\d+)$/))) {
            lastIdx = m[1]
          }
          if ((m = line.match(/^\[Profile(\d+)\]$/))) {
            section = { index: m[1] }
            profiles.push(section)
          } else if (section) {
            if ((m = line.match(/^Path=(.+)$/))) {
              section.folder = m[1].split(/[\\/]/).pop()
            }
            if ((m = line.match(/^Name=(.+)$/))) {
              section.name = m[1]
            }
          }
        }

        const active = profiles.find(p => p.index === lastIdx)
        if (!active) throw new Error('No default profile found')
        setProfile(active.folder || active.name)
      } catch (err) {
        setError(err.message)
      }
    }
    reader.onerror = () => setError('Failed to read file')
    reader.readAsText(file)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <label style={{ display: 'block', marginBottom: '1rem' }}>
        Upload your <code>profiles.ini</code>:
        <input
          type="file"
          accept=".ini,text/plain"
          onChange={onFileChange}
          style={{ display: 'block', marginTop: '.5rem' }}
        />
      </label>

      {error && (
        <p style={{ color: 'red' }}>
          Error: {error}
        </p>
      )}

      {profile && (
        <p
          id="current-profile-text"
          style={{ marginTop: '1rem', fontSize: '1.2rem' }}
        >
          Current profile: <strong id="current-profile-value">{profile}</strong>
        </p>
      )}
    </div>
  )
}
