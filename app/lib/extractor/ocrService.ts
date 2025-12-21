import { OCROptions, OCRResult, OCRBlock } from './types'
import { processImageForOCR } from './imageProcessing'

const TESSERACT_ASSETS = {
  // Copied into /public by scripts/copy-worker-assets.mjs
  workerPath: '/tesseract/worker.min.js',
  corePath: '/tesseract/tesseract-core.wasm.js',
  // Language data is large; keep it on a CDN by default.
  // If this is blocked on a network, PDFs with selectable text will still work (no OCR needed).
  langPath: 'https://tessdata.projectnaptha.com/4.0.0',
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

    const createWorkerFn = Tesseract?.createWorker
    const PSM = Tesseract?.PSM

    const logger = (m: any) => {
      if (m?.status === 'recognizing text' && typeof m.progress === 'number') {
        const adjustedProgress = 20 + Math.floor(m.progress * 70)
        onProgress(adjustedProgress, 'Recognizing text...')
      }
    }

    let result: any
    if (typeof createWorkerFn === 'function') {
      // v5-compatible worker lifecycle (explicit load/init tends to be most reliable)
      const worker = await createWorkerFn({
        logger,
        workerPath: TESSERACT_ASSETS.workerPath,
        corePath: TESSERACT_ASSETS.corePath,
        langPath: TESSERACT_ASSETS.langPath,
      })

      onProgress(16, 'Loading OCR language data...')
      await worker.load()
      await worker.loadLanguage(options.language)
      await worker.initialize(options.language)

      onProgress(18, 'Configuring OCR parameters...')
      try {
        if (PSM && options.psm && typeof options.psm === 'string') {
          // Use AUTO as a safe default if the provided psm isn't found.
          const psmValue = (PSM as any)[options.psm] ?? (PSM as any).AUTO
          await worker.setParameters({ tessedit_pageseg_mode: psmValue })
        } else {
          await worker.setParameters({ tessedit_pageseg_mode: options.psm as any })
        }
      } catch {
        // Ignore parameter failures; OCR can still run.
      }

      onProgress(20, 'Extracting text...')
      result = await worker.recognize(processedImageBlob)
      await worker.terminate()
    } else if (typeof Tesseract?.recognize === 'function') {
      // Fallback path
      onProgress(20, 'Extracting text...')
      result = await Tesseract.recognize(processedImageBlob, options.language, {
        logger,
        workerPath: TESSERACT_ASSETS.workerPath,
        corePath: TESSERACT_ASSETS.corePath,
        langPath: TESSERACT_ASSETS.langPath,
      })
    } else {
      throw new Error('Tesseract OCR is not available in this environment.')
    }

    const words = (result.data as any).words || []

    const spatialBlocks: OCRBlock[] = words.map((w: any) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox,
    }))

    const finalText = result.data.text.trim()

    if (!finalText) {
      throw new Error('OCR returned no text. Try adjusting the crop or lighting.')
    }

    return {
      text: finalText,
      blocks: spatialBlocks,
      confidence: result.data.confidence,
      timestamp: Date.now(),
    }
  } catch (error: any) {
    console.error('Local OCR Error:', error)
    throw new Error(friendlyOCRErrorMessage(error))
  }
}
