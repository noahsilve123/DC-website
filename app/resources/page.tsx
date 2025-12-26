'use client'

import Link from "next/link"
import { BackgroundGradient } from '../components/ui/BackgroundGradient'
import { FadeIn } from '../components/ui/FadeIn'
import { SpotlightCard } from '../components/ui/SpotlightCard'
import { ArrowUpRight } from 'lucide-react'

const resources = [
  {
    title: "FAFSA Completion Help",
    summary:
      "Step-by-step guidance so students and families can claim all eligible aid dollars.",
    href: "https://studentaid.gov/h/apply-for-aid/fafsa",
  },
  {
    title: "Scholarship Tracker",
    summary: "A starting point for scholarships, deadlines, and application tips.",
    href: "https://www.fastweb.com/college-scholarships",
  },
  {
    title: "College-Ready Checklist",
    summary: "A printable checklist that keeps students focused on campus visits, transcripts, and recommendation letters.",
    href: "https://www.nacacnet.org/",
  },
]

export default function ResourcesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundGradient />
      
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <FadeIn>
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.4em] text-gold-600 font-bold">Destination College</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy-900">
              Resources for the first-gen journey
            </h1>
            <p className="text-lg text-navy-600 font-light">
              A curated list of trusted tools, guidance, and programs to help you apply, afford, and stay on track.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2">
          {resources.map((item, index) => (
            <FadeIn key={item.title} delay={0.1 * (index + 1)}>
              <Link href={item.href} target="_blank" rel="noreferrer" className="block h-full">
                <SpotlightCard className="h-full flex flex-col">
                  <h2 className="card-title text-xl font-heading font-bold text-navy-900 mb-3 transition-all duration-300">{item.title}</h2>
                  <p className="card-description text-base text-navy-600 leading-relaxed flex-grow font-light mb-6 transition-all duration-300">
                    {item.summary}
                  </p>
                  <div className="card-cta flex items-center text-xs font-bold uppercase tracking-widest text-gold-600 transition-colors">
                    Open resource <ArrowUpRight className="ml-2 h-3 w-3" />
                  </div>
                </SpotlightCard>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}
