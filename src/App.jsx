import { useState } from 'react'

export default function App() {
  const [profile, setProfile] = useState('')
  const [error,   setError]   = useState(null)
  const [rawIni,  setRawIni]  = useState('')

  // Parses the uploaded profiles.ini text and returns the active profile folder
  function parseProfilesINI(text) {
    const lines = text.split(/\r?\n/)
    let lastProfile = null
    let currentSection = null
    const sections = []

    for (const line of lines) {
      let m
      // 1) Capture LastProfile in the [General] section
      if ((m = line.match(/^LastProfile=(\d+)$/))) {
        lastProfile = m[1]
      }
      // 2) New profile block
      else if ((m = line.match(/^\[Profile(\d+)\]$/))) {
        currentSection = { index: m[1], folder: null, isDefault: false }
        sections.push(currentSection)
      }
      // 3) Inside a profile block: Path=…
      else if (currentSection && (m = line.match(/^Path=(.+)$/))) {
        currentSection.folder = m[1].split(/[\\/]/).pop()
      }
      // 4) Inside a profile block: Default=1
      else if (currentSection && (m = line.match(/^Default=(\d+)$/))) {
        currentSection.isDefault = (m[1] === '1')
      }
    }

    // a) Try LastProfile
    if (lastProfile !== null) {
      const lp = sections.find(s => s.index === lastProfile)
      if (lp && lp.folder) return lp.folder
    }

    // b) Fallback: the one marked Default=1
    const def = sections.find(s => s.isDefault)
    if (def && def.folder) return def.folder

    // c) FINAL fallback: pick the very first profile block
    if (sections.length > 0 && sections[0].folder) {
      return sections[0].folder
    }

    throw new Error(
      'No LastProfile or Default=1 found in profiles.ini'
    )
  }

  // Handler for when the user selects their profiles.ini file
  function onFileChange(e) {
    setError(null)
    setProfile('')
    setRawIni('')
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result
      setRawIni(text)   // optional: keep raw text for debugging
      try {
        const active = parseProfilesINI(text)
        setProfile(active)
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
        <p style={{ color: 'red' }}>Error: {error}</p>
      )}

      {profile && (
        <p id="current-profile-text" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
          Current profile: <strong id="current-profile-value">{profile}</strong>
        </p>
      )}

      {/* Optional: show raw INI for debugging */}
      {rawIni && (
        <details style={{ marginTop: '1rem' }}>
          <summary>Show raw profiles.ini</summary>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
            {rawIni}
          </pre>
        </details>
      )}
    </div>
  )
}
