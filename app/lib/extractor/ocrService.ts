import { OCROptions, OCRResult, OCRBlock } from './types'
import { processImageForOCR } from './imageProcessing'
import { processPDF } from './pdfService'

const TESSERACT_ASSETS = {
  // Copied into /public by scripts/copy-worker-assets.mjs
  workerPath: '/tesseract/worker.min.js',
  corePath: '/tesseract/tesseract-core.wasm.js',
  // Use local language data (Must end with /)
  langPath: '/tesseract/',
}

async function loadTesseractModule() {
  return import('tesseract.js') as Promise<any>
}

function resolveTesseractApi(mod: any) {
  const createWorker = mod?.createWorker ?? mod?.default?.createWorker
  const recognize = mod?.recognize ?? mod?.default?.recognize
  const PSM = mod?.PSM ?? mod?.default?.PSM
  return { createWorker, recognize, PSM }
}

function friendlyOCRErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  const lower = message.toLowerCase()
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('load') || lower.includes('fetch')) {
    return (
      'OCR engine assets failed to load. This is usually a blocked network, offline mode, or an extension blocking web workers. ' +
      'Try again on a different network, disable blockers, or upload a PDF that has selectable text (not a scanned image).'
    )
  }
  return message || 'Failed to process image.'
}

export const performLocalOCR = async (
  imageFile: File | Blob,
  onProgress: (progress: number, status: string) => void,
  options: OCROptions = { language: 'eng', psm: '3' },
): Promise<OCRResult> => {
  try {
    // Handle PDF files
    const isPDF = imageFile.type === 'application/pdf' || (imageFile instanceof File && imageFile.name.toLowerCase().endsWith('.pdf'))
    
    if (isPDF) {
      onProgress(5, 'Processing PDF...')
      // Ensure we have a File object for processPDF
      const fileObj = imageFile instanceof File ? imageFile : new File([imageFile], 'document.pdf', { type: 'application/pdf' })
      
      const pdfResult = await processPDF(fileObj, (msg) => onProgress(10, msg))
      
      const baseText = pdfResult.type === 'text_layer' && pdfResult.data ? pdfResult.data.text : ''
      const baseBlocks = pdfResult.type === 'text_layer' && pdfResult.data ? pdfResult.data.blocks : []

      const images = pdfResult.imageBlobs?.length
        ? pdfResult.imageBlobs
        : (pdfResult.type === 'image_fallback' && pdfResult.imageBlob ? [pdfResult.imageBlob] : [])

      if (!images.length && pdfResult.type === 'text_layer' && pdfResult.data) {
        return pdfResult.data
      }

      // Mixed PDFs are common (cover/attachments). If we already have a text layer,
      // prefer returning it without forcing OCR on scanned pages (fast + reliable).
      if (baseText.trim() && pdfResult.type === 'text_layer' && pdfResult.data) {
        if (images.length) {
          onProgress(12, 'Text layer found. Skipping OCR on scanned pages...')
        }
        return pdfResult.data
      }

      if (images.length) {
        onProgress(15, `Running OCR on ${images.length} scanned page${images.length === 1 ? '' : 's'}...`)
        const ocrFromImages = await performLocalOCRForImages(images, onProgress, options)

        const mergedText = [baseText, ocrFromImages.text].filter(Boolean).join('\n\n')
        const mergedBlocks = [...baseBlocks, ...ocrFromImages.blocks]

        const merged: OCRResult = {
          text: mergedText.trim(),
          blocks: mergedBlocks,
          confidence: ocrFromImages.confidence,
          timestamp: Date.now(),
        }
        if (!merged.text) {
          throw new Error('OCR returned no text. Try adjusting the crop or lighting.')
        }
        return merged
      }
    }

    onProgress(5, 'Enhancing image...')

    const fileToProcess =
      imageFile instanceof File ? imageFile : new File([imageFile], 'temp_ocr.png', { type: 'image/png' })

    const processedImageBlob = await processImageForOCR(
      fileToProcess,
      (msg) => {
        onProgress(10, msg)
      },
      options.preprocessing,
    )

    onProgress(15, 'Initializing OCR engine...')
    const mod: any = await loadTesseractModule()
    const { createWorker, recognize } = resolveTesseractApi(mod)
    if (typeof recognize !== 'function' && typeof createWorker !== 'function') {
      throw new Error('Tesseract OCR is not available in this environment.')
    }

    // Keep the logger on the main thread. Passing functions into certain worker init
    // paths can trigger DataCloneError in some bundler/dev configurations.
    const logger = (m: any) => {
      if (m?.status === 'recognizing text' && typeof m.progress === 'number') {
        const adjustedProgress = 20 + Math.floor(m.progress * 70)
        onProgress(adjustedProgress, 'Recognizing text...')
      }
    }

    onProgress(20, 'Extracting data...')
    const result = typeof createWorker === 'function'
      ? await recognizeWithWorker(processedImageBlob, onProgress, options, { logger })
      : await recognize(processedImageBlob, options.language, {
          logger,
          workerPath: TESSERACT_ASSETS.workerPath,
          corePath: TESSERACT_ASSETS.corePath,
          langPath: TESSERACT_ASSETS.langPath,
        })

    const words = (result.data as any).words || []
    const spatialBlocks: OCRBlock[] = words.map((w: any) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox,
    }))

    const finalText = String(result.data.text ?? '').trim()
    if (!finalText) {
      throw new Error('OCR returned no text. Try adjusting the crop or lighting.')
    }

    return {
      text: finalText,
      blocks: spatialBlocks,
      confidence: result.data.confidence,
      timestamp: Date.now(),
    }
  } catch (err) {
    console.error('Local OCR Error:', err)
    throw new Error(friendlyOCRErrorMessage(err))
  }
}

const PAGE_Y_OFFSET = 10000

async function recognizeWithWorker(
  image: Blob,
  onProgress: (progress: number, status: string) => void,
  options: OCROptions,
  extra: { logger?: (m: any) => void } = {},
): Promise<any> {
  const mod: any = await loadTesseractModule()
  const { createWorker } = resolveTesseractApi(mod)
  if (typeof createWorker !== 'function') {
    throw new Error('Tesseract worker API not available.')
  }

  const worker = createWorker({
    logger: (m: any) => {
      extra.logger?.(m)
    },
    workerPath: TESSERACT_ASSETS.workerPath,
    corePath: TESSERACT_ASSETS.corePath,
    langPath: TESSERACT_ASSETS.langPath,
  } as any)

  try {
    await worker.load()
    await worker.loadLanguage(options.language)
    await worker.initialize(options.language)
    const psmNum = Number.parseInt(String(options.psm), 10)
    if (Number.isFinite(psmNum)) {
      try {
        await worker.setParameters({ tessedit_pageseg_mode: psmNum } as any)
      } catch {}
    }
    return await worker.recognize(image)
  } finally {
    try {
      await worker.terminate()
    } catch {}
  }
}

export async function performLocalOCRForImages(
  images: Blob[],
  onProgress: (progress: number, status: string) => void,
  options: OCROptions = { language: 'eng', psm: '3' },
): Promise<OCRResult> {
  if (!images.length) {
    return { text: '', blocks: [], confidence: 0, timestamp: Date.now() }
  }

  const mod: any = await loadTesseractModule()
  const { createWorker, recognize } = resolveTesseractApi(mod)
  if (typeof createWorker !== 'function' && typeof recognize !== 'function') {
    throw new Error('Tesseract OCR is not available in this environment.')
  }

  // Prefer a single worker for multi-page OCR.
  const worker = typeof createWorker === 'function'
    ? createWorker({
        logger: (m: any) => {
          if (m?.status === 'recognizing text' && typeof m.progress === 'number') {
            // Map within the current page; overall progress is handled below.
          }
        },
        workerPath: TESSERACT_ASSETS.workerPath,
        corePath: TESSERACT_ASSETS.corePath,
        langPath: TESSERACT_ASSETS.langPath,
      } as any)
    : null

  let fullText = ''
  let allBlocks: OCRBlock[] = []
  let lastConfidence = 0

  try {
    if (worker) {
      await worker.load()
      await worker.loadLanguage(options.language)
      await worker.initialize(options.language)
      const psmNum = Number.parseInt(String(options.psm), 10)
      if (Number.isFinite(psmNum)) {
        try {
          await worker.setParameters({ tessedit_pageseg_mode: psmNum } as any)
        } catch {}
      }
    }

    for (let idx = 0; idx < images.length; idx++) {
      const pageNum = idx + 1
      const base = 15
      const span = 80
      const pageProgressStart = base + Math.floor((idx / images.length) * span)
      const pageProgressEnd = base + Math.floor(((idx + 1) / images.length) * span)
      onProgress(pageProgressStart, `OCR page ${pageNum}/${images.length}...`)

      const fileToProcess = new File([images[idx]], `pdf_page_${pageNum}.png`, { type: 'image/png' })
      const processedImageBlob = await processImageForOCR(
        fileToProcess,
        (msg) => {
          onProgress(pageProgressStart, msg)
        },
        options.preprocessing,
      )

      const logger = (m: any) => {
        if (m?.status === 'recognizing text' && typeof m.progress === 'number') {
          const p = pageProgressStart + Math.floor(m.progress * Math.max(1, pageProgressEnd - pageProgressStart))
          onProgress(Math.min(p, pageProgressEnd), `OCR page ${pageNum}/${images.length}...`)
        }
      }

      const result = worker
        ? await worker.recognize(processedImageBlob, { logger } as any)
        : await recognize(processedImageBlob, options.language, {
            logger,
            workerPath: TESSERACT_ASSETS.workerPath,
            corePath: TESSERACT_ASSETS.corePath,
            langPath: TESSERACT_ASSETS.langPath,
          })

      const words = (result.data as any).words || []
      const yOffset = idx * PAGE_Y_OFFSET
      const spatialBlocks: OCRBlock[] = words.map((w: any) => ({
        text: w.text,
        confidence: w.confidence,
        bbox: {
          x0: w.bbox.x0,
          y0: w.bbox.y0 + yOffset,
          x1: w.bbox.x1,
          y1: w.bbox.y1 + yOffset,
        },
      }))

      const pageText = String(result.data.text ?? '').trim()
      if (pageText) {
        fullText += (fullText ? '\n\n' : '') + pageText
      }
      allBlocks = allBlocks.concat(spatialBlocks)
      lastConfidence = Number(result.data.confidence ?? lastConfidence)
    }

    onProgress(95, 'Finalizing OCR results...')
    return {
      text: fullText.trim(),
      blocks: allBlocks,
      confidence: lastConfidence,
      timestamp: Date.now(),
    }
  } finally {
    if (worker) {
      try {
        await worker.terminate()
      } catch {}
    }
  }
}
