'use client'

import { useDocumentStore } from '../../lib/store/documentStore'
import { calculateCSSProfile } from '../../lib/extractor/aggregator'
import CopilotRow from './CopilotRow'
import { AlertTriangle, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function CopilotTable() {
  const documents = useDocumentStore((state) => state.documents)
  const sections = calculateCSSProfile(documents)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
      'student_income': true,
      'parent_income': true,
      'parent_expenses': false,
      'assets': true
  });

  const toggleSection = (id: string) => {
      setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // Simple validation logic (aggregated from sections)
  // We can re-implement the warning logic by traversing the sections if needed
  // For now, let's keep it simple or re-calculate totals from the structured data if we want warnings.
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No Documents Uploaded</h3>
        <p className="text-gray-500 max-w-sm mx-auto">Upload your tax forms and W-2s above to generate your personalized CSS Profile worksheet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button 
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
                {expandedSections[section.id] ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                <div>
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.description}</p>
                </div>
            </div>
            {/* Optional: Show completion status or total calculated value here */}
          </button>
          
          {expandedSections[section.id] && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-white border-b border-gray-100">
                        <th className="py-2 px-4 text-xs font-semibold text-gray-400 uppercase w-24">Code</th>
                        <th className="py-2 px-4 text-xs font-semibold text-gray-400 uppercase">Question Details</th>
                        <th className="py-2 px-4 text-xs font-semibold text-gray-400 uppercase w-32">Your Value</th>
                        <th className="py-2 px-4 text-xs font-semibold text-gray-400 uppercase text-right w-32">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {section.questions.map((q) => (
                        <CopilotRow key={q.id} {...q} />
                    ))}
                    </tbody>
                </table>
              </div>
          )}
        </div>
      ))}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Note on Asset Values</h4>
        <p className="text-sm text-blue-800">
            Most asset values (Cash, Investments, Home Value) cannot be found on tax returns. 
            You must enter these manually based on your current account balances and market estimates.
        </p>
      </div>
    </div>
  )
}