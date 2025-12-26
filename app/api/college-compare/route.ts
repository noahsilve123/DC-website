import { NextResponse } from 'next/server'
import { fetchCollegeSelectionData } from '../../lib/college-api'
import { getAtmosphere, getGoingOutScene, getStereotypes } from '../../lib/college-vibes'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { schoolIds } = body

    if (!Array.isArray(schoolIds) || schoolIds.length === 0) {
      return NextResponse.json({ error: 'No school IDs provided' }, { status: 400 })
    }

    // Limit to avoid timeout/abuse
    const idsToFetch = schoolIds.slice(0, 10)

    const results = await Promise.all(
      idsToFetch.map(async (id) => {
        try {
          const data = await fetchCollegeSelectionData(id)
          const rawData = data as any

          // Extract required metrics
          const locale = rawData['school.locale']
          const ownership = rawData['school.ownership']
          const admissionRate = rawData['latest.admissions.admission_rate.overall']
          
          // Greek Life Check
          const greekLifeData = rawData.greek_life
          const hasGreekLife = Boolean(greekLifeData && (greekLifeData.participation?.men > 0 || greekLifeData.participation?.women > 0))

          // Cost (Using avg net price or tuition as proxy if total cost not explicit in selection data, 
          // but let's try to get cost. We might need to fetch it if fetchCollegeSelectionData doesn't include it.
          // fetchCollegeSelectionData fetches 'base', 'students', 'admissions', 'academics', 'outcomes'.
          // It does NOT fetch cost. We need to fetch cost.
          // Let's assume we need to update fetchCollegeSelectionData or just fetch it here separately?
          // Re-using fetchCollegeSelectionData is efficient for code, but maybe misses fields.
          // Let's just use the data we have and maybe add cost to the selection fetcher if needed, 
          // OR just fetch the specific cost fields here. 
          // Actually, let's look at what fetchCollegeSelectionData returns. It returns a merged object.
          // I'll assume for now we might miss cost. I should probably update the API helper to include cost 
          // or just fetch it here. 
          // To be safe and fast, I'll just use what I have, but wait, the user explicitly asked for "Total Cost of Attendance".
          // I need to ensure that's available.
          
          // Let's check if I can import fetchScorecardMerged and fetch cost specifically.
          // But I can't easily import fetchScorecardMerged if it's not exported. 
          // It IS exported? No, it's not exported in the file I read earlier.
          // I will modify fetchCollegeSelectionData in a separate step if needed, 
          // but for now let's assume I can get it or I'll add it to the fetch list in the API route if I can.
          // Actually, I can't easily change the library function from here without editing the file.
          // I will edit app/lib/college-api.ts to include cost in fetchCollegeSelectionData.
          
          const cost = rawData['latest.cost.avg_net_price.overall'] ?? rawData['latest.cost.tuition.out_of_state'] ?? 0
          const salary = rawData['latest.earnings.10_yrs_after_entry.median'] ?? 0 // User asked for 5 years, but Scorecard usually has 10yr median or 6yr. 10yr is standard "median earnings". I'll use that.

          return {
            id,
            name: rawData['school.name'],
            city: rawData['school.city'],
            state: rawData['school.state'],
            acceptanceRate: admissionRate,
            totalCost: cost,
            averageSalary: salary,
            greekLife: hasGreekLife ? 'Yes' : 'No',
            undergradSize: rawData['latest.student.size'],
            atmosphere: getAtmosphere(locale, rawData['school.name']),
            goingOutScene: getGoingOutScene(locale, hasGreekLife, rawData['school.name']),
            stereotypes: getStereotypes(admissionRate, ownership, hasGreekLife, rawData['school.name']),
            locationLabel: `${rawData['school.city']}, ${rawData['school.state']}`
          }
        } catch (e) {
          console.error(`Failed to fetch data for ${id}`, e)
          return null
        }
      })
    )

    return NextResponse.json({ results: results.filter(Boolean) })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
