'use client'

import { AlertTriangle, CheckCircle, HelpCircle, Edit2 } from 'lucide-react'
import { CSSQuestion } from '../../lib/extractor/cssProfileStructure'

interface CopilotRowProps extends CSSQuestion {
  onEdit?: (id: string, newVal: number) => void;
}

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

export default function CopilotRow({ id, question, value, sourceType, description, sourceDetail }: CopilotRowProps) {
  
  const isCalculated = sourceType === 'calculated';
  const hasValue = value !== undefined && value !== 0;

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
      <td className="py-4 px-4 align-top">
        <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{id}</span>
      </td>
      <td className="py-4 px-4 align-top">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{question}</span>
          {description && (
            <span className="text-sm text-gray-500 mt-1">{description}</span>
          )}
          {sourceDetail && isCalculated && (
             <span className="text-xs text-blue-600 mt-1 flex items-center gap-1">
               <CheckCircle className="w-3 h-3" />
               Extracted: {sourceDetail}
             </span>
          )}
        </div>
      </td>
      <td className="py-4 px-4 align-top font-medium text-gray-900">
        <div className="flex items-center gap-2">
            {formatCurrency(value || 0)}
        </div>
      </td>
      <td className="py-4 px-4 align-top text-right">
        {!isCalculated ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Manual Entry
            </span>
        ) : (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${hasValue ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {hasValue ? 'Calculated' : 'Not Found'}
            </span>
        )}
      </td>
    </tr>
  )
}