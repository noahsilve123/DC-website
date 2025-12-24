import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function copyFileIfExists(from, to) {
  try {
    await fs.copyFile(from, to)
    return true
  } catch {
    return false
  }
}

async function downloadFile(url, dest) {
  try {
    // Check if file already exists to avoid re-downloading on every build
    try {
      await fs.access(dest)
      console.log(`File already exists: ${dest}`)
      return
    } catch {
      // File doesn't exist, proceed with download
    }

    console.log(`Downloading ${url} to ${dest}...`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`)
    const arrayBuffer = await res.arrayBuffer()
    await fs.writeFile(dest, Buffer.from(arrayBuffer))
    console.log(`Downloaded ${dest}`)
  } catch (error) {
    console.error(`Error downloading ${url}:`, error)
  }
}

async function main() {
  const publicDir = path.join(projectRoot, 'public')
  const tesseractDir = path.join(publicDir, 'tesseract')

  await ensureDir(publicDir)
  await ensureDir(tesseractDir)

  // PDF.js worker (keeps PDF text extraction + render fallback working without external CDNs)
  const pdfWorkerSrc = path.join(projectRoot, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.min.mjs')
  const pdfWorkerDest = path.join(publicDir, 'pdf.worker.min.mjs')
  await copyFileIfExists(pdfWorkerSrc, pdfWorkerDest)

  // Tesseract worker + core (keeps OCR working reliably in Next.js)
  const tessWorkerSrc = path.join(projectRoot, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js')
  const tessWorkerDest = path.join(tesseractDir, 'worker.min.js')
  await copyFileIfExists(tessWorkerSrc, tessWorkerDest)

  const coreJsSrc = path.join(projectRoot, 'node_modules', 'tesseract.js-core', 'tesseract-core.wasm.js')
  const coreJsDest = path.join(tesseractDir, 'tesseract-core.wasm.js')
  await copyFileIfExists(coreJsSrc, coreJsDest)

  const coreWasmSrc = path.join(projectRoot, 'node_modules', 'tesseract.js-core', 'tesseract-core.wasm')
  const coreWasmDest = path.join(tesseractDir, 'tesseract-core.wasm')
  await copyFileIfExists(coreWasmSrc, coreWasmDest)

  // NEW: Download Language Data
  // We download the .gz version because Tesseract.js handles it and it saves bandwidth/space
  // Using the one from naptha/tessdata which is what tesseract.js uses by default
  const langUrlGz = 'https://github.com/naptha/tessdata/raw/gh-pages/4.0.0_fast/eng.traineddata.gz'
  const langDest = path.join(tesseractDir, 'eng.traineddata.gz')
  
  await downloadFile(langUrlGz, langDest)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
