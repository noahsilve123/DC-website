
import socialVibes from './social-vibes.json'

// Helper to fuzzy match or find school in our manual database
function getManualVibe(schoolName: string | undefined) {
  if (!schoolName) return null
  // Direct match
  if ((socialVibes as any)[schoolName]) return (socialVibes as any)[schoolName]
  
  // Simple fuzzy match (e.g. "Rutgers University" matches "Rutgers University-New Brunswick")
  const key = Object.keys(socialVibes).find(k => k.includes(schoolName) || schoolName.includes(k))
  if (key) return (socialVibes as any)[key]
  
  return null
}

export function getAtmosphere(locale: number | null, schoolName?: string): string {
  const manual = getManualVibe(schoolName)
  if (manual && manual.atmosphere) return manual.atmosphere

  if (!locale) return 'Unknown'
  // 11-13: City
  if (locale >= 11 && locale <= 13) return 'Urban / City'
  // 21-23: Suburb
  if (locale >= 21 && locale <= 23) return 'Suburban'
  // 31-33: Town
  if (locale >= 31 && locale <= 33) return 'College Town'
  // 41-43: Rural
  if (locale >= 41 && locale <= 43) return 'Rural / Secluded'
  return 'Unknown'
}

export function getGoingOutScene(locale: number | null, hasGreekLife: boolean, schoolName?: string): string {
  const manual = getManualVibe(schoolName)
  if (manual && manual.party_scene) return manual.party_scene

  if (!locale) return 'Unknown'
  
  const base = []
  
  if (locale >= 11 && locale <= 13) {
    base.push('City Clubs', 'Bars', 'Concerts')
  } else if (locale >= 31 && locale <= 33) {
    base.push('Campus Bars', 'House Parties')
  } else {
    base.push('House Parties', 'Local Spots')
  }

  if (hasGreekLife) {
    base.unshift('Frat Parties')
  }

  return base.join(', ')
}

export function getStereotypes(
  admissionRate: number | null,
  ownership: number | null, // 1=Public, 2=Private NP, 3=Private FP
  hasGreekLife: boolean,
  schoolName?: string
): string[] {
  const manual = getManualVibe(schoolName)
  if (manual && manual.stereotypes) return manual.stereotypes

  const traits = []

  if (admissionRate !== null) {
    if (admissionRate < 0.15) traits.push('Highly Competitive', 'Intellectual')
    else if (admissionRate < 0.40) traits.push('Ambitious')
    else if (admissionRate > 0.80) traits.push('Accessible', 'Diverse')
  }

  if (ownership === 1) {
    traits.push('School Spirit')
    if (hasGreekLife) traits.push('Socially Active')
  } else if (ownership === 2) {
    traits.push('Close-knit Community')
  }

  if (hasGreekLife && (!admissionRate || admissionRate > 0.3)) {
    traits.push('Work Hard, Play Hard')
  }

  // Fallback
  if (traits.length === 0) traits.push('Academic Focused')

  return traits.slice(0, 3) // Limit to 3
}
