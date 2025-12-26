const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY || '2LzrYljYWbmnKaKSJHLyqDNI56QcGm4hPdJjUh0R';
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

async function fetchScorecardById(schoolId: number, fields: string[]) {
  const url = `${BASE_URL}?api_key=${API_KEY}&id=${schoolId}&fields=${fields.join(',')}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Failed to fetch college data: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
  }

  const json = await res.json();
  if (!json.results || json.results.length === 0) {
    throw new Error('School not found');
  }

  return json.results[0];
}

async function fetchScorecardMerged(schoolId: number, fieldGroups: string[][]) {
  let merged: any = {}
  for (const group of fieldGroups) {
    try {
      const part = await fetchScorecardById(schoolId, group)
      merged = { ...merged, ...part }
    } catch (e) {
      // Best-effort: if one group fails (often due to a field mismatch), keep other groups working.
      console.warn('Scorecard field group failed:', { schoolId, groupSize: group.length, error: e instanceof Error ? e.message : String(e) })
    }
  }
  return merged
}

export async function fetchCollegeDetails(schoolId: number) {
  const base = [
    'id',
    'school.name',
    'school.school_url',
    'school.city',
    'school.state',
    'school.ownership',
    'school.degrees_awarded.predominant',
    'school.carnegie_basic',
  ]

  const costCore = [
    'latest.cost.tuition.in_state',
    'latest.cost.tuition.out_of_state',
    'latest.cost.booksupply',
    'latest.cost.roomboard.oncampus',
    'latest.cost.roomboard.offcampus',
    'latest.cost.otherexpense.oncampus',
    'latest.cost.otherexpense.offcampus',
    'latest.cost.otherexpense.withfamily',
    'latest.cost.avg_net_price.overall',
  ]

  const netPriceByIncome = [
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
  ]

  const riskValue = [
    'latest.aid.median_debt.completers.overall',
    'latest.aid.median_debt.noncompleters',
    'latest.repayment.3_yr_repayment.overall',
    'latest.aid.federal_loan_rate',
    'latest.school.instructional_expenditure_per_fte',
    'latest.earnings.10_yrs_after_entry.median',
  ]

  const aidMore = [
    // These are common Scorecard metrics; if any key differs upstream, batching prevents total failure.
    'latest.aid.pell_grant_rate',
    'latest.aid.federal_grant_rate',
    'latest.aid.any_loan_rate',
    'latest.aid.students_with_pell_grant',
  ]

  const outcomesMore = [
    'latest.completion.rate_suppressed.overall',
    'latest.completion.rate_suppressed.4yr',
    'latest.completion.rate_suppressed.2yr',
    'latest.repayment.3_yr_default_rate',
  ]

  const programs = ['latest.programs.cip_4_digit']
  const retention = ['latest.student.retention_rate.four_year.full_time']

  return fetchScorecardMerged(schoolId, [base, costCore, netPriceByIncome, riskValue, aidMore, outcomesMore, programs, retention])
}

export async function fetchCollegeSelectionData(schoolId: number) {
    const base = [
      'id',
      'school.name',
      'school.school_url',
      'school.city',
      'school.state',
      'school.locale',
      'school.ownership',
      'school.degrees_awarded.predominant',
      'school.carnegie_basic',
    ]

    const students = [
      'latest.student.size',
      'latest.student.part_time_share',
      'latest.student.grad_students',
      'latest.student.demographics.race_ethnicity',
      'latest.student.demographics.men',
      'latest.student.demographics.women',
      'latest.student.share_firstgeneration',
    ]

    const admissions = [
      'latest.admissions.admission_rate.overall',
      'latest.admissions.sat_scores.average.overall',
      'latest.admissions.act_scores.midpoint.cumulative',
      'latest.admissions.sat_scores.25th_percentile.overall',
      'latest.admissions.sat_scores.75th_percentile.overall',
    ]

    const academics = [
      'latest.academics.program_percentage.engineering',
      'latest.academics.program_percentage.business_marketing',
      'latest.academics.program_percentage.computer',
      'latest.academics.program_percentage.biological',
      'latest.academics.program_percentage.health',
    ]

    const outcomes = [
      'latest.student.retention_rate.four_year.full_time',
      'latest.completion.rate_suppressed.overall',
      'latest.earnings.10_yrs_after_entry.median',
      'latest.repayment.3_yr_repayment.overall',
    ]

    return fetchScorecardMerged(schoolId, [base, students, admissions, academics, outcomes])
  }
