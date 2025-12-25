import { NextResponse } from 'next/server'
import { fetchProjectedComprehensiveCollegeCosts, fetchComprehensiveCollegeCostsById, projectLineItems } from '../../lib/college-cost'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const schoolName = String(url.searchParams.get('schoolName') ?? '').trim()
    const schoolIdRaw = url.searchParams.get('schoolId')
    const yearsRaw = url.searchParams.get('years')
    const inflationRaw = url.searchParams.get('inflationRate')

    const years = yearsRaw ? Number(yearsRaw) : 4
    const inflationRate = inflationRaw ? Number(inflationRaw) / 100 : 0.03

    if (schoolIdRaw) {
      const schoolId = Number(schoolIdRaw)
      const raw = await fetchComprehensiveCollegeCostsById(schoolId)
      const projection = projectLineItems(raw, years, inflationRate, 'in_state')
      return NextResponse.json({ raw, projection })
    }

    const data = await fetchProjectedComprehensiveCollegeCosts({
      schoolName,
      years,
      inflationRate,
      tuitionMode: 'in_state',
    })

    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    const lower = message.toLowerCase()
    const status =
      lower.includes('not found') ? 404 : lower.includes('403') || lower.includes('forbidden') ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
