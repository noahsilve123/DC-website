import { OCROptions, OCRResult, OCRBlock } from './types'
import { processImageForOCR } from './imageProcessing'

const TESSERACT_ASSETS = {
  // Copied into /public by scripts/copy-worker-assets.mjs
  workerPath: '/tesseract/worker.min.js',
  corePath: '/tesseract/tesseract-core.wasm.js',
  // Use local language data
  langPath: '/tesseract',
}

async function loadTesseract() {
  const mod: any = await import('tesseract.js')
  return mod?.default ?? mod
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
    const Tesseract: any = await loadTesseract()
    if (typeof Tesseract?.recognize !== 'function') {
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
    const result = await Tesseract.recognize(processedImageBlob, options.language, {
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
