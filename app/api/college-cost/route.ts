import { NextResponse } from 'next/server'
import { fetchComprehensiveCollegeCosts } from '../../lib/college-cost'
import { fetchCollegeDetails } from '../../lib/college-api'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const schoolName = String(url.searchParams.get('schoolName') ?? '').trim()
    const schoolIdRaw = url.searchParams.get('schoolId')
    
    if (schoolIdRaw) {
      const schoolId = Number(schoolIdRaw)
      
      // Fetch from live API
      const data = await fetchCollegeDetails(schoolId)
      
      // Process Top 25 Majors
      const programs = data['latest.programs.cip_4_digit'] || []
      const topMajors = programs
        .filter((p: any) => p.counts && p.counts.ipeds_awards2)
        .sort((a: any, b: any) => (b.counts.ipeds_awards2 || 0) - (a.counts.ipeds_awards2 || 0))
        .slice(0, 25)
        .map((p: any) => ({
          title: p.title,
          count: p.counts.ipeds_awards2,
          earnings: p.earnings?.['4_yr']?.overall_median_earnings || p.earnings?.['1_yr']?.overall_median_earnings || null,
          debt: p.debt?.staff_grad_plus?.all?.eval_inst?.median || p.debt?.parent_plus?.all?.eval_inst?.median || null // Best effort for debt
        }))

      // Construct response
      const scorecardKeys = [
        'school.name',
        'school.school_url',
        'school.city',
        'school.state',
        'school.ownership',
        'school.degrees_awarded.predominant',
        'school.carnegie_basic',

        'latest.cost.tuition.in_state',
        'latest.cost.tuition.out_of_state',
        'latest.cost.booksupply',
        'latest.cost.roomboard.oncampus',
        'latest.cost.roomboard.offcampus',
        'latest.cost.otherexpense.oncampus',
        'latest.cost.otherexpense.offcampus',
        'latest.cost.otherexpense.withfamily',
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

        'latest.aid.median_debt.completers.overall',
        'latest.aid.median_debt.noncompleters',
        'latest.aid.federal_loan_rate',
        'latest.aid.pell_grant_rate',
        'latest.aid.federal_grant_rate',
        'latest.aid.any_loan_rate',
        'latest.aid.students_with_pell_grant',

        'latest.repayment.3_yr_repayment.overall',
        'latest.repayment.3_yr_default_rate',

        'latest.school.instructional_expenditure_per_fte',
        'latest.earnings.10_yrs_after_entry.median',

        'latest.student.retention_rate.four_year.full_time',
        'latest.completion.rate_suppressed.overall',
        'latest.completion.rate_suppressed.4yr',
        'latest.completion.rate_suppressed.2yr',
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
        costs: {
          tuition: {
            inState: data['latest.cost.tuition.in_state'],
            outOfState: data['latest.cost.tuition.out_of_state'],
          },
          booksSupply: data['latest.cost.booksupply'],
          roomBoard: {
            onCampus: data['latest.cost.roomboard.oncampus'],
            offCampus: data['latest.cost.roomboard.offcampus'],
          },
          otherExpense: {
            onCampus: data['latest.cost.otherexpense.oncampus'],
            offCampus: data['latest.cost.otherexpense.offcampus'],
            withFamily: data['latest.cost.otherexpense.withfamily'],
          },
          netPrice: {
            average: data['latest.cost.avg_net_price.overall'],
            public: {
              '0-30000': data['latest.cost.net_price.public.by_income_level.0-30000'],
              '30001-48000': data['latest.cost.net_price.public.by_income_level.30001-48000'],
              '48001-75000': data['latest.cost.net_price.public.by_income_level.48001-75000'],
              '75001-110000': data['latest.cost.net_price.public.by_income_level.75001-110000'],
              '110001-plus': data['latest.cost.net_price.public.by_income_level.110001-plus'],
            },
            private: {
              '0-30000': data['latest.cost.net_price.private.by_income_level.0-30000'],
              '30001-48000': data['latest.cost.net_price.private.by_income_level.30001-48000'],
              '48001-75000': data['latest.cost.net_price.private.by_income_level.48001-75000'],
              '75001-110000': data['latest.cost.net_price.private.by_income_level.75001-110000'],
              '110001-plus': data['latest.cost.net_price.private.by_income_level.110001-plus'],
            }
          }
        },
        financial: {
          medianDebtCompletersOverall: data['latest.aid.median_debt.completers.overall'],
          medianDebtNoncompleters: data['latest.aid.median_debt.noncompleters'],
          threeYearRepaymentOverall: data['latest.repayment.3_yr_repayment.overall'],
          federalLoanRate: data['latest.aid.federal_loan_rate'],
          instructionalExpenditurePerFte: data['latest.school.instructional_expenditure_per_fte'],
          earningsMedian10YrsAfterEntry: data['latest.earnings.10_yrs_after_entry.median'],
        },
        retentionRate: data['latest.student.retention_rate.four_year.full_time'],
        topMajors
      }

      return NextResponse.json(result)
    }

    // Fallback for name search (if needed, or just return error as we expect ID for details)
    // For now, let's keep the old logic for name search if it's used elsewhere, 
    // but the Budget Tool seems to use ID after suggestion.
    
    if (!schoolName) {
      return NextResponse.json({ error: 'schoolName or schoolId is required' }, { status: 400 })
    }

    // Local fallback (limited fields). Keeps response shape consistent.
    const raw = await fetchComprehensiveCollegeCosts(schoolName)

    const scorecard: Record<string, number | string | null> = {
      'school.name': raw.school.name,
      'school.school_url': raw.school.schoolUrl,
      'school.city': raw.school.city,
      'school.state': raw.school.state,
      'latest.cost.tuition.in_state': raw.tuition.inState,
      'latest.cost.tuition.out_of_state': raw.tuition.outOfState,
      'latest.cost.booksupply': raw.booksSupply,
      'latest.cost.roomboard.oncampus': raw.roomBoard.onCampus,
      'latest.cost.roomboard.offcampus': raw.roomBoard.offCampus,
      'latest.cost.otherexpense.oncampus': raw.otherExpense.onCampus,
      'latest.cost.otherexpense.offcampus': raw.otherExpense.offCampus,
      'latest.cost.otherexpense.withfamily': raw.otherExpense.offCampus,
    }

    const result = {
      school: raw.school,
      scorecard,
      costs: {
        tuition: raw.tuition,
        booksSupply: raw.booksSupply,
        roomBoard: raw.roomBoard,
        otherExpense: {
          ...raw.otherExpense,
          withFamily: raw.otherExpense.offCampus,
        },
        netPrice: {
          average: null,
          public: {
            '0-30000': null,
            '30001-48000': null,
            '48001-75000': null,
            '75001-110000': null,
            '110001-plus': null,
          },
          private: {
            '0-30000': null,
            '30001-48000': null,
            '48001-75000': null,
            '75001-110000': null,
            '110001-plus': null,
          },
        },
      },
      financial: {
        medianDebtCompletersOverall: null,
        medianDebtNoncompleters: null,
        threeYearRepaymentOverall: null,
        federalLoanRate: null,
        instructionalExpenditurePerFte: null,
        earningsMedian10YrsAfterEntry: null,
      },
      retentionRate: null,
      topMajors: [],
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
