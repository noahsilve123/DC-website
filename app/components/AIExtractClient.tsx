"use client"

import React, { useState, useRef } from 'react'
// NOTE: import Tesseract dynamically inside handler for better ESM/CJS compatibility

export default function AIExtractClient() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [text, setText] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<Record<string, string[]> | null>(null)
  const workerRef = useRef<any>(null)
  const abortRef = useRef<{ aborted: boolean }>({ aborted: false })

  async function handleFile(file: File | null) {
    setError(null)
    setText(null)
    setProgress(0)
    if (!file) return
    setFileName(file.name)
    setRunning(true)
    abortRef.current.aborted = false
    try {
      let inputForOCR: File | Blob = file
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
          try {
            ;(pdfjsLib.GlobalWorkerOptions as any).disableWorker = true
          } catch {}
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
          const pdf = await loadingTask.promise
          const page = await pdf.getPage(1)
          const viewport = page.getViewport({ scale: 1.5 })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')!
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          await page.render({ canvasContext: context, viewport }).promise
          inputForOCR = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b ?? new Blob()), 'image/png'))
        } catch (pdfErr: any) {
          console.warn('PDF render failed', pdfErr)
          inputForOCR = file
        }
      }

      const Tesseract = await import('tesseract.js')
      const createWorkerFn = (Tesseract && (Tesseract.createWorker || (Tesseract.default && Tesseract.default.createWorker)))
      let worker: any
      if (typeof createWorkerFn === 'function') {
        worker = createWorkerFn(({} as any))
      } else if (Tesseract && typeof Tesseract.recognize === 'function') {
        worker = null
      } else {
        throw new Error('Tesseract is not available in this environment')
      }
      workerRef.current = worker
      let resultPromise: Promise<any>
      if (worker) {
        await worker.load()
        await worker.loadLanguage('eng')
        await worker.initialize('eng')
        try {
          const PSM = (Tesseract && (Tesseract.PSM || (Tesseract.default && Tesseract.default.PSM)))
          if (PSM) await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO })
        } catch {}
        resultPromise = worker.recognize(inputForOCR)
      } else {
        resultPromise = (Tesseract && Tesseract.recognize)
          ? Tesseract.recognize(inputForOCR, 'eng', {
              logger: (m: any) => {
                if (m.status === 'recognizing text' && typeof m.progress === 'number') setProgress(Math.round(m.progress * 100))
              },
            })
          : Promise.reject(new Error('No OCR available'))
      }

      const timeoutMs = 120_000
      const timeoutPromise = new Promise((_, rej) => {
        const id = setTimeout(() => {
          abortRef.current.aborted = true
          rej(new Error('OCR timeout'))
        }, timeoutMs)
        ;(resultPromise as any).finally(() => clearTimeout(id))
      })

      const { data } = await Promise.race([resultPromise, timeoutPromise]) as any
      if (abortRef.current.aborted) throw new Error('OCR aborted (timeout)')
      setText(data.text)
      setParsed(parseSimple(data.text))
      await worker?.terminate()
      workerRef.current = null
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err && /responseText/i.test(String(err.message))) {
        setError('A network/resource error occurred while loading OCR assets. Check your network or try again.')
      } else {
        setError(err?.message || String(err))
      }
      try {
        if (workerRef.current) await workerRef.current.terminate()
      } catch {}
      workerRef.current = null
    } finally {
      setRunning(false)
      setProgress(100)
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    handleFile(f)
  }

  function parseSimple(s: string) {
    if (!s) return { emails: [], phones: [], dates: [] }
    const emails = Array.from(new Set((s.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []))).slice(0, 5)
    const phones = Array.from(new Set((s.match(/\+?\d[\d\s().-]{6,}\d/g) || []))).slice(0, 5)
    const dates = Array.from(new Set((s.match(/\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/g) || []))).slice(0, 5)
    return { emails, phones, dates }
  }

  return (
    <div className="ai-extract-client rounded-lg border p-4 bg-white shadow-sm">
      <label htmlFor="ai-extract-file" className="block text-sm font-semibold">
        Upload a document to extract text (client-side)
      </label>
      <input
        id="ai-extract-file"
        type="file"
        accept="image/*,.pdf,.png,.jpg,.jpeg"
        onChange={onChange}
        className="mt-2"
      />

      {fileName && (
        <div className="mt-3 text-sm text-gray-600">
          Processing: <strong>{fileName}</strong>
        </div>
      )}

      {running && (
        <div className="mt-2">
          <progress
            className="w-full h-2 rounded overflow-hidden"
            value={Math.min(100, Math.max(0, progress))}
            max={100}
            aria-label="OCR progress"
          />
          <div className="text-xs text-gray-500 mt-1">{progress}%</div>
          <div className="mt-2">
            <button
              onClick={() => {
                abortRef.current.aborted = true
                setRunning(false)
                setError('OCR cancelled')
                if (workerRef.current) {
                  try {
                    workerRef.current.terminate()
                  } catch {}
                  workerRef.current = null
                }
              }}
              className="text-xs text-red-600 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <div className="mt-3 text-sm text-red-600">Error: {error}</div>}

      {text && (
        <div className="mt-3">
          <label htmlFor="ai-extract-text" className="text-sm font-semibold">
            Extracted text
          </label>
          <textarea
            id="ai-extract-text"
            readOnly
            value={text}
            rows={10}
            className="w-full mt-2 p-2 border rounded bg-gray-50 text-sm"
          />
          {parsed && (
            <div className="mt-3 text-sm text-gray-700">
              <p className="font-semibold">Quick parsed fields</p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-medium">Emails</p>
                  <ul className="text-xs mt-1">
                    {parsed.emails.length ? parsed.emails.map((e) => <li key={e}>{e}</li>) : <li className="text-gray-500">—</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium">Phones</p>
                  <ul className="text-xs mt-1">
                    {parsed.phones.length ? parsed.phones.map((p) => <li key={p}>{p}</li>) : <li className="text-gray-500">—</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium">Dates</p>
                  <ul className="text-xs mt-1">
                    {parsed.dates.length ? parsed.dates.map((d) => <li key={d}>{d}</li>) : <li className="text-gray-500">—</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
