import { useState } from 'react'

export default function App() {
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
        const text = await res.json().catch(() => null)
        throw new Error(text?.error || res.statusText)
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
        disabled={loading}
        style={{ padding: '.5rem 1rem', fontSize: '1rem' }}
      >
        {loading ? 'Detecting…' : 'Get Active Profile'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
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
