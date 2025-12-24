'use client'

import { useDocumentStore } from '../../lib/store/documentStore'
import { calculateCSSProfile } from '../../lib/extractor/aggregator'
import CopilotRow from './CopilotRow'

export default function CopilotTable() {
  const documents = useDocumentStore((state) => state.documents)
  const rows = calculateCSSProfile(documents)

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Upload documents to see the CSS Profile Worksheet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">CSS Profile Worksheet</h3>
        <p className="text-sm text-gray-500">Aggregated values from your uploaded documents</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Question</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <CopilotRow key={row.id} {...row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
