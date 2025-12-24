'use client'

import { useRef, useState } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import { useDocumentStore } from '../lib/store/documentStore'
import { ingestFiles } from './scanner/ingestDocuments'
import DocumentCard from './scanner/DocumentCard'

export default function ExtractorHubMini() {
  const documents = useDocumentStore((s) => s.documents)
  const addDocument = useDocumentStore((s) => s.addDocument)
  const updateDocument = useDocumentStore((s) => s.updateDocument)
  const clearDocuments = useDocumentStore((s) => s.clearDocuments)

  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const onPick = async (files: FileList | null) => {
    if (!files) return
    setBusy(true)
    try {
      await ingestFiles(files, addDocument, updateDocument)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Extractor</h2>
          <p className="text-xs text-slate-600">Upload documents once. All tools read from the same extracted results.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => onPick(e.target.files)}
            aria-label="Upload documents"
            title="Upload documents"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={busy}
          >
            <Upload className="h-4 w-4" />
            {busy ? 'Working…' : 'Upload'}
          </button>

          {documents.length > 0 && (
            <button
              type="button"
              onClick={clearDocuments}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {documents.length > 0 && (
        <div className="mt-4 grid gap-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </section>
  )
}
