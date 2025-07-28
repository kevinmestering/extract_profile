import { useState } from 'react'

export default function App() {
  const [profile, setProfile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function onFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    setProfile('')

    const form = new FormData()
    form.append('ini', file)

    try {
      const res = await fetch('/api/upload-profiles-ini', {
        method: 'POST',
        body:   form
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || res.statusText)
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
      <label style={{ display: 'block', marginBottom: '1rem' }}>
        Upload your <code>profiles.ini</code>:
        <input
          type="file"
          accept=".ini"
          onChange={onFileChange}
          style={{ marginTop: '.5rem' }}
        />
      </label>

      {loading  && <p>Uploading & parsing…</p>}
      {error    && <p style={{ color: 'red' }}>Error: {error}</p>}
      {profile  && (
        <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
          Current profile: <strong>{profile}</strong>
        </p>
      )}
    </div>
  )
}
