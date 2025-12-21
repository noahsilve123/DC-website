import { NextResponse } from 'next/server'
import type { RecommendationProfile } from '../../lib/recommendations'
import { buildRecommendations } from '../../lib/recommendations'

const defaultProfile: RecommendationProfile = {
  firstGen: true,
  needsMentor: true,
  interests: ['stem'],
}

function normalizeProfile(payload: unknown): RecommendationProfile {
  if (!payload || typeof payload !== 'object') return defaultProfile
  const body = payload as Record<string, unknown>
  const interests = Array.isArray(body.interests) ? body.interests.filter((item) => typeof item === 'string').map((item) => item.toLowerCase()) : []
  return {
    grade: typeof body.grade === 'number' ? body.grade : undefined,
    firstGen: body.firstGen === true,
    needsMentor: body.needsMentor === true,
    interests,
    incomeBracket: typeof body.incomeBracket === 'string' ? (body.incomeBracket as RecommendationProfile['incomeBracket']) : undefined,
  }
}

export async function GET() {
  return NextResponse.json(buildRecommendations(defaultProfile))
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}))
    const profile = normalizeProfile(payload)
    const results = buildRecommendations(profile)
    return NextResponse.json(results)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to build recommendations'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}