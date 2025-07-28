import { useState } from 'react'

export default function App() {
  const [sections, setSections] = useState([])   // all profile blocks
  const [error,    setError]    = useState(null)
  const [selected, setSelected] = useState('')   // the folder you pick

  // Parse the uploaded profiles.ini into an array of sections
  function parseProfilesINI(text) {
    const lines = text.split(/\r?\n/)
    let lastProfile = null
    let current = null
    const arr = []

    for (const line of lines) {
      let m
      if ((m = line.match(/^LastProfile=(\d+)$/))) {
        lastProfile = m[1]
      } else if ((m = line.match(/^\[Profile(\d+)\]$/))) {
        current = { index: m[1], name: null, folder: null, isDefault: false }
        arr.push(current)
      } else if (current && (m = line.match(/^Name=(.+)$/))) {
        current.name = m[1]
      } else if (current && (m = line.match(/^Path=(.+)$/))) {
        current.folder = m[1].split(/[\\/]/).pop()
      } else if (current && (m = line.match(/^Default=(\d+)$/))) {
        current.isDefault = (m[1]==='1')
      }
    }

    // auto-select if LastProfile or Default=1 present
    let auto = null
    if (lastProfile !== null) {
      auto = arr.find(s => s.index===lastProfile)
    }
    if (!auto) {
      auto = arr.find(s => s.isDefault)
    }
    return { arr, auto }
  }

  // file‐upload handler
  function onFileChange(e) {
    setError(null)
    setSelected('')
    setSections([])

    const file = e.target.files?.[0]
    if (!file) return

    const rdr = new FileReader()
    rdr.onload = () => {
      try {
        const { arr, auto } = parseProfilesINI(rdr.result)
        if (arr.length === 0) throw new Error('No [Profile] blocks found')

        setSections(arr)
        // if we found an auto‐select, pick it immediately
        if (auto?.folder) {
          setSelected(auto.folder)
        }
      } catch (err) {
        setError(err.message)
      }
    }
    rdr.onerror = () => setError('Failed to read file')
    rdr.readAsText(file)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <label style={{ display: 'block', marginBottom: '1rem' }}>
        Upload your <code>profiles.ini</code>:
        <input
          type="file"
          accept=".ini"
          onChange={onFileChange}
          style={{ display: 'block', marginTop: '.5rem' }}
        />
      </label>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {sections.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <p>Select the profile you have open:</p>
          {sections.map(s => (
            <label key={s.index} style={{ display: 'block' }}>
              <input
                type="radio"
                name="profile"
                value={s.folder}
                checked={selected === s.folder}
                onChange={() => setSelected(s.folder)}
              />{' '}
              {s.folder} {s.name ? `(${s.name})` : ''}
              {s.isDefault && ' – default'}
            </label>
          ))}
        </div>
      )}

      {selected && (
        <p id="current-profile-text" style={{ fontSize: '1.2rem' }}>
          Current profile: <strong id="current-profile-value">{selected}</strong>
        </p>
      )}
    </div>
  )
}
