'use client'

import type { ScannedDoc, DocType } from '../../lib/store/documentStore'
import { performLocalOCR } from '../../lib/extractor/ocrService'
import { extractFinancialData } from '../../lib/extractor/dataExtraction'
import { analyzeText } from '../../lib/extractor/analyzer'

const makeId = () => Math.random().toString(36).slice(2)

const inferDocType = (taxFormType: string, award: ReturnType<typeof analyzeText> | null): DocType => {
  const awardSignals = (award?.grants?.length ?? 0) + (award?.loans?.length ?? 0)
  const normalizedTax = String(taxFormType || 'Unknown')

  if (normalizedTax !== 'Unknown') {
    return normalizedTax as DocType
  }

  if (awardSignals > 0) return 'Award Letter'

  return 'Unknown'
}

export async function ingestFiles(
  files: FileList | File[] | null,
  addDocument: (doc: ScannedDoc) => void,
  updateDocument: (id: string, updates: Partial<ScannedDoc>) => void,
) {
  if (!files) return

  const list = Array.isArray(files) ? files : Array.from(files)

  list.forEach(async (file) => {
    const id = makeId()

    const newDoc: ScannedDoc = {
      id,
      fileName: file.name,
      file,
      rawText: '',
      status: 'processing',
      assignedOwner: null,
      detectedType: 'Unknown',
      extractedData: {},
      awardData: null,
    }

    addDocument(newDoc)

    try {
      const ocr = await performLocalOCR(file, () => {})
      const tax = extractFinancialData(ocr.text, ocr.blocks)
      const award = analyzeText(ocr.text)

      updateDocument(id, {
        rawText: ocr.text,
        status: 'complete',
        detectedType: inferDocType(tax.formType, award),
        extractedData: tax,
        awardData: award,
      })
    } catch (error) {
      console.error(error)
      updateDocument(id, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })
}
