import { NextResponse } from 'next/server'
import { fetchCollegeSelectionData } from '../../lib/college-api'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const schoolIdRaw = url.searchParams.get('schoolId')
    
    if (!schoolIdRaw) {
        return NextResponse.json({ error: 'School ID is required' }, { status: 400 })
    }

    const schoolId = Number(schoolIdRaw)
    const data = await fetchCollegeSelectionData(schoolId)

    const result = {
        school: {
            name: data['school.name'],
            schoolUrl: data['school.school_url'],
            city: data['school.city'],
            state: data['school.state'],
        },
        selection: {
            size: data['latest.student.size'],
            locale: data['school.locale'],
            demographics: data['latest.student.demographics.race_ethnicity'],
            admissionRate: data['latest.admissions.admission_rate.overall'],
            satScores: data['latest.admissions.sat_scores.average.overall']
        }
    }

    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    const lower = message.toLowerCase()
    const status =
      lower.includes('not found') ? 404 : lower.includes('403') || lower.includes('forbidden') ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
