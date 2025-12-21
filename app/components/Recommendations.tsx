'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { Recommendation } from '../lib/recommendations'

export default function Recommendations() {
  const [results, setResults] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRecs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstGen: true, needsMentor: true, interests: ['stem'] }),
      })
      const data = await res.json()
      const recommended = Array.isArray(data) ? data : data.results ?? []
      setResults(recommended)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchRecs()
  }, [])

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Personalized picks</p>
          <h2 className="text-2xl font-semibold text-gray-900">Where to focus next</h2>
          <p className="text-sm text-gray-600">We look at your interests and first-gen status to spotlight resources.</p>
        </div>
        <button
          type="button"
          onClick={fetchRecs}
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          disabled={loading}
        >
          <Sparkles size={14} /> Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {results.map((item) => (
          <article key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{item.type}</p>
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-700">{item.description}</p>
            <p className="mt-1 text-xs text-gray-500">Why: {item.reason}</p>
            <Link href={item.link} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold crimson-link">
              Open <ArrowRight size={14} />
            </Link>
          </article>
        ))}
        {!results.length && !loading && <p className="text-sm text-gray-600">No recommendations yet. Try refreshing.</p>}
      </div>
    </section>
  )
}
