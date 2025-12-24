'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface CopilotRowProps {
  id: string
  question: string
  value: number
  source: string
}

export default function CopilotRow({ id, question, value, source }: CopilotRowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4 text-sm text-gray-500 font-mono">{id}</td>
      <td className="py-3 px-4 text-sm font-medium text-gray-900">{question}</td>
      <td className="py-3 px-4 text-sm text-gray-900 font-mono font-bold">
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="py-3 px-4 text-xs text-gray-500">
        <span className="bg-gray-100 px-2 py-1 rounded-full">{source}</span>
      </td>
      <td className="py-3 px-4 text-right">
        <button
          onClick={handleCopy}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
          title="Copy value"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </td>
    </tr>
  )
}
