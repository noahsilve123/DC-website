import React, { useCallback, useState } from 'react'
import { FileText, FileType, X } from 'lucide-react'

interface ImageUploaderProps {
  onImageSelected: (file: File) => void
  selectedImage: File | null
  onClear: () => void
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, selectedImage, onClear }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (file) {
        const isPdf = file.type === 'application/pdf'
        const isImage = file.type.startsWith('image/')

        if (isPdf || isImage) {
          if (isImage) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            setFileType('image')
          } else {
            setPreviewUrl(null)
            setFileType('pdf')
          }
          onImageSelected(file)
        }
      }
    },
    [onImageSelected],
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    [handleFile],
  )

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0])
      }
    },
    [handleFile],
  )

  const handleClear = useCallback(() => {
    setPreviewUrl(null)
    setFileType(null)
    onClear()
  }, [onClear])

  if (selectedImage) {
    return (
      <div className="relative w-full h-64 md:h-96 bg-slate-900 rounded-xl overflow-hidden shadow-md group flex items-center justify-center">
        {fileType === 'image' && previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
        ) : (
          <div className="text-center p-8">
            <div className="bg-slate-800 p-6 rounded-full inline-block mb-4">
              <FileType className="w-16 h-16 text-slate-300" />
            </div>
            <p className="text-slate-200 font-medium text-lg">{selectedImage.name}</p>
            <p className="text-slate-400 text-sm mt-1">PDF Document Ready to Scan</p>
          </div>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
          <button
            onClick={handleClear}
            className="opacity-0 group-hover:opacity-100 bg-white text-red-600 px-4 py-2 rounded-lg font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 flex items-center"
          >
            <X size={18} className="mr-2" />
            Remove File
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-200 cursor-pointer ${
        isDragging ? 'border-brand-500 bg-brand-50 scale-[1.01]' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
      }`}
    >
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={onInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
          <FileText size={32} />
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-800">Upload PDF</p>
          <p className="text-sm text-slate-500 mt-1">
            Also supports PNG/JPG (W-2, 1040, or other tax paperwork).
          </p>
        </div>
      </div>
    </div>
  )
}
