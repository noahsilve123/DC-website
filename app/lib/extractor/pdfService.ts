import { OCRBlock, OCRResult } from './types'

type PDFLib = typeof import('pdfjs-dist/legacy/build/pdf')

// Served from /public by scripts/copy-worker-assets.mjs
const workerSrc = '/pdf.worker.min.mjs'
let pdfLibPromise: Promise<PDFLib> | null = null

const loadPdfLib = async (): Promise<PDFLib> => {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only available in the browser.')
  }

  if (!pdfLibPromise) {
    pdfLibPromise = import('pdfjs-dist/legacy/build/pdf')
  }

  const pdfjsLib = await pdfLibPromise
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
  } catch {
    // If setting workerSrc fails in an environment, PDF.js will fall back to a fake worker.
  }
  return pdfjsLib
}

interface PDFProcessResult {
  type: 'text_layer' | 'image_fallback'
  data?: OCRResult
  imageBlob?: Blob
}

export const processPDF = async (file: File, onProgress: (msg: string) => void): Promise<PDFProcessResult> => {
  try {
    const pdfjsLib = await loadPdfLib()
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    onProgress(`Parsing PDF (${pdf.numPages} pages)...`)

    let fullText = ''
    let allBlocks: OCRBlock[] = []

    const firstPage = await pdf.getPage(1)
    const textContent = await firstPage.getTextContent()

    if (textContent.items.length < 10) {
      onProgress('Scanned PDF detected. Converting to image for OCR...')
      const imageBlob = await renderPageToImage(firstPage)
      return { type: 'image_fallback', imageBlob }
    }

    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress(`Extracting text from page ${i}/${pdf.numPages}...`)
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const viewport = page.getViewport({ scale: 1.0 })

      const pageBlocks: OCRBlock[] = content.items.map((item: any) => {
        const tx = item.transform
        const x = tx[4]
        const y = tx[5]
        const width = item.width
        const height = item.height

        const y0 = viewport.height - (y + height)
        const y1 = viewport.height - y

        return {
          text: item.str,
          confidence: 100,
          bbox: {
            x0: x,
            y0,
            x1: x + width,
            y1,
          },
        }
      })

      const validBlocks = pageBlocks.filter((b) => b.text.trim().length > 0)

      allBlocks = [...allBlocks, ...validBlocks]
      fullText += validBlocks.map((b) => b.text).join(' ') + '\n'
    }

    return {
      type: 'text_layer',
      data: {
        text: fullText,
        blocks: allBlocks,
        confidence: 100,
        timestamp: Date.now(),
      },
    }
  } catch (error: any) {
    console.error('PDF Processing Error:', error)
    throw new Error('Failed to process PDF. File might be corrupted or password protected.')
  }
}

const renderPageToImage = async (page: any): Promise<Blob> => {
  const scale = 2.0
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.height = viewport.height
  canvas.width = viewport.width

  if (!context) throw new Error('Canvas context unavailable')

  await page.render({
    canvasContext: context,
    viewport,
  }).promise

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to render PDF page'))
    }, 'image/png')
  })
}
