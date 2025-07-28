// server.js
import express from 'express'
import path    from 'path'
import { fileURLToPath } from 'url'
import { dirname }        from 'path'
import puppeteer from 'puppeteer-core'

// ─── __dirname shim for ESM ───────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

// ─── Create Express app ─────────────────────────────────────────────────
const app = express()

// ─── 1) Serve your built front‑end (from dist/) ────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')))

// ─── 2) API: launch headless Firefox & scrape about:support ───────────────
app.get('/active-profile', async (req, res) => {
  let browser
  try {
    // Launch Firefox in headless mode
    browser = await puppeteer.launch({
      headless: true,
      product: 'firefox',
      executablePath: '/usr/bin/firefox-esr',  // Path inside your Docker image
      args: ['--no-remote']
    })

    const page = await browser.newPage()
    // Navigate to the internal Firefox support page
    await page.goto('about:support', { waitUntil: 'domcontentloaded' })

    // Scrape the table row whose <th> text is "Profile Folder"
    const fullPath = await page.$$eval('tr', rows => {
      for (const row of rows) {
        const th = row.querySelector('th')
        if (th && th.textContent.trim() === 'Profile Folder') {
          const td = row.querySelector('td')
          return td?.textContent.trim() || ''
        }
      }
      return ''
    })

    await browser.close()

    if (!fullPath) {
      throw new Error('Could not find "Profile Folder" row on about:support')
    }

    // Extract only the last segment (e.g. "pr1")
    const profile = fullPath.split(/[\\/]/).pop()
    return res.json({ profile })

  } catch (err) {
    if (browser) {
      try { await browser.close() } catch {}
    }
    console.error('Error in /active-profile:', err)
    return res.status(500).json({ error: err.message })
  }
})

// ─── 3) Fallback: serve index.html for any other route ───────────────────────
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// ─── 4) Start the server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
