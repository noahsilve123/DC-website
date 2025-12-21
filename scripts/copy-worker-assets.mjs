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
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
