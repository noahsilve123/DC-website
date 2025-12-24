'use client'

import { useMemo } from 'react'
import { useDocumentStore } from '../../lib/store/documentStore'

type Money = string | number | null | undefined

function toNumber(v: Money): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const cleaned = v.replace(/[^0-9.]/g, '')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function FafsaInterpreter() {
  const docs = useDocumentStore((s) => s.documents)

  const computed = useMemo(() => {
    const assigned = docs.filter((d) => d.assignedOwner && d.status === 'complete')

    const byOwner = (owner: 'student' | 'parent1' | 'parent2') => assigned.filter((d) => d.assignedOwner === owner)

    const sum = (rows: any[], field: string) => rows.reduce((acc, d) => acc + toNumber(d.extractedData?.[field]), 0)

    const studentDocs = byOwner('student')
    const parent1Docs = byOwner('parent1')
    const parent2Docs = byOwner('parent2')

    const parentDocs = [...parent1Docs, ...parent2Docs]

    return {
      hasDocs: docs.length > 0,
      hasAssigned: assigned.length > 0,
      unassignedCount: docs.filter((d) => !d.assignedOwner).length,

      student: {
        wages: sum(studentDocs, 'wages'),
        agi: sum(studentDocs, 'agi'),
        federalTax: sum(studentDocs, 'federalTax'),
      },
      parent: {
        wages: sum(parentDocs, 'wages'),
        agi: sum(parentDocs, 'agi'),
        federalTax: sum(parentDocs, 'federalTax'),
      },
    }
  }, [docs])

  if (!computed.hasDocs) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold text-slate-900">FAFSA numbers (from your uploaded docs)</h2>
        <p className="mt-2 text-sm text-slate-600">Upload documents in the Extractor on the Tools page first.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">FAFSA numbers (from your uploaded docs)</h2>
          <p className="mt-1 text-sm text-slate-600">These totals come from extracted tax forms. Assign each document to Student / Parent.</p>
        </div>
        {computed.unassignedCount > 0 && (
          <p className="text-xs font-semibold text-amber-700">{computed.unassignedCount} unassigned document(s)</p>
        )}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Student (assigned docs)</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Wages</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(computed.student.wages)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">AGI</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(computed.student.agi)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Federal tax</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(computed.student.federalTax)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Parents (Parent 1 + Parent 2)</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Wages</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(computed.parent.wages)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">AGI</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(computed.parent.agi)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Federal tax</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(computed.parent.federalTax)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {!computed.hasAssigned && (
        <p className="mt-4 text-sm text-slate-600">Assign owners in the Extractor document list to see totals here.</p>
      )}
    </section>
  )
}
