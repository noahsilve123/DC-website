'use client'

import { useDocumentStore } from '../../lib/store/documentStore'
import { calculateCSSProfile } from '../../lib/extractor/aggregator'
import CopilotRow from './CopilotRow'
import { AlertTriangle } from 'lucide-react'

export default function CopilotTable() {
  const documents = useDocumentStore((state) => state.documents)
  const rows = calculateCSSProfile(documents)

  // Validation Logic
  const warnings: string[] = []
  const totalW2Wages = (rows.find(r => r.id === 'PD-110')?.value || 0) + (rows.find(r => r.id === 'PD-120')?.value || 0)
  const agi = (rows.find(r => r.id === 'PD-130')?.value || 0) + (rows.find(r => r.id === 'PD-140')?.value || 0)

  if (totalW2Wages > agi + 1000 && agi > 0) {
    warnings.push("Warning: Your W-2 wages are significantly higher than your AGI. Did you miss a business loss or 401k deduction?")
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Upload documents to see the CSS Profile Worksheet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-yellow-800">Data Consistency Warnings</h4>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}
