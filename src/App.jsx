import { useState } from 'react'

function App() {
  const [profile, setProfile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function getActiveProfile() {
    setLoading(true)
    setError(null)
    setProfile('')

    try {
      const res = await fetch('/active-profile')
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || res.statusText)
      }
      const { profile } = await res.json()
      setProfile(profile)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <button
        onClick={getActiveProfile}
        style={{ padding: '.5rem 1rem', fontSize: '1rem' }}
      >
        Get Active Profile
      </button>

      {loading && <p>Loading…</p>}
      {error   && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && profile && (
        <p id="current-profile-text" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
          Current profile: <strong id="current-profile-text">{profile}</strong>
        </p>
      )}
    </div>
  )
}

export default App
