'use client'

import { useMemo } from 'react'
import { useDocumentStore } from '../../lib/store/documentStore'

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function ScholarshipInterpreter() {
  const docs = useDocumentStore((s) => s.documents)

  const computed = useMemo(() => {
    const complete = docs.filter((d) => d.status === 'complete')

    const awardDocs = complete.filter((d) => (d.awardData?.grants?.length ?? 0) + (d.awardData?.loans?.length ?? 0) > 0)

    const allGrants = awardDocs.flatMap((d) => d.awardData?.grants ?? [])
    const allLoans = awardDocs.flatMap((d) => d.awardData?.loans ?? [])

    const totalGrants = allGrants.reduce((acc, g) => acc + (g.amount || 0), 0)
    const totalLoans = allLoans.reduce((acc, l) => acc + (l.amount || 0), 0)

    return {
      hasDocs: docs.length > 0,
      awardDocsCount: awardDocs.length,
      totalGrants,
      totalLoans,
      topGrants: [...allGrants].sort((a, b) => b.amount - a.amount).slice(0, 6),
      topLoans: [...allLoans].sort((a, b) => b.amount - a.amount).slice(0, 6),
    }
  }, [docs])

  if (!computed.hasDocs) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Scholarship / award letter summary</h2>
        <p className="mt-2 text-sm text-slate-600">Upload an award letter PDF or image in the Extractor on the Tools page.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Scholarship / award letter summary</h2>
      <p className="mt-1 text-sm text-slate-600">Based on keyword matches for grants/scholarships and student loans.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total grants</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(computed.totalGrants)}</p>
          {computed.topGrants.length > 0 ? (
            <ul className="mt-3 text-xs text-slate-700 space-y-1">
              {computed.topGrants.map((g) => (
                <li key={g.originalLine} className="flex items-center justify-between gap-3">
                  <span className="truncate">{g.description || g.originalLine}</span>
                  <span className="font-semibold">{formatCurrency(g.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No grant lines detected yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total loans</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(computed.totalLoans)}</p>
          {computed.topLoans.length > 0 ? (
            <ul className="mt-3 text-xs text-slate-700 space-y-1">
              {computed.topLoans.map((l) => (
                <li key={l.originalLine} className="flex items-center justify-between gap-3">
                  <span className="truncate">{l.description || l.originalLine}</span>
                  <span className="font-semibold">{formatCurrency(l.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No loan lines detected yet.</p>
          )}
        </div>
      </div>

      {computed.awardDocsCount === 0 && (
        <p className="mt-4 text-sm text-slate-600">Tip: If your letter doesn’t explicitly say “Scholarship” / “Grant” / “Loan”, detection may miss it.</p>
      )}
    </section>
  )
}
