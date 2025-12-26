'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useUserStore } from '../../lib/store/userStore'

type Suggestion = {
  id: number | null
  name: string
  city: string | null
  state: string | null
}

type ApiResponse = {
  school: { name: string; schoolUrl: string | null; city: string | null; state: string | null }
  costs: {
    tuition: { inState: number | null; outOfState: number | null }
    booksSupply: number | null
    roomBoard: { onCampus: number | null; offCampus: number | null }
    otherExpense: { onCampus: number | null; offCampus: number | null }
    netPrice: {
      average: number | null
      public: Record<string, number | null>
      private: Record<string, number | null>
    }
  }
  retentionRate: number | null
  topMajors: { title: string; count: number; earnings: number | null; debt: number | null }[]
}

function formatMoney(n: number | null | undefined) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return 'N/A'
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function BudgetToolPage() {
  const [schoolName, setSchoolName] = useState('')
  const [schoolId, setSchoolId] = useState<number | null>(null)
  
  // Filters
  const [residency, setResidency] = useState<'in_state' | 'out_of_state'>('in_state')
  const [housing, setHousing] = useState<'on_campus' | 'off_campus'>('on_campus')
  const [livingStatus, setLivingStatus] = useState<'with_family' | 'not_with_family'>('not_with_family')

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestError, setSuggestError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [majorsOpen, setMajorsOpen] = useState(false)

  const { user_AGI, scanned_tax_data } = useUserStore()

  // Table columns management
  const [visibleColumns, setVisibleColumns] = useState({
    tuition: true,
    housing: true,
    books: true,
    other: true,
    total: true,
    netPrice: true
  })

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

      const res = await fetch(url.toString())
      const json = (await res.json()) as ApiResponse | { error: string }

      if (!res.ok || 'error' in json) {
        throw new Error('error' in json ? json.error : 'Failed to fetch school costs.')
      }

      setData(json as ApiResponse)
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

  const calculatedCosts = useMemo(() => {
    if (!data) return null

    const tuition = residency === 'in_state' ? data.costs.tuition.inState : data.costs.tuition.outOfState
    const books = data.costs.booksSupply
    
    let housingCost = 0
    let otherCost = 0

    if (livingStatus === 'with_family') {
        housingCost = 0 
        otherCost = data.costs.otherExpense.offCampus || 0
    } else {
        if (housing === 'on_campus') {
            housingCost = data.costs.roomBoard.onCampus || 0
            otherCost = data.costs.otherExpense.onCampus || 0
        } else {
            housingCost = data.costs.roomBoard.offCampus || 0
            otherCost = data.costs.otherExpense.offCampus || 0
        }
    }

    // Calculate Total based on VISIBLE columns only
    let total = 0
    if (visibleColumns.tuition) total += (tuition || 0)
    if (visibleColumns.books) total += (books || 0)
    if (visibleColumns.housing) total += (housingCost || 0)
    if (visibleColumns.other) total += (otherCost || 0)

    // Smart Financial Aid
    let netPrice = total // Default to total cost if no AGI provided
    let predictedAid = 0
    
    if (user_AGI !== null) {
        let bracket = ''
        if (user_AGI <= 30000) bracket = '0-30000'
        else if (user_AGI <= 48000) bracket = '30001-48000'
        else if (user_AGI <= 75000) bracket = '48001-75000'
        else if (user_AGI <= 110000) bracket = '75001-110000'
        else bracket = '110001-plus'

        const publicPrice = data.costs.netPrice.public?.[bracket]
        const privatePrice = data.costs.netPrice.private?.[bracket]
        
        let apiNetPrice = null
        if (publicPrice) apiNetPrice = publicPrice
        else if (privatePrice) apiNetPrice = privatePrice

        if (apiNetPrice) {
            // Calculate implied aid from full COA
            // We need full COA to calculate aid correctly
            const fullTuition = residency === 'in_state' ? data.costs.tuition.inState : data.costs.tuition.outOfState
            const fullBooks = data.costs.booksSupply
            const fullHousing = housing === 'on_campus' ? data.costs.roomBoard.onCampus : data.costs.roomBoard.offCampus
            const fullOther = housing === 'on_campus' ? data.costs.otherExpense.onCampus : data.costs.otherExpense.offCampus
            
            const fullCOA = (fullTuition || 0) + (fullBooks || 0) + (fullHousing || 0) + (fullOther || 0)
            
            // Aid is what reduces the full price to the net price
            const aid = Math.max(0, fullCOA - apiNetPrice)
            predictedAid = aid
            
            // Dynamic Net Price = Visible Total - Aid
            netPrice = Math.max(0, total - aid)
        }
    }

    return {
        tuition,
        books,
        housing: housingCost,
        other: otherCost,
        total,
        netPrice,
        predictedAid
    }
  }, [data, residency, housing, livingStatus, user_AGI, visibleColumns])

  const copyToClipboard = () => {
    if (!calculatedCosts) return
    const headers = ['Item', 'Cost']
    const rows = [
        ['Tuition', formatMoney(calculatedCosts.tuition)],
        ['Housing', formatMoney(calculatedCosts.housing)],
        ['Books & Supplies', formatMoney(calculatedCosts.books)],
        ['Other Expenses', formatMoney(calculatedCosts.other)],
        ['Total Cost', formatMoney(calculatedCosts.total)],
        ['Net Price', formatMoney(calculatedCosts.netPrice)],
        ['Predicted Aid', formatMoney(calculatedCosts.predictedAid)]
    ]
    
    const csv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n')
    navigator.clipboard.writeText(csv)
    alert('Copied to clipboard!')
  }

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full crimson-pill px-3 py-1 text-sm font-semibold">Budget Tool</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Estimate college costs</h1>
          <p className="text-slate-600">
            Search for a school and compare projected totals based on your residency and housing choices.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/tools" className="btn-crimson-outline inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold">
              Back to Tools
            </Link>
          </div>
        </header>

        {/* Filter Bar */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap gap-4 items-center">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Residency</label>
                <select 
                    value={residency} 
                    onChange={(e) => setResidency(e.target.value as any)}
                    className="rounded-lg border-slate-200 text-sm p-2"
                >
                    <option value="in_state">In-State</option>
                    <option value="out_of_state">Out-of-State</option>
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Housing</label>
                <select 
                    value={housing} 
                    onChange={(e) => setHousing(e.target.value as any)}
                    className="rounded-lg border-slate-200 text-sm p-2"
                >
                    <option value="on_campus">On-Campus</option>
                    <option value="off_campus">Off-Campus</option>
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Living Status</label>
                <select 
                    value={livingStatus} 
                    onChange={(e) => setLivingStatus(e.target.value as any)}
                    className="rounded-lg border-slate-200 text-sm p-2"
                >
                    <option value="not_with_family">Not With Family</option>
                    <option value="with_family">With Family</option>
                </select>
            </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form
            className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end"
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
                    setTimeout(() => setSuggestOpen(false), 150)
                  }}
                  placeholder="e.g., Rutgers University"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              {suggestOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                  {suggestError ? (
                    <div className="px-4 py-3 text-sm text-red-600 bg-red-50">{suggestError}</div>
                  ) : suggestions.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                      {suggestions.map((s) => (
                        <li key={s.id ?? s.name}>
                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setSchoolName(s.name)
                              setSchoolId(s.id)
                              setSuggestOpen(false)
                            }}
                          >
                            <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                            <p className="text-xs text-slate-500">
                              {s.city || s.state ? `${s.city ?? ''}${s.city && s.state ? ', ' : ''}${s.state ?? ''}` : ''}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 italic">
                      No schools found matching "{schoolName}".
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
                type="button"
                onClick={onCalculate}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white disabled:opacity-60 h-[46px]"
            >
                {loading ? (
                <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading
                </span>
                ) : (
                'Calculate'
                )}
            </button>
          </form>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {data && calculatedCosts && (
          <section className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">{data.school.name}</h2>
              <p className="text-sm text-slate-600">
                {data.school.city ? `${data.school.city}, ` : ''}
                {data.school.state ?? ''}
                {data.school.schoolUrl ? (
                  <>
                    {' • '}
                    <a href={data.school.schoolUrl} target="_blank" rel="noreferrer" className="font-semibold crimson-link">
                      Website ↗
                    </a>
                  </>
                ) : null}
              </p>
              {data.retentionRate && (
                  <p className="text-sm text-slate-600">
                      Retention Rate: <span className="font-semibold">{(data.retentionRate * 100).toFixed(1)}%</span>
                  </p>
              )}
            </div>

            {/* Smart Financial Aid Display */}
            {user_AGI !== null && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-blue-900">Personalized Net Price Estimate</h3>
                    <p className="text-sm text-blue-700 mb-4">Based on your AGI of {formatMoney(user_AGI)}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold text-blue-600 uppercase">Estimated Net Price</p>
                            <p className="text-3xl font-bold text-blue-900">{formatMoney(calculatedCosts.netPrice)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-blue-600 uppercase">Predicted Financial Aid</p>
                            <p className="text-3xl font-bold text-green-700">{formatMoney(calculatedCosts.predictedAid)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table View */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Cost Breakdown</h3>
                    <p className="mt-1 text-xs text-slate-600">Customize your view</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex gap-2 text-xs">
                        <label className="flex items-center gap-1"><input type="checkbox" checked={visibleColumns.tuition} onChange={e => setVisibleColumns({...visibleColumns, tuition: e.target.checked})} /> Tuition</label>
                        <label className="flex items-center gap-1"><input type="checkbox" checked={visibleColumns.housing} onChange={e => setVisibleColumns({...visibleColumns, housing: e.target.checked})} /> Housing</label>
                        <label className="flex items-center gap-1"><input type="checkbox" checked={visibleColumns.books} onChange={e => setVisibleColumns({...visibleColumns, books: e.target.checked})} /> Books</label>
                        <label className="flex items-center gap-1"><input type="checkbox" checked={visibleColumns.other} onChange={e => setVisibleColumns({...visibleColumns, other: e.target.checked})} /> Other</label>
                    </div>
                    <button onClick={copyToClipboard} className="text-slate-600 hover:text-slate-900" title="Copy to Clipboard">
                        <Copy className="h-4 w-4" />
                    </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white">
                    <tr className="text-left text-slate-600 border-b border-slate-200">
                      <th className="px-6 py-3 font-semibold">Category</th>
                      <th className="px-6 py-3 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {visibleColumns.tuition && (
                        <tr>
                            <td className="px-6 py-4 font-medium text-slate-900">Tuition ({residency.replace('_', ' ')})</td>
                            <td className="px-6 py-4 text-right text-slate-900">{formatMoney(calculatedCosts.tuition)}</td>
                        </tr>
                    )}
                    {visibleColumns.housing && (
                        <tr>
                            <td className="px-6 py-4 font-medium text-slate-900">Housing ({housing.replace('_', ' ')})</td>
                            <td className="px-6 py-4 text-right text-slate-900">{formatMoney(calculatedCosts.housing)}</td>
                        </tr>
                    )}
                    {visibleColumns.books && (
                        <tr>
                            <td className="px-6 py-4 font-medium text-slate-900">Books & Supplies</td>
                            <td className="px-6 py-4 text-right text-slate-900">{formatMoney(calculatedCosts.books)}</td>
                        </tr>
                    )}
                    {visibleColumns.other && (
                        <tr>
                            <td className="px-6 py-4 font-medium text-slate-900">Other Expenses</td>
                            <td className="px-6 py-4 text-right text-slate-900">{formatMoney(calculatedCosts.other)}</td>
                        </tr>
                    )}
                    {visibleColumns.total && (
                        <tr className="bg-slate-50">
                            <td className="px-6 py-4 font-bold text-slate-900">Total Cost of Attendance</td>
                            <td className="px-6 py-4 text-right font-bold text-slate-900">{formatMoney(calculatedCosts.total)}</td>
                        </tr>
                    )}
                    {visibleColumns.netPrice && (
                        <tr className="bg-blue-50">
                            <td className="px-6 py-4 font-bold text-blue-900">
                                {user_AGI !== null ? 'Net Price (Personalized)' : 'Net Price (No Aid Applied)'}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-blue-900">{formatMoney(calculatedCosts.netPrice)}</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 25 Majors */}
            {data.topMajors && data.topMajors.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <button 
                        onClick={() => setMajorsOpen(!majorsOpen)}
                        className="w-full px-6 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                        <h3 className="text-sm font-semibold text-slate-900">Popular Majors (Top 25)</h3>
                        {majorsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {majorsOpen && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3">Major</th>
                                        <th className="px-6 py-3 text-right">Graduates</th>
                                        <th className="px-6 py-3 text-right">Median Earnings</th>
                                        <th className="px-6 py-3 text-right">Median Debt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.topMajors.map((m, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-slate-900">{m.title}</td>
                                            <td className="px-6 py-3 text-right text-slate-600">{m.count}</td>
                                            <td className="px-6 py-3 text-right text-slate-600">{formatMoney(m.earnings)}</td>
                                            <td className="px-6 py-3 text-right text-slate-600">{formatMoney(m.debt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

          </section>
        )}
      </div>
    </div>
  )
}
