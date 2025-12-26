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
  scorecard: Record<string, number | string | null>
  costs: {
    tuition: { inState: number | null; outOfState: number | null }
    booksSupply: number | null
    roomBoard: { onCampus: number | null; offCampus: number | null }
    otherExpense: { onCampus: number | null; offCampus: number | null; withFamily: number | null }
    netPrice: {
      average: number | null
      public: Record<string, number | null>
      private: Record<string, number | null>
    }
  }
  financial: {
    medianDebtCompletersOverall: number | null
    medianDebtNoncompleters: number | null
    threeYearRepaymentOverall: number | null
    federalLoanRate: number | null
    instructionalExpenditurePerFte: number | null
    earningsMedian10YrsAfterEntry: number | null
  }
  retentionRate: number | null
  topMajors: { title: string; count: number; earnings: number | null; debt: number | null }[]
}

function formatMoney(n: number | null | undefined) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return 'N/A'
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatPercent(n: number | null | undefined) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return 'N/A'
  return `${(n * 100).toFixed(1)}%`
}

function formatScorecardValue(v: unknown) {
  if (typeof v === 'number' && Number.isFinite(v)) {
    // Heuristic: 0..1 looks like a rate
    if (v >= 0 && v <= 1) return formatPercent(v)
    // Otherwise treat as a count/dollars; most of our budget fields are dollar-like.
    return formatMoney(v)
  }
  if (v === null || v === undefined) return 'N/A'
  if (typeof v === 'string' && v.trim().length) return v
  return 'N/A'
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

function formatNumber(n: number | null) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return 'N/A'
    return n.toLocaleString()
}

function calculateMonthlyPayment(principal: number, rate: number, years: number = 10) {
    if (!principal) return 0
    const r = (rate || 0.055) / 12
    const n = years * 12
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

const FIELD_CONFIG: Record<string, { label: string; format?: (v: any) => string }> = {
  'school.name': { label: 'School Name' },
  'school.school_url': { label: 'Website' },
  'school.city': { label: 'City' },
  'school.state': { label: 'State' },
  'school.ownership': { label: 'Ownership', format: (v) => getOwnershipText(v as number) },
  'school.degrees_awarded.predominant': { label: 'Predominant Degree', format: (v) => getPredominantDegreeText(v as number) },
  'school.carnegie_basic': { label: 'Carnegie Classification' },
  
  'latest.cost.tuition.in_state': { label: 'In-State Tuition', format: formatMoney },
  'latest.cost.tuition.out_of_state': { label: 'Out-of-State Tuition', format: formatMoney },
  'latest.cost.booksupply': { label: 'Books & Supplies', format: formatMoney },
  'latest.cost.roomboard.oncampus': { label: 'On-Campus Room & Board', format: formatMoney },
  'latest.cost.roomboard.offcampus': { label: 'Off-Campus Room & Board', format: formatMoney },
  'latest.cost.otherexpense.oncampus': { label: 'On-Campus Other Expenses', format: formatMoney },
  'latest.cost.otherexpense.offcampus': { label: 'Off-Campus Other Expenses', format: formatMoney },
  'latest.cost.otherexpense.withfamily': { label: 'With Family Other Expenses', format: formatMoney },
  'latest.cost.avg_net_price.overall': { label: 'Average Net Price', format: formatMoney },
  
  'latest.cost.net_price.public.by_income_level.0-30000': { label: 'Net Price (Public, $0-$30k)', format: formatMoney },
  'latest.cost.net_price.public.by_income_level.30001-48000': { label: 'Net Price (Public, $30k-$48k)', format: formatMoney },
  'latest.cost.net_price.public.by_income_level.48001-75000': { label: 'Net Price (Public, $48k-$75k)', format: formatMoney },
  'latest.cost.net_price.public.by_income_level.75001-110000': { label: 'Net Price (Public, $75k-$110k)', format: formatMoney },
  'latest.cost.net_price.public.by_income_level.110001-plus': { label: 'Net Price (Public, $110k+)', format: formatMoney },
  
  'latest.cost.net_price.private.by_income_level.0-30000': { label: 'Net Price (Private, $0-$30k)', format: formatMoney },
  'latest.cost.net_price.private.by_income_level.30001-48000': { label: 'Net Price (Private, $30k-$48k)', format: formatMoney },
  'latest.cost.net_price.private.by_income_level.48001-75000': { label: 'Net Price (Private, $48k-$75k)', format: formatMoney },
  'latest.cost.net_price.private.by_income_level.75001-110000': { label: 'Net Price (Private, $75k-$110k)', format: formatMoney },
  'latest.cost.net_price.private.by_income_level.110001-plus': { label: 'Net Price (Private, $110k+)', format: formatMoney },
  
  'latest.aid.pell_grant_rate': { label: 'Pell Grant Rate', format: formatPercent },
  'latest.aid.federal_grant_rate': { label: 'Federal Grant Rate', format: formatPercent },
  'latest.aid.students_with_pell_grant': { label: 'Students with Pell Grant', format: formatPercent },
  'latest.aid.any_loan_rate': { label: 'Any Loan Rate', format: formatPercent },
  'latest.aid.federal_loan_rate': { label: 'Federal Loan Rate', format: formatPercent },
  'latest.aid.median_debt.completers.overall': { label: 'Median Debt (Completers)', format: formatMoney },
  'latest.aid.median_debt.noncompleters': { label: 'Median Debt (Non-completers)', format: formatMoney },
  
  'latest.student.retention_rate.four_year.full_time': { label: 'Retention Rate', format: formatPercent },
  'latest.completion.rate_suppressed.overall': { label: 'Completion Rate', format: formatPercent },
  'latest.completion.rate_suppressed.4yr': { label: 'Completion Rate (4yr)', format: formatPercent },
  'latest.completion.rate_suppressed.2yr': { label: 'Completion Rate (2yr)', format: formatPercent },
  'latest.repayment.3_yr_repayment.overall': { label: '3-Year Repayment Rate', format: formatPercent },
  'latest.repayment.3_yr_default_rate': { label: '3-Year Default Rate', format: formatPercent },
  'latest.earnings.10_yrs_after_entry.median': { label: 'Median Earnings (10 yrs)', format: formatMoney },
  'latest.school.instructional_expenditure_per_fte': { label: 'Instructional Expenditure per FTE', format: formatMoney },
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

  // Advanced Customization State
  const [loanInterestRate, setLoanInterestRate] = useState(5.5)
  const [loanTerm, setLoanTerm] = useState(10)
  const [personalSavings, setPersonalSavings] = useState(0)
  const [scholarships, setScholarships] = useState(0)
  const [customizationOpen, setCustomizationOpen] = useState(false)

  const { user_AGI, scanned_tax_data } = useUserStore()

  const SCORECARD_CATEGORIES = {
    school: {
      label: 'School basics',
      keys: [
        'school.name',
        'school.school_url',
        'school.city',
        'school.state',
        'school.ownership',
        'school.degrees_awarded.predominant',
        'school.carnegie_basic',
      ],
    },
    costs: {
      label: 'Sticker + living costs',
      keys: [
        'latest.cost.tuition.in_state',
        'latest.cost.tuition.out_of_state',
        'latest.cost.booksupply',
        'latest.cost.roomboard.oncampus',
        'latest.cost.roomboard.offcampus',
        'latest.cost.otherexpense.oncampus',
        'latest.cost.otherexpense.offcampus',
        'latest.cost.otherexpense.withfamily',
      ],
    },
    netPrice: {
      label: 'Net price',
      keys: [
        'latest.cost.avg_net_price.overall',
        'latest.cost.net_price.public.by_income_level.0-30000',
        'latest.cost.net_price.public.by_income_level.30001-48000',
        'latest.cost.net_price.public.by_income_level.48001-75000',
        'latest.cost.net_price.public.by_income_level.75001-110000',
        'latest.cost.net_price.public.by_income_level.110001-plus',
        'latest.cost.net_price.private.by_income_level.0-30000',
        'latest.cost.net_price.private.by_income_level.30001-48000',
        'latest.cost.net_price.private.by_income_level.48001-75000',
        'latest.cost.net_price.private.by_income_level.75001-110000',
        'latest.cost.net_price.private.by_income_level.110001-plus',
      ],
    },
    aid: {
      label: 'Aid + debt',
      keys: [
        'latest.aid.pell_grant_rate',
        'latest.aid.federal_grant_rate',
        'latest.aid.students_with_pell_grant',
        'latest.aid.any_loan_rate',
        'latest.aid.federal_loan_rate',
        'latest.aid.median_debt.completers.overall',
        'latest.aid.median_debt.noncompleters',
      ],
    },
    outcomes: {
      label: 'Outcomes + repayment',
      keys: [
        'latest.student.retention_rate.four_year.full_time',
        'latest.completion.rate_suppressed.overall',
        'latest.completion.rate_suppressed.4yr',
        'latest.completion.rate_suppressed.2yr',
        'latest.repayment.3_yr_repayment.overall',
        'latest.repayment.3_yr_default_rate',
        'latest.earnings.10_yrs_after_entry.median',
        'latest.school.instructional_expenditure_per_fte',
      ],
    },
  } as const

  const [scorecardVisible, setScorecardVisible] = useState(() => ({
    school: true,
    costs: true,
    netPrice: false,
    aid: false,
    outcomes: false,
  }))

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
      otherCost = data.costs.otherExpense.withFamily || 0
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
            const fullHousing = livingStatus === 'with_family' ? 0 : housing === 'on_campus' ? data.costs.roomBoard.onCampus : data.costs.roomBoard.offCampus
            const fullOther =
              livingStatus === 'with_family'
                ? data.costs.otherExpense.withFamily
                : housing === 'on_campus'
                  ? data.costs.otherExpense.onCampus
                  : data.costs.otherExpense.offCampus
            
            const fullCOA = (fullTuition || 0) + (fullBooks || 0) + (fullHousing || 0) + (fullOther || 0)
            
            // Aid is what reduces the full price to the net price
            const aid = Math.max(0, fullCOA - apiNetPrice)
            predictedAid = aid
            
            // Dynamic Net Price = Visible Total - Aid
            netPrice = Math.max(0, total - aid)
        }
    }

    // Apply Personal Contributions
    const finalCost = Math.max(0, netPrice - personalSavings - scholarships)

    return {
        tuition,
        books,
        housing: housingCost,
        other: otherCost,
        total,
        netPrice,
        predictedAid,
        finalCost
    }
  }, [data, residency, housing, livingStatus, user_AGI, visibleColumns, personalSavings, scholarships])

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
        ['Predicted Aid', formatMoney(calculatedCosts.predictedAid)],
        ['Personal Savings', formatMoney(personalSavings)],
        ['Scholarships', formatMoney(scholarships)],
        ['Final Cost', formatMoney(calculatedCosts.finalCost)]
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
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                <label htmlFor="residency" className="text-xs font-semibold text-slate-500 uppercase">Residency</label>
                    <select 
                id="residency"
                        value={residency} 
                        onChange={(e) => setResidency(e.target.value as any)}
                        className="rounded-lg border-slate-200 text-sm p-2"
                    >
                        <option value="in_state">In-State</option>
                        <option value="out_of_state">Out-of-State</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                <label htmlFor="housing" className="text-xs font-semibold text-slate-500 uppercase">Housing</label>
                    <select 
                id="housing"
                        value={housing} 
                        onChange={(e) => setHousing(e.target.value as any)}
                        className="rounded-lg border-slate-200 text-sm p-2"
                    >
                        <option value="on_campus">On-Campus</option>
                        <option value="off_campus">Off-Campus</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                <label htmlFor="livingStatus" className="text-xs font-semibold text-slate-500 uppercase">Living Status</label>
                    <select 
                id="livingStatus"
                        value={livingStatus} 
                        onChange={(e) => setLivingStatus(e.target.value as any)}
                        className="rounded-lg border-slate-200 text-sm p-2"
                    >
                        <option value="not_with_family">Not With Family</option>
                        <option value="with_family">With Family</option>
                    </select>
                </div>
            </div>
            <button 
                onClick={() => setCustomizationOpen(!customizationOpen)}
                className="text-sm font-semibold text-crimson-600 hover:text-crimson-700 flex items-center gap-1"
            >
                {customizationOpen ? 'Hide Advanced' : 'Advanced Customization'}
                {customizationOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
        </section>

        {customizationOpen && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Loan Interest Rate (%)</label>
                    <input 
                        type="number" 
                        value={loanInterestRate} 
                        onChange={(e) => setLoanInterestRate(Number(e.target.value))}
                        className="w-full rounded-lg border-slate-200 text-sm p-2"
                        step="0.1"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Loan Term (Years)</label>
                    <input 
                        type="number" 
                        value={loanTerm} 
                        onChange={(e) => setLoanTerm(Number(e.target.value))}
                        className="w-full rounded-lg border-slate-200 text-sm p-2"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Personal Savings ($)</label>
                    <input 
                        type="number" 
                        value={personalSavings} 
                        onChange={(e) => setPersonalSavings(Number(e.target.value))}
                        className="w-full rounded-lg border-slate-200 text-sm p-2"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Scholarships ($)</label>
                    <input 
                        type="number" 
                        value={scholarships} 
                        onChange={(e) => setScholarships(Number(e.target.value))}
                        className="w-full rounded-lg border-slate-200 text-sm p-2"
                    />
                </div>
            </section>
        )}

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
                      No schools found matching “{schoolName}”.
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

            {/* Value & ROI Analysis */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Instructional Value */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Instructional Value</h3>
                            <p className="text-sm text-slate-600 mt-1">
                                How much the school spends on <strong>teaching you</strong> per year (faculty, academic support), excluding sports/dorms.
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900">
                                {formatMoney(data.financial.instructionalExpenditurePerFte)}
                            </p>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Per Student/Year</p>
                        </div>
                    </div>
                </div>

                {/* Debt Payoff Calculator */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900">Debt Payoff Estimator</h3>
                    <p className="text-sm text-slate-600 mt-1 mb-4">
                        Estimated monthly payment for the median graduate debt (10-year plan).
                    </p>
                    
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Median Debt</p>
                            <p className="text-xl font-semibold text-slate-900">
                                {formatMoney(data.financial.medianDebtCompletersOverall)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Est. Monthly Payment</p>
                            <p className="text-3xl font-bold text-crimson-600">
                                {formatMoney(calculateMonthlyPayment(
                                    data.financial.medianDebtCompletersOverall || 0, 
                                    data.financial.federalLoanRate || (loanInterestRate / 100),
                                    loanTerm
                                ))}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                @ {loanInterestRate}% interest, {loanTerm} years
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Price by Income Visual */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Net Price by Family Income</h3>
                <p className="text-sm text-slate-600 mb-6">Average annual cost after financial aid for different income brackets.</p>
                
                <div className="space-y-4">
                    {[
                        { label: '$0 - $30k', key: '0-30000' },
                        { label: '$30k - $48k', key: '30001-48000' },
                        { label: '$48k - $75k', key: '48001-75000' },
                        { label: '$75k - $110k', key: '75001-110000' },
                        { label: '$110k+', key: '110001-plus' },
                    ].map((bracket) => {
                        const price = data.costs.netPrice.public?.[bracket.key] || data.costs.netPrice.private?.[bracket.key]
                        if (!price) return null
                        
                        // Calculate width percentage (max approx 70k for private)
                        const width = Math.min(100, Math.max(5, (price / 70000) * 100))
                        const isUserBracket = user_AGI !== null && (
                            (bracket.key === '0-30000' && user_AGI <= 30000) ||
                            (bracket.key === '30001-48000' && user_AGI > 30000 && user_AGI <= 48000) ||
                            (bracket.key === '48001-75000' && user_AGI > 48000 && user_AGI <= 75000) ||
                            (bracket.key === '75001-110000' && user_AGI > 75000 && user_AGI <= 110000) ||
                            (bracket.key === '110001-plus' && user_AGI > 110000)
                        )

                        return (
                            <div key={bracket.key} className="relative">
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className={isUserBracket ? 'text-blue-700 font-bold' : 'text-slate-600'}>
                                        {bracket.label} {isUserBracket && '(You)'}
                                    </span>
                                    <span className="text-slate-900">{formatMoney(price)}</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${isUserBracket ? 'bg-blue-600' : 'bg-slate-400'}`} 
                                        style={{ width: `${width}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

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
                        <td className="px-6 py-4 font-medium text-slate-900">Room & Board ({housing.replace('_', ' ')})</td>
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
                        <td className="px-6 py-4 font-medium text-slate-900">Other Expenses (transportation + personal + misc)</td>
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
                    {(personalSavings > 0 || scholarships > 0) && (
                        <>
                            {personalSavings > 0 && (
                                <tr className="text-green-700">
                                    <td className="px-6 py-4 font-medium">Personal Savings (Credit)</td>
                                    <td className="px-6 py-4 text-right">- {formatMoney(personalSavings)}</td>
                                </tr>
                            )}
                            {scholarships > 0 && (
                                <tr className="text-green-700">
                                    <td className="px-6 py-4 font-medium">Scholarships (Credit)</td>
                                    <td className="px-6 py-4 text-right">- {formatMoney(scholarships)}</td>
                                </tr>
                            )}
                            <tr className="bg-green-50 border-t-2 border-green-100">
                                <td className="px-6 py-4 font-bold text-green-900">Final Estimated Cost</td>
                                <td className="px-6 py-4 text-right font-bold text-green-900">{formatMoney(calculatedCosts.finalCost)}</td>
                            </tr>
                        </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Majors with ROI Analysis */}
            {data.topMajors && data.topMajors.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-900">Earnings & Debt by Major</h3>
                        <p className="text-sm text-slate-600">
                            See how your specific program pays off. <strong>Debt-to-Income Ratio</strong> under 1.0 is ideal.
                        </p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-white text-slate-600 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Major</th>
                                    <th className="px-6 py-3 text-right">Graduates</th>
                                    <th className="px-6 py-3 text-right">Median Earnings</th>
                                    <th className="px-6 py-3 text-right">Median Debt</th>
                                    <th className="px-6 py-3 text-right">Debt-to-Income</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.topMajors.slice(0, majorsOpen ? undefined : 5).map((m, i) => {
                                    const dti = (m.debt && m.earnings) ? (m.debt / m.earnings).toFixed(2) : 'N/A'
                                    const dtiColor = dti === 'N/A' ? 'text-slate-400' : Number(dti) < 0.6 ? 'text-green-600 font-bold' : Number(dti) > 1.0 ? 'text-red-600' : 'text-yellow-600'
                                    
                                    return (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-slate-900">{m.title}</td>
                                            <td className="px-6 py-3 text-right text-slate-600">{m.count}</td>
                                            <td className="px-6 py-3 text-right text-slate-900 font-medium">{formatMoney(m.earnings)}</td>
                                            <td className="px-6 py-3 text-right text-slate-600">{formatMoney(m.debt)}</td>
                                            <td className={`px-6 py-3 text-right ${dtiColor}`}>{dti}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {data.topMajors.length > 5 && (
                        <button 
                            onClick={() => setMajorsOpen(!majorsOpen)}
                            className="w-full px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-t border-slate-100"
                        >
                            {majorsOpen ? 'Show Less' : `Show ${data.topMajors.length - 5} More Majors`}
                        </button>
                    )}
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

          </section>
        )}
      </div>
    </div>
  )
}
