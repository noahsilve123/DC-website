'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

type Suggestion = {
  id: number | null
  name: string
  city: string | null
  state: string | null
}

type ApiResponse = {
  school: { name: string; schoolUrl: string | null; city: string | null; state: string | null }
  selection: {
    size: number | null
    locale: number | null
    demographics: Record<string, number | null> | null
    admissionRate: number | null
    satScores: number | null
  }
}

function getLocaleText(code: number | null) {
    if (!code) return 'Unknown'
    // 11-13: City, 21-23: Suburb, 31-33: Town, 41-43: Rural
    if (code >= 11 && code <= 13) return 'Urban (City)'
    if (code >= 21 && code <= 23) return 'Suburban'
    if (code >= 31 && code <= 33) return 'Town'
    if (code >= 41 && code <= 43) return 'Rural'
    return 'Unknown'
}

function formatPercent(n: number | null) {
    if (typeof n !== 'number') return 'N/A'
    return `${(n * 100).toFixed(1)}%`
}

export default function CollegeSelectionPage() {
  const [schoolName, setSchoolName] = useState('')
  const [schoolId, setSchoolId] = useState<number | null>(null)
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestError, setSuggestError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ApiResponse | null>(null)

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

  async function onSearch() {
    const q = schoolName.trim()
    if (!q) {
      setError('Please enter a university name.')
      setData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = new URL('/api/college-selection', window.location.origin)
      if (typeof schoolId === 'number' && Number.isFinite(schoolId)) {
        url.searchParams.set('schoolId', String(schoolId))
      } else {
        // If no ID, we can't fetch details easily with current API setup for selection
        // But let's assume user selected from dropdown or we force them to.
        // Or we could implement name search in selection API too.
        // For now, let's error if no ID, or try to find it via suggest first?
        // Actually, let's just error and tell them to select from list.
        // Or better, call suggest, pick first result, then get ID.
        // Let's try to use the ID if available, otherwise error.
        if (!schoolId) {
            throw new Error('Please select a school from the suggestions.')
        }
        url.searchParams.set('schoolId', String(schoolId))
      }

      const res = await fetch(url.toString())
      const json = (await res.json()) as ApiResponse | { error: string }

      if (!res.ok || 'error' in json) {
        throw new Error('error' in json ? json.error : 'Failed to fetch school data.')
      }

      setData(json as ApiResponse)
    } catch (e) {
      setData(null)
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full crimson-pill px-3 py-1 text-sm font-semibold">College Selection</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Find your fit</h1>
          <p className="text-slate-600">
            Explore campus culture, diversity, and academic stats to find the right environment for you.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/tools" className="btn-crimson-outline inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold">
              Back to Tools
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form
            className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end"
            onSubmit={(e) => {
              e.preventDefault()
              onSearch()
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
                onClick={onSearch}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white disabled:opacity-60 h-[46px]"
            >
                {loading ? (
                <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading
                </span>
                ) : (
                'Search'
                )}
            </button>
          </form>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {data && (
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
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Undergrad Size</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{data.selection.size?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Setting</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{getLocaleText(data.selection.locale)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Admission Rate</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{formatPercent(data.selection.admissionRate)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg SAT Score</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{data.selection.satScores || 'N/A'}</p>
                </div>
            </div>

            {data.selection.demographics && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="text-sm font-semibold text-slate-900">Student Diversity</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {Object.entries(data.selection.demographics)
                                .filter(([_, val]) => val && val > 0)
                                .sort(([, a], [, b]) => (b || 0) - (a || 0))
                                .map(([key, val]) => {
                                    const label = key.replace('aian', 'American Indian/Alaska Native')
                                                     .replace('asian', 'Asian')
                                                     .replace('black', 'Black')
                                                     .replace('hispanic', 'Hispanic')
                                                     .replace('nhpi', 'Native Hawaiian/Pacific Islander')
                                                     .replace('non_resident_alien', 'International')
                                                     .replace('two_or_more', 'Two or more races')
                                                     .replace('unknown', 'Unknown')
                                                     .replace('white', 'White');
                                    return (
                                        <div key={key}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-700">{label}</span>
                                                <span className="font-semibold text-slate-900">{formatPercent(val)}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                                <div className="bg-slate-900 h-2.5 rounded-full" style={{ width: `${(val || 0) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
