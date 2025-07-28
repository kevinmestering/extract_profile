// server.js
import express from 'express'
import puppeteer from 'puppeteer-core'
import path from 'path'
import os   from 'os'
import { fileURLToPath } from 'url'
import { dirname        } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const app        = express()

// 1) Route: scrape about:support for Profile Folder
app.get('/active-profile', async (req, res) => {
  try {
    // 2) Launch Firefox via Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      product: 'firefox',
      // adjust this path if your firefox.exe lives elsewhere
      executablePath: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
      args: [
        '--no-remote',              // don’t disturb your running instance
        `-profile`,                 // launch with a throwaway profile
        path.join(os.tmpdir(), 'pp_profile')
      ]
    })

    const page = await browser.newPage()
    // 3) Go to about:support
    await page.goto('about:support', { waitUntil: 'domcontentloaded' })

    // 4) Scrape the “Profile Folder” row
    const fullPath = await page.$$eval('tr', rows => {
      for (const tr of rows) {
        const th = tr.querySelector('th')
        if (th && th.textContent.trim() === 'Profile Folder') {
          return tr.querySelector('td')?.textContent.trim() || ''
        }
      }
      return ''
    })

    await browser.close()

    if (!fullPath) {
      throw new Error('Could not find Profile Folder on about:support')
    }
    // 5) Extract only the final folder name (pr1, pr3, etc.)
    const profile = fullPath.split(/[\\/]/).pop()
    return res.json({ profile })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})

// 6) Serve your React UI (after you’ve run `npm run build`)
app.use(express.static(path.join(__dirname, 'dist')))
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
