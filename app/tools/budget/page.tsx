'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

type Suggestion = {
  id: number | null
  name: string
  city: string | null
  state: string | null
}

type ApiResponse =
  | {
      raw: {
        school: { name: string; schoolUrl: string | null; city: string | null; state: string | null }
        tuition: { inState: number | null; outOfState: number | null }
        booksSupply: number | null
        roomBoard: { onCampus: number | null; offCampus: number | null }
        otherExpense: { onCampus: number | null; offCampus: number | null }
      }
      projection: {
        years: number
        inflationRate: number
        tuitionMode: 'in_state' | 'out_of_state'
        onCampus: { tuition: number; housing: number; foodOther: number; books: number; total: number }
        offCampus: { tuition: number; housing: number; foodOther: number; books: number; total: number }
      }
    }
  | { error: string }

function formatMoney(n: number | null | undefined) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return 'N/A'
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatMoney0(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function BudgetToolPage() {
  const [schoolName, setSchoolName] = useState('')
  const [schoolId, setSchoolId] = useState<number | null>(null)
  const [years, setYears] = useState(4)
  const [inflationRate, setInflationRate] = useState(3)

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestError, setSuggestError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Exclude<ApiResponse, { error: string }> | null>(null)

  const inflationLabel = useMemo(() => `${inflationRate.toFixed(0)}%`, [inflationRate])

  useEffect(() => {
    const q = schoolName.trim()
    abortRef.current?.abort()

    if (q.length < 2) {
      setSuggestions([])
      setSuggestOpen(false)
      setSuggestError(null)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    const t = setTimeout(async () => {
      try {
        const url = new URL('/api/college-suggest', window.location.origin)
        url.searchParams.set('query', q)
        const res = await fetch(url.toString(), { signal: controller.signal })
        const json = (await res.json()) as { results?: Suggestion[]; error?: string }
        if (!res.ok) {
          const msg = json && typeof json === 'object' && typeof json.error === 'string' ? json.error : 'Suggestions unavailable.'
          setSuggestError(msg)
          setSuggestions([])
          setSuggestOpen(true)
          return
        }

        const next = Array.isArray(json.results) ? json.results : []
        setSuggestError(null)
        setSuggestions(next)
        setSuggestOpen(true)
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setSuggestError('Suggestions unavailable.')
        setSuggestions([])
        setSuggestOpen(true)
      }
    }, 250)

    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [schoolName])

  async function onCalculate() {
    const q = schoolName.trim()
    if (!q) {
      setError('Please enter a university name.')
      setData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = new URL('/api/college-cost', window.location.origin)
      if (typeof schoolId === 'number' && Number.isFinite(schoolId)) {
        url.searchParams.set('schoolId', String(schoolId))
      } else {
        url.searchParams.set('schoolName', q)
      }
      url.searchParams.set('years', String(years))
      url.searchParams.set('inflationRate', String(inflationRate))

      const res = await fetch(url.toString())
      const json = (await res.json()) as ApiResponse

      if (!res.ok || 'error' in json) {
        throw new Error('error' in json ? json.error : 'Failed to fetch school costs.')
      }

      setData(json)
    } catch (e) {
      setData(null)
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      if (message.includes('Missing COLLEGE_SCORECARD_API_KEY')) {
        setError('Missing server API key. Create a .env.local file and set COLLEGE_SCORECARD_API_KEY, then restart the dev server.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full crimson-pill px-3 py-1 text-sm font-semibold">Budget Tool</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Estimate college costs</h1>
          <p className="text-slate-600">
            Search for a school and compare projected totals for living on campus vs. off campus using public government data.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/tools" className="btn-crimson-outline inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold">
              Back to Tools
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form
            className="grid gap-5 md:grid-cols-[1.4fr_repeat(2,1fr)] md:items-end"
            onSubmit={(e) => {
              e.preventDefault()
              onCalculate()
            }}
          >
            <div className="space-y-2 relative">
              <label htmlFor="schoolName" className="text-sm font-semibold text-slate-900">
                University name
              </label>
              <div className="flex gap-2">
                <input
                  id="schoolName"
                  type="text"
                  value={schoolName}
                  onChange={(e) => {
                    setSchoolName(e.target.value)
                    setSchoolId(null)
                    setSuggestOpen(true)
                  }}
                  onFocus={() => {
                    if (suggestions.length) setSuggestOpen(true)
                  }}
                  onBlur={() => {
                    // Let click events on suggestions register before closing.
                    setTimeout(() => setSuggestOpen(false), 150)
                  }}
                  placeholder="e.g., Rutgers University"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
                <button
                  type="button"
                  onClick={onCalculate}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading
                    </span>
                  ) : (
                    'Calculate'
                  )}
                </button>
              </div>

              {suggestOpen && (suggestions.length > 0 || !!suggestError) && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {suggestError ? (
                    <div className="px-4 py-3 text-sm text-slate-700">{suggestError}</div>
                  ) : (
                    <ul className="divide-y divide-slate-200">
                      {suggestions.map((s) => (
                        <li key={s.id ?? s.name}>
                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-slate-50"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setSchoolName(s.name)
                              setSchoolId(s.id)
                              setSuggestOpen(false)
                            }}
                          >
                            <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                            <p className="text-xs text-slate-600">
                              {s.city || s.state ? `${s.city ?? ''}${s.city && s.state ? ', ' : ''}${s.state ?? ''}` : ''}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="inflation" className="text-sm font-semibold text-slate-900">
                Inflation rate
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">0%</span>
                  <span className="font-semibold text-slate-900">{inflationLabel}</span>
                  <span className="text-slate-600">10%</span>
                </div>
                <input
                  id="inflation"
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="years" className="text-sm font-semibold text-slate-900">
                Years
              </label>
              <input
                id="years"
                type="number"
                min={1}
                max={6}
                value={years}
                onChange={(e) => setYears(Math.min(6, Math.max(1, Number(e.target.value))))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </form>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <p className="mt-5 text-xs text-slate-500 leading-relaxed">
            Disclaimer: These are estimates based on reported government data and an inflation assumption.
            Actual costs vary by year, program, housing choice, and personal expenses.
          </p>
        </section>

        {data && (
          <section className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">{data.raw.school.name}</h2>
              <p className="text-sm text-slate-600">
                {data.raw.school.city ? `${data.raw.school.city}, ` : ''}
                {data.raw.school.state ?? ''}
                {data.raw.school.schoolUrl ? (
                  <>
                    {' • '}
                    <a href={data.raw.school.schoolUrl} target="_blank" rel="noreferrer" className="font-semibold crimson-link">
                      Website ↗
                    </a>
                  </>
                ) : null}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Estimated {data.projection.years}-year total</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{formatMoney0(data.projection.onCampus.total)}</p>
                <p className="mt-1 text-sm text-slate-600">Living on campus</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Estimated {data.projection.years}-year total</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{formatMoney0(data.projection.offCampus.total)}</p>
                <p className="mt-1 text-sm text-slate-600">Living off campus</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-900">On-campus vs Off-campus (projected totals)</h3>
                <p className="mt-1 text-xs text-slate-600">Assumes {Math.round(data.projection.inflationRate * 100)}% annual inflation.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white">
                    <tr className="text-left text-slate-600">
                      <th className="px-6 py-3 font-semibold">Line item</th>
                      <th className="px-6 py-3 font-semibold">On-campus</th>
                      <th className="px-6 py-3 font-semibold">Off-campus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">Tuition</p>
                        <p className="mt-1 text-xs text-slate-500">
                          In-state: {formatMoney(data.raw.tuition.inState)} • Out-of-state: {formatMoney(data.raw.tuition.outOfState)}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatMoney0(data.projection.onCampus.tuition)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatMoney0(data.projection.offCampus.tuition)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-slate-900">Housing (Room & Board)</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatMoney0(data.projection.onCampus.housing)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatMoney0(data.projection.offCampus.housing)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-slate-900">Food/Other</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatMoney0(data.projection.onCampus.foodOther)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatMoney0(data.projection.offCampus.foodOther)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-slate-900">Books & Supplies</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatMoney0(data.projection.onCampus.books)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatMoney0(data.projection.offCampus.books)}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">Total</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatMoney0(data.projection.onCampus.total)}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatMoney0(data.projection.offCampus.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
