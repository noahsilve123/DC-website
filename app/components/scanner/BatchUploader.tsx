'use client'

import { useState, useRef } from 'react'
import { useDocumentStore } from '../../lib/store/documentStore'
import { Upload, Loader2 } from 'lucide-react'
import { ingestFiles } from './ingestDocuments'

export default function BatchUploader() {
  const addDocument = useDocumentStore((state) => state.addDocument)
  const updateDocument = useDocumentStore((state) => state.updateDocument)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    await ingestFiles(files, addDocument, updateDocument)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
        accept="image/*,application/pdf"
        aria-label="Upload documents"
        title="Upload documents"
      />
      <div className="flex flex-col items-center gap-2 cursor-pointer">
        <Upload className="w-10 h-10 text-gray-400" />
        <p className="text-lg font-medium text-gray-700">Drop files here or click to upload</p>
        <p className="text-sm text-gray-500">Supports PDF, PNG, JPG (Batch Upload)</p>
      </div>
    </div>
  )
}
