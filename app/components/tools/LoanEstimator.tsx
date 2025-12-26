'use client'

import { useState } from 'react'
import { Calculator, Info } from 'lucide-react'

export default function LoanEstimator() {
  const [sai, setSai] = useState<number | ''>('')
  const [estimatedTag, setEstimatedTag] = useState<string | null>(null)

  const calculateAid = () => {
    if (sai === '') return

    // 2024-2025 NJ TAG Award Table Approximation (Simplified)
    // These are ROUGH estimates based on public tables for Rutgers/Research Universities
    // Actual awards vary by institution type (County College vs State vs Private)
    let award = 0
    const s = Number(sai)

    if (s <= 1500) award = 10000 // Max award approx
    else if (s <= 2500) award = 8500
    else if (s <= 3500) award = 7500
    else if (s <= 4500) award = 6000
    else if (s <= 5500) award = 4500
    else if (s <= 6500) award = 3000
    else if (s <= 8000) award = 2000
    else award = 0

    setEstimatedTag(award > 0 ? `$${award.toLocaleString()}` : 'Not eligible for TAG')
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">NJ HESA / Loan Estimator</h2>
          <p className="text-sm text-slate-500">Estimate your NJ Tuition Aid Grant (TAG) based on SAI.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Student Aid Index (SAI)
            </label>
            <input
              type="number"
              value={sai}
              onChange={(e) => setSai(e.target.value ? Number(e.target.value) : '')}
              placeholder="Enter your SAI from FAFSA"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Found on your FAFSA Submission Summary.
            </p>
          </div>

          <button
            onClick={calculateAid}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Estimate Aid
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
          {estimatedTag ? (
            <div className="text-center">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Estimated NJ TAG Award</p>
              <p className="text-3xl font-black text-indigo-600 mt-2">{estimatedTag}</p>
              <p className="text-xs text-slate-400 mt-2">
                *Estimate for 4-year public institutions. Actual award varies by school.
              </p>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-sm">
              Enter your SAI to see an estimate.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">NJCLASS Loan Information</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs font-bold text-blue-800 uppercase mb-1">10-Year Fixed</p>
            <p className="text-lg font-bold text-blue-900">~5.69% APR</p>
            <p className="text-xs text-blue-600">Immediate repayment</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs font-bold text-blue-800 uppercase mb-1">15-Year Fixed</p>
            <p className="text-lg font-bold text-blue-900">~6.25% APR</p>
            <p className="text-xs text-blue-600">Interest-only while in school</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs font-bold text-blue-800 uppercase mb-1">20-Year Fixed</p>
            <p className="text-lg font-bold text-blue-900">~7.15% APR</p>
            <p className="text-xs text-blue-600">Full deferment option</p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            These are estimates based on 2024-2025 rates. Interest rates and award amounts are subject to change. 
            Visit <a href="https://www.hesaa.org" target="_blank" rel="noreferrer" className="text-indigo-600 underline">HESAA.org</a> for official calculators and applications.
          </p>
        </div>
      </div>
    </div>
  )
}
