/*
  Downloads Coves font files into public/fonts.

  IMPORTANT:
  - Only download fonts you have the right to use/redistribute.
  - Provide direct .woff2 URLs.

  Usage (PowerShell):
    $env:COVES_REGULAR_URL="https://.../Coves-Regular.woff2"; $env:COVES_BOLD_URL="https://.../Coves-Bold.woff2"; node scripts/download-coves-fonts.mjs
*/

import fs from 'node:fs/promises'
import path from 'node:path'

const regularUrl = process.env.COVES_REGULAR_URL
const boldUrl = process.env.COVES_BOLD_URL

if (!regularUrl || !boldUrl) {
  console.error('Missing env vars. Set COVES_REGULAR_URL and COVES_BOLD_URL to direct .woff2 files.')
  process.exit(1)
}

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`)
  return Buffer.from(await res.arrayBuffer())
}

const outDir = path.join(process.cwd(), 'public', 'fonts')
await fs.mkdir(outDir, { recursive: true })

const regular = await download(regularUrl)
const bold = await download(boldUrl)

await fs.writeFile(path.join(outDir, 'Coves-Regular.woff2'), regular)
await fs.writeFile(path.join(outDir, 'Coves-Bold.woff2'), bold)

console.log('Saved: public/fonts/Coves-Regular.woff2')
console.log('Saved: public/fonts/Coves-Bold.woff2')
