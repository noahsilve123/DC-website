import { NextResponse } from 'next/server'
import { fetchProjectedComprehensiveCollegeCosts, fetchComprehensiveCollegeCostsById, projectLineItems } from '../../lib/college-cost'
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
          count: p.counts.ipeds_awards2
        }))

      // Construct response
      const result = {
        school: {
          name: data['school.name'],
          schoolUrl: data['school.school_url'],
          city: data['school.city'],
          state: data['school.state'],
        },
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
        retentionRate: data['latest.student.retention_rate.four_year.full_time'],
        topMajors
      }

      return NextResponse.json(result)
    }

    // Fallback for name search (if needed, or just return error as we expect ID for details)
    // For now, let's keep the old logic for name search if it's used elsewhere, 
    // but the Budget Tool seems to use ID after suggestion.
    
    const data = await fetchProjectedComprehensiveCollegeCosts({
      schoolName,
      years: 4,
      inflationRate: 0.03,
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
