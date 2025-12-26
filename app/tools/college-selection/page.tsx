'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'

type Suggestion = {
  id: number | null
  name: string
  city: string | null
  state: string | null
}

type ApiResponse = {
  school: { name: string; schoolUrl: string | null; city: string | null; state: string | null }
  scorecard: Record<string, number | string | null>
  greekLife?: {
    participation: { men: number; women: number }
    chapters: string[]
  }
  vibes?: {
    atmosphere: string
    goingOutScene: string
    stereotypes: string[]
  }
  selection: {
    size: number | null
    locale: number | null
    demographics: Record<string, number | null> | null
    admissionRate: number | null
    satScores: number | null
    sat25: number | null
    sat75: number | null
    actMidpoint: number | null
    ownership: number | null
    predominantDegree: number | null
    carnegieBasic: number | null
    partTimeShare: number | null
    gradStudents: number | null
    menShare: number | null
    womenShare: number | null
    firstGenShare: number | null
    retentionRate: number | null
    completionRate: number | null
    earnings10yrMedian: number | null
    repayment3yr: number | null
    programMix: {
      engineering: number | null
      businessMarketing: number | null
      computer: number | null
      biological: number | null
      health: number | null
    }
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

function getOwnershipText(code: number | null) {
    if (!code) return 'Unknown'
    if (code === 1) return 'Public'
    if (code === 2) return 'Private Nonprofit'
    if (code === 3) return 'Private For-Profit'
    return 'Unknown'
}

function getPredominantDegreeText(code: number | null) {
    if (!code) return 'Unknown'
    if (code === 1) return 'Certificate'
    if (code === 2) return "Associate's"
    if (code === 3) return "Bachelor's"
    if (code === 4) return 'Graduate'
    return 'Unknown'
}

function formatPercent(n: number | null) {
    if (typeof n !== 'number') return 'N/A'
    return `${(n * 100).toFixed(1)}%`
}

function formatMoney(n: number | null | undefined) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return 'N/A'
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatNumber(n: number | null) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return 'N/A'
    return n.toLocaleString()
}

function formatScorecardValue(v: unknown) {
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (v >= 0 && v <= 1) return formatPercent(v)
    return formatMoney(v)
  }
  if (v === null || v === undefined) return 'N/A'
  if (typeof v === 'string' && v.trim().length) return v
  return 'N/A'
}

const FIELD_CONFIG: Record<string, { label: string; format?: (v: any) => string }> = {
  'school.name': { label: 'School Name' },
  'school.school_url': { label: 'Website' },
  'school.city': { label: 'City' },
  'school.state': { label: 'State' },
  'school.locale': { label: 'Locale', format: (v) => getLocaleText(v as number) },
  'school.ownership': { label: 'Ownership', format: (v) => getOwnershipText(v as number) },
  'school.degrees_awarded.predominant': { label: 'Predominant Degree', format: (v) => getPredominantDegreeText(v as number) },
  'school.carnegie_basic': { label: 'Carnegie Classification' },
  'latest.student.size': { label: 'Undergraduate Size', format: formatNumber },
  'latest.student.part_time_share': { label: 'Part-time Share', format: formatPercent },
  'latest.student.grad_students': { label: 'Graduate Students', format: formatNumber },
  'latest.student.demographics.men': { label: 'Men', format: formatPercent },
  'latest.student.demographics.women': { label: 'Women', format: formatPercent },
  'latest.student.share_firstgeneration': { label: 'First Generation', format: formatPercent },
  'latest.admissions.admission_rate.overall': { label: 'Admission Rate', format: formatPercent },
  'latest.admissions.sat_scores.average.overall': { label: 'Average SAT', format: formatNumber },
  'latest.admissions.sat_scores.25th_percentile.overall': { label: 'SAT 25th Percentile', format: formatNumber },
  'latest.admissions.sat_scores.75th_percentile.overall': { label: 'SAT 75th Percentile', format: formatNumber },
  'latest.admissions.act_scores.midpoint.cumulative': { label: 'ACT Midpoint', format: formatNumber },
  'latest.student.retention_rate.four_year.full_time': { label: 'Retention Rate', format: formatPercent },
  'latest.completion.rate_suppressed.overall': { label: 'Completion Rate', format: formatPercent },
  'latest.earnings.10_yrs_after_entry.median': { label: 'Median Earnings (10 yrs)', format: formatMoney },
  'latest.repayment.3_yr_repayment.overall': { label: '3-Year Repayment Rate', format: formatPercent },
  'latest.academics.program_percentage.engineering': { label: 'Engineering', format: formatPercent },
  'latest.academics.program_percentage.business_marketing': { label: 'Business/Marketing', format: formatPercent },
  'latest.academics.program_percentage.computer': { label: 'Computer Science', format: formatPercent },
  'latest.academics.program_percentage.biological': { label: 'Biological Sciences', format: formatPercent },
  'latest.academics.program_percentage.health': { label: 'Health Professions', format: formatPercent },
  'latest.student.demographics.race_ethnicity': { label: 'Race/Ethnicity' },
}

export default function CollegeSelectionPage() {
  const [schoolName, setSchoolName] = useState('')
  const [schoolId, setSchoolId] = useState<number | null>(null)
  
  // User Stats for Fit Check
  const [userGPA, setUserGPA] = useState<number | ''>('')
  const [userSAT, setUserSAT] = useState<number | ''>('')
  const [userACT, setUserACT] = useState<number | ''>('')
  const [statsOpen, setStatsOpen] = useState(false)

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestError, setSuggestError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ApiResponse | null>(null)

  const SCORECARD_CATEGORIES = {
    school: {
      label: 'School basics',
      keys: [
        'school.name',
        'school.school_url',
        'school.city',
        'school.state',
        'school.locale',
        'school.ownership',
        'school.degrees_awarded.predominant',
        'school.carnegie_basic',
      ],
    },
    students: {
      label: 'Students',
      keys: [
        'latest.student.size',
        'latest.student.part_time_share',
        'latest.student.grad_students',
        'latest.student.demographics.men',
        'latest.student.demographics.women',
        'latest.student.share_firstgeneration',
      ],
    },
    admissions: {
      label: 'Admissions/testing',
      keys: [
        'latest.admissions.admission_rate.overall',
        'latest.admissions.sat_scores.average.overall',
        'latest.admissions.sat_scores.25th_percentile.overall',
        'latest.admissions.sat_scores.75th_percentile.overall',
        'latest.admissions.act_scores.midpoint.cumulative',
      ],
    },
    outcomes: {
      label: 'Outcomes/ROI',
      keys: [
        'latest.student.retention_rate.four_year.full_time',
        'latest.completion.rate_suppressed.overall',
        'latest.earnings.10_yrs_after_entry.median',
        'latest.repayment.3_yr_repayment.overall',
      ],
    },
    academics: {
      label: 'Academic mix',
      keys: [
        'latest.academics.program_percentage.engineering',
        'latest.academics.program_percentage.business_marketing',
        'latest.academics.program_percentage.computer',
        'latest.academics.program_percentage.biological',
        'latest.academics.program_percentage.health',
      ],
    },
    demographics: {
      label: 'Race/ethnicity (overall)',
      keys: ['latest.student.demographics.race_ethnicity'],
    },
  } as const

  const [scorecardVisible, setScorecardVisible] = useState(() => ({
    school: true,
    students: true,
    admissions: true,
    outcomes: false,
    academics: false,
    demographics: false,
  }))

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
          <div className="mb-6 flex items-center justify-between">
             <h2 className="text-lg font-bold text-slate-900">Search & Fit Check</h2>
             <button 
                onClick={() => setStatsOpen(!statsOpen)}
                className="text-sm font-semibold text-crimson-600 hover:text-crimson-700 flex items-center gap-1"
            >
                {statsOpen ? 'Hide My Stats' : 'Enter My Stats'}
                {statsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {statsOpen && (
            <div className="mb-6 grid gap-4 md:grid-cols-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">GPA (Weighted)</label>
                    <input 
                        type="number" 
                        value={userGPA} 
                        onChange={(e) => setUserGPA(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 3.8"
                        className="w-full rounded-lg border-slate-200 text-sm p-2"
                        step="0.01"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">SAT Score</label>
                    <input 
                        type="number" 
                        value={userSAT} 
                        onChange={(e) => setUserSAT(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 1350"
                        className="w-full rounded-lg border-slate-200 text-sm p-2"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">ACT Score</label>
                    <input 
                        type="number" 
                        value={userACT} 
                        onChange={(e) => setUserACT(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 29"
                        className="w-full rounded-lg border-slate-200 text-sm p-2"
                    />
                </div>
            </div>
          )}

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
                      No schools found matching “{schoolName}”.
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

            {/* Admissions Fit Check */}
            {(userSAT !== '' || userACT !== '') && (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-indigo-900">Admissions Fit Check</h3>
                    <p className="text-sm text-indigo-700 mb-4">Comparing your stats to the middle 50% of admitted students.</p>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* SAT Comparison */}
                        {userSAT !== '' && data.selection.sat25 && data.selection.sat75 && (
                            <div>
                                <div className="flex justify-between text-sm font-semibold mb-2">
                                    <span className="text-indigo-800">SAT Score</span>
                                    <span className="text-indigo-900">{userSAT} (You)</span>
                                </div>
                                <div className="relative h-8 bg-white rounded-full border border-indigo-100 w-full flex items-center">
                                    {/* Range Bar */}
                                    <div 
                                        className="absolute h-full bg-indigo-200 rounded-full opacity-50 left-[20%] w-[60%]"
                                    />
                                    {/* Labels for 25th/75th */}
                                    <div className="absolute left-[20%] -bottom-6 text-xs text-slate-500 transform -translate-x-1/2">
                                        {data.selection.sat25}
                                    </div>
                                    <div className="absolute left-[80%] -bottom-6 text-xs text-slate-500 transform -translate-x-1/2">
                                        {data.selection.sat75}
                                    </div>
                                    
                                    {/* User Marker */}
                                    {(() => {
                                        // Normalize user score to visual range (approx 400-1600 scale mapped to 0-100%)
                                        // But for simplicity, let's map 25th to 20% and 75th to 80%
                                        const range = (data.selection.sat75 || 1600) - (data.selection.sat25 || 400)
                                        const diff = (userSAT as number) - (data.selection.sat25 || 400)
                                        let pos = 20 + (diff / range) * 60
                                        pos = Math.max(5, Math.min(95, pos))
                                        
                                        let label = 'Target'
                                        let color = 'bg-yellow-500'
                                        if ((userSAT as number) >= (data.selection.sat75 || 1600)) {
                                            label = 'Safety'
                                            color = 'bg-green-500'
                                        } else if ((userSAT as number) < (data.selection.sat25 || 400)) {
                                            label = 'Reach'
                                            color = 'bg-red-500'
                                        } else {
                                            color = 'bg-blue-500'
                                        }

                                        return (
                                            <div 
                                                className={`absolute w-4 h-4 ${color} rounded-full border-2 border-white shadow-sm z-10`}
                                                style={{ left: `${pos}%` }}
                                                title={`Your Score: ${userSAT} (${label})`}
                                            >
                                                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs font-bold text-indigo-900 bg-white px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                                                    {label}
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                                <div className="mt-8 text-xs text-center text-slate-500">
                                    Middle 50% Range: {data.selection.sat25} - {data.selection.sat75}
                                </div>
                            </div>
                        )}

                        {/* ACT Comparison */}
                        {userACT !== '' && data.selection.actMidpoint && (
                            <div>
                                <div className="flex justify-between text-sm font-semibold mb-2">
                                    <span className="text-indigo-800">ACT Score</span>
                                    <span className="text-indigo-900">{userACT} (You)</span>
                                </div>
                                <div className="relative h-8 bg-white rounded-full border border-indigo-100 w-full flex items-center">
                                    {/* Midpoint Marker */}
                                    <div className="absolute left-1/2 h-full w-0.5 bg-indigo-300"></div>
                                    <div className="absolute left-1/2 -bottom-6 text-xs text-slate-500 transform -translate-x-1/2">
                                        {data.selection.actMidpoint} (Avg)
                                    </div>

                                    {/* User Marker */}
                                    {(() => {
                                        // ACT Scale 1-36
                                        // Map midpoint to 50%
                                        // Let's say range is +/- 10 points visually
                                        const mid = data.selection.actMidpoint || 25
                                        const diff = (userACT as number) - mid
                                        let pos = 50 + (diff * 2.5) // 1 point = 2.5%
                                        pos = Math.max(5, Math.min(95, pos))

                                        let label = 'Target'
                                        let color = 'bg-blue-500'
                                        if ((userACT as number) >= mid + 2) {
                                            label = 'Safety'
                                            color = 'bg-green-500'
                                        } else if ((userACT as number) <= mid - 2) {
                                            label = 'Reach'
                                            color = 'bg-red-500'
                                        }

                                        return (
                                            <div 
                                                className={`absolute w-4 h-4 ${color} rounded-full border-2 border-white shadow-sm z-10`}
                                                style={{ left: `${pos}%` }}
                                                title={`Your Score: ${userACT} (${label})`}
                                            >
                                                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs font-bold text-indigo-900 bg-white px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                                                    {label}
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                                <div className="mt-8 text-xs text-center text-slate-500">
                                    School Average: {data.selection.actMidpoint}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Campus Vibe */}
            {data.vibes && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Campus Vibe</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Atmosphere</p>
                    <p className="text-slate-900 font-medium">{data.vibes.atmosphere}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Going Out Scene</p>
                    <p className="text-slate-900 font-medium">{data.vibes.goingOutScene}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Stereotypes</p>
                    <div className="flex flex-wrap gap-2">
                      {data.vibes.stereotypes.map(t => (
                        <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-slate-900">Scorecard spreadsheet</h3>
                <p className="text-xs text-slate-600">Select categories to populate the grid.</p>
              </div>

              <div className="grid gap-0 md:grid-cols-[260px_1fr]">
                <div className="border-b md:border-b-0 md:border-r border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Categories</p>
                  <div className="mt-3 space-y-2">
                    {(Object.keys(SCORECARD_CATEGORIES) as (keyof typeof SCORECARD_CATEGORIES)[]).map((k) => (
                      <label key={k} className="flex items-start gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={Boolean((scorecardVisible as any)[k])}
                          onChange={(e) => setScorecardVisible((prev) => ({ ...prev, [k]: e.target.checked }))}
                        />
                        <span>{SCORECARD_CATEGORIES[k].label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {(() => {
                    const selectedKeys = new Set<string>()
                    for (const k of Object.keys(SCORECARD_CATEGORIES) as (keyof typeof SCORECARD_CATEGORIES)[]) {
                      if ((scorecardVisible as any)[k]) {
                        for (const key of SCORECARD_CATEGORIES[k].keys) selectedKeys.add(key)
                      }
                    }

                    const rows = Array.from(selectedKeys)
                      .filter((key) => Object.prototype.hasOwnProperty.call(data.scorecard, key))
                      .map((key) => {
                        const config = FIELD_CONFIG[key]
                        const rawValue = data.scorecard[key]
                        const formatted = config?.format ? config.format(rawValue) : formatScorecardValue(rawValue)
                        return { key, value: rawValue, formatted, label: config?.label || key }
                      })
                      .filter((row) => row.formatted !== 'N/A' && row.formatted !== 'Unknown')
                      .sort((a, b) => a.label.localeCompare(b.label))

                    if (rows.length === 0) {
                      return (
                        <div className="p-6 text-sm text-slate-600">No data available for selected categories.</div>
                      )
                    }

                    return (
                      <table className="min-w-full text-xs">
                        <thead className="bg-white">
                          <tr className="text-left text-slate-600 border-b border-slate-200">
                            <th className="px-4 py-2 font-semibold">Field</th>
                            <th className="px-4 py-2 font-semibold">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rows.map(({ key, formatted, label }) => (
                            <tr key={key} className="hover:bg-slate-50">
                              <td className="px-4 py-2 text-slate-800 border-r border-slate-100 whitespace-nowrap font-medium">{label}</td>
                              <td className="px-4 py-2 text-slate-900 whitespace-nowrap">{formatted}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  })()}
                </div>
              </div>
            </div>

            {data.greekLife && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-sm font-semibold text-slate-900">Greek Life</h3>
                </div>
                <div className="p-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Participation</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-700">Men in Fraternities</span>
                        <span className="font-medium text-slate-900">{formatPercent(data.greekLife.participation.men)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-700">Women in Sororities</span>
                        <span className="font-medium text-slate-900">{formatPercent(data.greekLife.participation.women)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Chapters ({data.greekLife.chapters.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.greekLife.chapters.map(c => (
                        <span key={c} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                                              <progress
                                                className="w-full h-2.5 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-slate-900 [&::-moz-progress-bar]:bg-slate-900"
                                                value={Math.max(0, Math.min(100, (val || 0) * 100))}
                                                max={100}
                                              />
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
