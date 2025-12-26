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
    const greekLife = (data as any).greek_life

    const scorecardKeys = [
      'school.name',
      'school.school_url',
      'school.city',
      'school.state',
      'school.locale',
      'school.ownership',
      'school.degrees_awarded.predominant',
      'school.carnegie_basic',

      'latest.student.size',
      'latest.student.part_time_share',
      'latest.student.grad_students',
      'latest.student.demographics.race_ethnicity',
      'latest.student.demographics.men',
      'latest.student.demographics.women',
      'latest.student.share_firstgeneration',

      'latest.admissions.admission_rate.overall',
      'latest.admissions.sat_scores.average.overall',
      'latest.admissions.act_scores.midpoint.cumulative',
      'latest.admissions.sat_scores.25th_percentile.overall',
      'latest.admissions.sat_scores.75th_percentile.overall',

      'latest.academics.program_percentage.engineering',
      'latest.academics.program_percentage.business_marketing',
      'latest.academics.program_percentage.computer',
      'latest.academics.program_percentage.biological',
      'latest.academics.program_percentage.health',

      'latest.student.retention_rate.four_year.full_time',
      'latest.completion.rate_suppressed.overall',
      'latest.earnings.10_yrs_after_entry.median',
      'latest.repayment.3_yr_repayment.overall',
    ] as const

    const scorecard = Object.fromEntries(scorecardKeys.map((k) => [k, (data as any)?.[k] ?? null]))

    const result = {
        school: {
            name: data['school.name'],
            schoolUrl: data['school.school_url'],
            city: data['school.city'],
            state: data['school.state'],
        },
      scorecard,
      greekLife,
        selection: {
            size: data['latest.student.size'],
            locale: data['school.locale'],
            demographics: data['latest.student.demographics.race_ethnicity'],
            admissionRate: data['latest.admissions.admission_rate.overall'],
        satScores: data['latest.admissions.sat_scores.average.overall'],
        sat25: data['latest.admissions.sat_scores.25th_percentile.overall'] ?? null,
        sat75: data['latest.admissions.sat_scores.75th_percentile.overall'] ?? null,
        actMidpoint: data['latest.admissions.act_scores.midpoint.cumulative'] ?? null,
        ownership: data['school.ownership'] ?? null,
        predominantDegree: data['school.degrees_awarded.predominant'] ?? null,
        carnegieBasic: data['school.carnegie_basic'] ?? null,
        partTimeShare: data['latest.student.part_time_share'] ?? null,
        gradStudents: data['latest.student.grad_students'] ?? null,
        menShare: data['latest.student.demographics.men'] ?? null,
        womenShare: data['latest.student.demographics.women'] ?? null,
        firstGenShare: data['latest.student.share_firstgeneration'] ?? null,
        retentionRate: data['latest.student.retention_rate.four_year.full_time'] ?? null,
        completionRate: data['latest.completion.rate_suppressed.overall'] ?? null,
        earnings10yrMedian: data['latest.earnings.10_yrs_after_entry.median'] ?? null,
        repayment3yr: data['latest.repayment.3_yr_repayment.overall'] ?? null,
        programMix: {
          engineering: data['latest.academics.program_percentage.engineering'] ?? null,
          businessMarketing: data['latest.academics.program_percentage.business_marketing'] ?? null,
          computer: data['latest.academics.program_percentage.computer'] ?? null,
          biological: data['latest.academics.program_percentage.biological'] ?? null,
          health: data['latest.academics.program_percentage.health'] ?? null,
        },
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
