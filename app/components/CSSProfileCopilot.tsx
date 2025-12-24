'use client'

import BatchUploader from './scanner/BatchUploader'
import DocumentCard from './scanner/DocumentCard'
import CopilotTable from './profile/CopilotTable'
import { useDocumentStore } from '../lib/store/documentStore'

export default function CSSProfileCopilot() {
  const documents = useDocumentStore((state) => state.documents)

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">1. Upload Financial Documents</h2>
        <p className="text-gray-600">
          Upload your W-2s, 1040s, and Schedules. We&apos;ll scan them locally on your device.
        </p>
        <BatchUploader />
        
        {documents.length > 0 && (
          <div className="grid gap-4 mt-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">2. Review & Copy Answers</h2>
        <p className="text-gray-600">
          Use these calculated values for your CSS Profile application.
        </p>
        <CopilotTable />
      </section>
    </div>
  )
}
