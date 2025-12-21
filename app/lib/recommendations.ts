export type RecommendationProfile = {
  grade?: number
  interests?: string[]
  firstGen?: boolean
  incomeBracket?: 'below-60k' | '60k-90k' | '90k-140k' | 'above-140k'
  needsMentor?: boolean
}

export type Recommendation = {
  id: string
  title: string
  description: string
  type: 'resource' | 'program' | 'scholarship'
  link: string
  reason: string
  score: number
}

const catalog: Recommendation[] = [
  {
    id: 'fafsa-helper',
    title: 'FAFSA File Prep Tool',
    description: 'Upload tax docs, map values to FAFSA questions, and keep answers organized.',
    type: 'resource',
    link: '/resources',
    reason: 'Great for any family starting financial aid forms.',
    score: 30,
  },
  {
    id: 'mentor-match',
    title: '1:1 Mentor Intake',
    description: 'Pair with a counselor for essay support, timelines, and accountability.',
    type: 'program',
    link: '/programs#mentorship',
    reason: 'Students benefit from weekly check-ins and milestone planning.',
    score: 35,
  },
  {
    id: 'sat-lab',
    title: 'SAT Lab Cohort',
    description: 'Group prep sessions and feedback to push scores higher.',
    type: 'program',
    link: '/programs#sat-prep',
    reason: 'Helps boost scores before scholarship deadlines.',
    score: 28,
  },
  {
    id: 'scholarship-planner',
    title: 'Scholarship Planner',
    description: 'Personalized list with checklists and export to share with advisors.',
    type: 'scholarship',
    link: '/resources/scholarships',
    reason: 'Focus on aid for first-gen and need-based students.',
    score: 40,
  },
]

export function buildRecommendations(profile: RecommendationProfile): Recommendation[] {
  const interests = new Set((profile.interests ?? []).map((item) => item.toLowerCase()))
  return catalog
    .map((item) => ({ ...item, score: scoreItem(item, profile, interests), reason: item.reason }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
}

function scoreItem(item: Recommendation, profile: RecommendationProfile, interests: Set<string>): number {
  let score = item.score
  if (profile.firstGen && item.id === 'scholarship-planner') score += 10
  if (profile.needsMentor && item.id === 'mentor-match') score += 12
  if (profile.grade && profile.grade >= 11 && item.id === 'sat-lab') score += 8
  if (interests.has('stem') && item.id === 'scholarship-planner') score += 4
  return score
}
