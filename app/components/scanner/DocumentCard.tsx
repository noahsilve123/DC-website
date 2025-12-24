'use client'

import { ScannedDoc, useDocumentStore, FamilyMember } from '../../lib/store/documentStore'
import { FileText, Trash2, CheckCircle, AlertCircle, Loader2, User, GraduationCap, HelpCircle } from 'lucide-react'

export default function DocumentCard({ doc }: { doc: ScannedDoc }) {
  const updateDocument = useDocumentStore((state) => state.updateDocument)
  const removeDocument = useDocumentStore((state) => state.removeDocument)

  const icons = {
    student: <GraduationCap className="w-4 h-4" />,
    parent1: <User className="w-4 h-4" />,
    parent2: <User className="w-4 h-4" />,
    null: <HelpCircle className="w-4 h-4" />
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 bg-gray-100 rounded-lg">
          <FileText className="w-6 h-6 text-gray-600" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{doc.file.name}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {doc.status === 'processing' && (
              <span className="flex items-center gap-1 text-blue-600">
                <Loader2 className="w-3 h-3 animate-spin" /> Processing...
              </span>
            )}
            {doc.status === 'complete' && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" /> {doc.detectedType}
              </span>
            )}
            {doc.status === 'error' && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-3 h-3" /> Error
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <select
          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-blue-50 text-blue-700 font-medium px-2 py-1"
          value={doc.assignedOwner || ''}
          onChange={(e) => updateDocument(doc.id, { assignedOwner: e.target.value as FamilyMember })}
        >
          <option value="" disabled>Select Owner...</option>
          <option value="parent1">Parent 1 (Custodial)</option>
          <option value="parent2">Parent 2 (Spouse)</option>
          <option value="student">Student</option>
        </select>

        <button
          onClick={() => removeDocument(doc.id)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
