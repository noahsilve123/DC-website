'use client'

import { BackgroundGradient } from '../components/ui/BackgroundGradient'
import { FadeIn } from '../components/ui/FadeIn'

export default function OrganizePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundGradient />
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-4">
        <FadeIn>
          <h1 className="text-4xl font-heading font-bold text-navy-900">Organize</h1>
          <p className="text-navy-600">Coming soon.</p>
        </FadeIn>
      </div>
    </div>
  )
}
