'use client'

import CopilotTable from './profile/CopilotTable'
import { useDocumentStore } from '../lib/store/documentStore'

export default function CSSProfileCopilot() {
  const documents = useDocumentStore((state) => state.documents)

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Review & Copy Answers</h2>
        <p className="text-gray-600">
          Use these calculated values for your CSS Profile application. Upload/assign documents in the Extractor on the Tools page.
        </p>
        <CopilotTable />
      </section>
    </div>
  )
}
