'use client'

import Link from 'next/link'
import ExtractorHubMini from '../components/ExtractorHubMini'
import { BackgroundGradient } from '../components/ui/BackgroundGradient'
import { FadeIn } from '../components/ui/FadeIn'
import { SpotlightCard } from '../components/ui/SpotlightCard'
import { Sparkles, FileText, Calculator, GraduationCap, Wallet } from 'lucide-react'

const tools = [
  {
    title: 'CSS Profile Tool',
    description: 'Upload documents and copy calculated answers for the CSS Profile.',
    href: '/tools/css-profile',
    icon: <Sparkles className="card-icon h-6 w-6 text-gold-600 transition-colors duration-300" />,
    color: 'bg-gold-50 text-gold-700 border border-gold-200 group-hover:bg-[#292929] group-hover:border-white/10 transition-all duration-300',
    ready: true,
  },
  {
    title: 'FAFSA Tool',
    description: 'Step-by-step FAFSA guide and checklist.',
    href: '/tools/fafsa',
    icon: <FileText className="card-icon h-6 w-6 text-navy-600 transition-colors duration-300" />,
    color: 'bg-navy-50 text-navy-700 border border-navy-200 group-hover:bg-[#292929] group-hover:border-white/10 transition-all duration-300',
    ready: true,
  },
  {
    title: 'Scholarship Tool',
    description: 'Upload award letters and summarize grants/loans.',
    href: '/tools/scholarships',
    icon: <GraduationCap className="card-icon h-6 w-6 text-emerald-600 transition-colors duration-300" />,
    color: 'bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-[#292929] group-hover:border-white/10 transition-all duration-300',
    ready: true,
  },
  {
    title: 'Budget Tool',
    description: 'Estimate costs and compare on-campus vs off-campus totals.',
    href: '/tools/budget',
    icon: <Wallet className="card-icon h-6 w-6 text-rose-600 transition-colors duration-300" />,
    color: 'bg-rose-50 text-rose-700 border border-rose-200 group-hover:bg-[#292929] group-hover:border-white/10 transition-all duration-300',
    ready: true,
  },
  {
    title: 'College Selection',
    description: 'Find your fit based on campus culture, diversity, and academics.',
    href: '/tools/college-selection',
    icon: <Calculator className="card-icon h-6 w-6 text-blue-600 transition-colors duration-300" />,
    color: 'bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-[#292929] group-hover:border-white/10 transition-all duration-300',
    ready: true,
  },
] as const

export default function ToolsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundGradient />
      
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <FadeIn>
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy-900">
              Financial Tools
            </h1>
            <p className="text-lg text-navy-600 font-light">
              Choose a tool to get started with your financial aid journey.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <ExtractorHubMini />
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <FadeIn key={tool.title} delay={0.1 * (index + 3)}>
              <Link href={tool.href} className="block h-full">
                <SpotlightCard className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${tool.color}`}>
                      {tool.icon}
                    </div>
                  </div>
                  <h3 className="card-title text-xl font-heading font-bold text-navy-900 mb-2 transition-all duration-300">{tool.title}</h3>
                  <p className="card-description text-base text-navy-600 leading-relaxed flex-grow font-light transition-all duration-300">
                    {tool.description}
                  </p>
                </SpotlightCard>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}
