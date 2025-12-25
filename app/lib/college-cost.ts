import 'server-only'

type NullableNumber = number | null | undefined

export type TuitionMode = 'in_state' | 'out_of_state'

export type CollegeCostInput = {
  schoolName: string
  years?: number
  inflationRate?: number
  tuitionMode?: TuitionMode
}

export type CollegeCostSchool = {
  name: string
  schoolUrl: string | null
  city: string | null
  state: string | null
}

export type CollegeCostRaw = {
  school: CollegeCostSchool
  tuition: {
    inState: number | null
    outOfState: number | null
  }
  booksSupply: number | null
  roomBoard: {
    onCampus: number | null
    offCampus: number | null
  }
  otherExpense: {
    onCampus: number | null
    offCampus: number | null
  }
}

export type ProjectedLineItems = {
  tuition: number
  housing: number
  foodOther: number
  books: number
  total: number
}

export type CollegeCostProjection = {
  years: number
  inflationRate: number
  tuitionMode: TuitionMode
  onCampus: ProjectedLineItems
  offCampus: ProjectedLineItems
}

export type ComprehensiveCollegeCosts = {
  raw: CollegeCostRaw
  projection: CollegeCostProjection
}

const toNumberOrNull = (v: NullableNumber): number | null => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null
  return v
}

const safe = (v: NullableNumber): number => {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : 0
  return n < 0 ? 0 : n
}

export function clampYears(years: number): number {
  if (!Number.isFinite(years)) return 4
  return Math.min(6, Math.max(1, Math.floor(years)))
}

export function clampInflationRate(rate: number): number {
  if (!Number.isFinite(rate)) return 0.03
  return Math.min(0.1, Math.max(0, rate))
}

export function projectCostOverYears(baseAnnualCost: number, years: number, inflationRate: number): number {
  const y = clampYears(years)
  const r = clampInflationRate(inflationRate)

  let total = 0
  for (let i = 0; i < y; i++) {
    total += baseAnnualCost * Math.pow(1 + r, i)
  }
  return total
}

export function projectLineItems(
  raw: CollegeCostRaw,
  years: number,
  inflationRate: number,
  tuitionMode: TuitionMode,
): CollegeCostProjection {
  const y = clampYears(years)
  const r = clampInflationRate(inflationRate)

  const tuitionBase = tuitionMode === 'out_of_state' ? safe(raw.tuition.outOfState) : safe(raw.tuition.inState)
  const booksBase = safe(raw.booksSupply)

  const onCampusHousingBase = safe(raw.roomBoard.onCampus)
  const offCampusHousingBase = safe(raw.roomBoard.offCampus)

  const onCampusOtherBase = safe(raw.otherExpense.onCampus)
  const offCampusOtherBase = safe(raw.otherExpense.offCampus)

  const onCampus: ProjectedLineItems = {
    tuition: projectCostOverYears(tuitionBase, y, r),
    housing: projectCostOverYears(onCampusHousingBase, y, r),
    foodOther: projectCostOverYears(onCampusOtherBase, y, r),
    books: projectCostOverYears(booksBase, y, r),
    total: 0,
  }
  onCampus.total = onCampus.tuition + onCampus.housing + onCampus.foodOther + onCampus.books

  const offCampus: ProjectedLineItems = {
    tuition: projectCostOverYears(tuitionBase, y, r),
    housing: projectCostOverYears(offCampusHousingBase, y, r),
    foodOther: projectCostOverYears(offCampusOtherBase, y, r),
    books: projectCostOverYears(booksBase, y, r),
    total: 0,
  }
  offCampus.total = offCampus.tuition + offCampus.housing + offCampus.foodOther + offCampus.books

  return {
    years: y,
    inflationRate: r,
    tuitionMode,
    onCampus,
    offCampus,
  }
}

type ScorecardSchoolRow = {
  school?: {
    name?: string
    school_url?: string
    city?: string
    state?: string
  }
  latest?: {
    cost?: {
      tuition?: {
        in_state?: number
        out_of_state?: number
      }
      booksupply?: number
      roomboard?: {
        oncampus?: number
        offcampus?: number
      }
      otherexpense?: {
        oncampus?: number
        offcampus?: number
      }
    }
  }
}

function getApiKey(): string {
  // SECURITY: Do not expose the key to the client.
  // Set COLLEGE_SCORECARD_API_KEY in your environment (.env.local).
  const key = process.env.COLLEGE_SCORECARD_API_KEY
  // Fallback to DEMO_KEY so the tool can still function during setup.
  // DEMO_KEY is public and rate-limited.
  return key && key.trim() ? key.trim() : 'DEMO_KEY'
}

function pickBestMatch(results: ScorecardSchoolRow[], schoolName: string): ScorecardSchoolRow | null {
  if (!results.length) return null
  const needle = schoolName.trim().toLowerCase()
  if (!needle) return results[0] ?? null

  const exact = results.find((r) => (r.school?.name ?? '').trim().toLowerCase() === needle)
  if (exact) return exact

  const contains = results.find((r) => (r.school?.name ?? '').toLowerCase().includes(needle))
  if (contains) return contains

  return results[0] ?? null
}

export async function fetchComprehensiveCollegeCosts(schoolName: string): Promise<CollegeCostRaw> {
  const q = String(schoolName ?? '').trim()
  if (!q) throw new Error('School name is required.')

  const apiKey = getApiKey()
  const baseUrl = 'https://api.data.gov/ed/collegescorecard/v1/schools'

  const fields = [
    'school.name',
    'school.school_url',
    'school.city',
    'school.state',
    'latest.cost.tuition.in_state',
    'latest.cost.tuition.out_of_state',
    'latest.cost.booksupply',
    'latest.cost.roomboard.oncampus',
    'latest.cost.roomboard.offcampus',
    'latest.cost.otherexpense.oncampus',
    'latest.cost.otherexpense.offcampus',
  ].join(',')

  const url = new URL(baseUrl)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('fields', fields)
  url.searchParams.set('per_page', '10')
  // Use search for more forgiving matching.
  url.searchParams.set('school.search', q)

  const res = await fetch(url.toString(), {
    next: { revalidate: 86400 },
  })

  if (!res.ok) {
    let hint = ''
    if (res.status === 403) {
      hint = ' (403 Forbidden — the API key is invalid/blocked, or not being applied correctly.)'
    }
    throw new Error(`Scorecard API error: ${res.status} ${res.statusText}${hint}`)
  }

  const json = (await res.json()) as { results?: ScorecardSchoolRow[] }
  const results = Array.isArray(json.results) ? json.results : []
  const best = pickBestMatch(results, q)

  if (!best?.school?.name) {
    throw new Error('School not found.')
  }

  return {
    school: {
      name: best.school.name ?? q,
      schoolUrl: best.school.school_url ?? null,
      city: best.school.city ?? null,
      state: best.school.state ?? null,
    },
    tuition: {
      inState: toNumberOrNull(best.latest?.cost?.tuition?.in_state),
      outOfState: toNumberOrNull(best.latest?.cost?.tuition?.out_of_state),
    },
    booksSupply: toNumberOrNull(best.latest?.cost?.booksupply),
    roomBoard: {
      onCampus: toNumberOrNull(best.latest?.cost?.roomboard?.oncampus),
      offCampus: toNumberOrNull(best.latest?.cost?.roomboard?.offcampus),
    },
    otherExpense: {
      onCampus: toNumberOrNull(best.latest?.cost?.otherexpense?.oncampus),
      offCampus: toNumberOrNull(best.latest?.cost?.otherexpense?.offcampus),
    },
  }
}

export async function fetchComprehensiveCollegeCostsById(schoolId: number): Promise<CollegeCostRaw> {
  if (!Number.isFinite(schoolId)) throw new Error('School id is required.')

  const apiKey = getApiKey()
  const baseUrl = 'https://api.data.gov/ed/collegescorecard/v1/schools'

  const fields = [
    'school.name',
    'school.school_url',
    'school.city',
    'school.state',
    'latest.cost.tuition.in_state',
    'latest.cost.tuition.out_of_state',
    'latest.cost.booksupply',
    'latest.cost.roomboard.oncampus',
    'latest.cost.roomboard.offcampus',
    'latest.cost.otherexpense.oncampus',
    'latest.cost.otherexpense.offcampus',
  ].join(',')

  const url = new URL(baseUrl)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('fields', fields)
  url.searchParams.set('per_page', '1')
  url.searchParams.set('id', String(Math.trunc(schoolId)))

  const res = await fetch(url.toString(), {
    next: { revalidate: 86400 },
  })

  if (!res.ok) {
    let hint = ''
    if (res.status === 403) {
      hint = ' (403 Forbidden — the API key is invalid/blocked, or not being applied correctly.)'
    }
    throw new Error(`Scorecard API error: ${res.status} ${res.statusText}${hint}`)
  }

  const json = (await res.json()) as { results?: ScorecardSchoolRow[] }
  const results = Array.isArray(json.results) ? json.results : []
  const row = results[0]

  if (!row?.school?.name) {
    throw new Error('School not found.')
  }

  return {
    school: {
      name: row.school.name ?? String(schoolId),
      schoolUrl: row.school.school_url ?? null,
      city: row.school.city ?? null,
      state: row.school.state ?? null,
    },
    tuition: {
      inState: toNumberOrNull(row.latest?.cost?.tuition?.in_state),
      outOfState: toNumberOrNull(row.latest?.cost?.tuition?.out_of_state),
    },
    booksSupply: toNumberOrNull(row.latest?.cost?.booksupply),
    roomBoard: {
      onCampus: toNumberOrNull(row.latest?.cost?.roomboard?.oncampus),
      offCampus: toNumberOrNull(row.latest?.cost?.roomboard?.offcampus),
    },
    otherExpense: {
      onCampus: toNumberOrNull(row.latest?.cost?.otherexpense?.oncampus),
      offCampus: toNumberOrNull(row.latest?.cost?.otherexpense?.offcampus),
    },
  }
}

export async function fetchProjectedComprehensiveCollegeCosts(input: CollegeCostInput): Promise<ComprehensiveCollegeCosts> {
  const years = clampYears(input.years ?? 4)
  const inflationRate = clampInflationRate(input.inflationRate ?? 0.03)
  const tuitionMode: TuitionMode = input.tuitionMode ?? 'in_state'

  const raw = await fetchComprehensiveCollegeCosts(input.schoolName)
  const projection = projectLineItems(raw, years, inflationRate, tuitionMode)
  return { raw, projection }
}
