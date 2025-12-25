import { NextResponse } from 'next/server'

type ScorecardSchoolRow = {
  id?: number
  school?: {
    name?: string
    city?: string
    state?: string
  }
}

function getApiKey(): string {
  const key = process.env.COLLEGE_SCORECARD_API_KEY
  return key && key.trim() ? key.trim() : 'DEMO_KEY'
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = String(url.searchParams.get('query') ?? '').trim()

    if (q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const apiKey = getApiKey()
    const baseUrl = 'https://api.data.gov/ed/collegescorecard/v1/schools'

    const fields = ['id', 'school.name', 'school.city', 'school.state'].join(',')

    const upstream = new URL(baseUrl)
    upstream.searchParams.set('api_key', apiKey)
    upstream.searchParams.set('fields', fields)
    upstream.searchParams.set('per_page', '8')
    upstream.searchParams.set('school.search', q)

    const res = await fetch(upstream.toString(), { next: { revalidate: 86400 } })

    if (!res.ok) {
      throw new Error(`Scorecard API error: ${res.status} ${res.statusText}`)
    }

    const json = (await res.json()) as { results?: ScorecardSchoolRow[] }
    const rows = Array.isArray(json.results) ? json.results : []

    const results = rows
      .map((r) => ({
        id: r.id ?? null,
        name: r.school?.name ?? null,
        city: r.school?.city ?? null,
        state: r.school?.state ?? null,
      }))
      .filter((r) => !!r.name)

    return NextResponse.json({ results })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    const lower = message.toLowerCase()
    const status = lower.includes('403') || lower.includes('forbidden') ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
