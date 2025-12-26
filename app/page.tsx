'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, ShieldCheck, Zap, FileText, Calculator, GraduationCap } from 'lucide-react'
import { BackgroundGradient } from './components/ui/BackgroundGradient'
import { FadeIn } from './components/ui/FadeIn'
import { SpotlightCard } from './components/ui/SpotlightCard'
import { TextGenerateEffect } from './components/ui/TextGenerateEffect'

export default function Home() {
  const tools = [
    {
      title: 'CSS Profile Assistant',
      description: 'Upload your tax documents and get a clear checklist of answers for the CSS Profile.',
      href: '/tools/css-profile',
      icon: <Sparkles className="h-6 w-6 text-gold-600" />,
      color: 'bg-gold-50 text-gold-700 border border-gold-200',
      status: 'Popular'
    },
    {
      title: 'Financial Aid Scanner',
      description: 'Scan award letters to compare costs side-by-side.',
      href: '/tools',
      icon: <FileText className="h-6 w-6 text-navy-600" />,
      color: 'bg-navy-50 text-navy-700 border border-navy-200',
      status: 'Beta'
    },
    {
      title: 'College Cost Calculator',
      description: 'Estimate the real cost of attendance for your top choices.',
      href: '/tools',
      icon: <Calculator className="h-6 w-6 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      status: 'Coming Soon'
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden text-navy-900 selection:bg-gold-200">
      <BackgroundGradient />

      {/* Hero Section */}
      <section className="relative pt-12 pb-12 lg:pt-20 lg:pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-stone-200 px-4 py-1.5 text-xs font-bold text-navy-600 shadow-sm mb-6">
              <ShieldCheck className="h-3 w-3 text-gold-600" />
              <span className="tracking-wide uppercase">Privacy-first • On-device processing</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <h1 className="text-5xl md:text-8xl font-heading font-bold tracking-tight text-navy-900 mb-6 leading-tight">
              Financial aid, <br className="hidden md:block" />
              <span className="text-gold-shimmer">
                without the chaos.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="text-lg md:text-xl text-navy-600 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
              <TextGenerateEffect words="Navigate the CSS Profile and financial aid forms with confidence. We extract the data you need from your documents—securely, right in your browser." />
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/tools/css-profile"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-navy-900 px-8 font-medium text-white transition-all duration-300 hover:bg-navy-800 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-navy-400 focus:ring-offset-2"
              >
                <span className="mr-2 font-bold tracking-wide">START CSS PROFILE TOOL</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 font-medium text-navy-900 transition-all duration-300 hover:bg-stone-50 hover:scale-105 border border-stone-200 shadow-sm tracking-wide"
              >
                HOW IT WORKS
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <FadeIn delay={0.5}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool, index) => (
                <Link key={tool.title} href={tool.href} className="block h-full">
                  <SpotlightCard className="h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${tool.color}`}>
                        {tool.icon}
                      </div>
                      {tool.status && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-navy-600 border border-stone-200">
                          {tool.status}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">{tool.title}</h3>
                    <p className="text-sm text-navy-600 leading-relaxed flex-grow font-light">
                      {tool.description}
                    </p>
                    <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-widest text-gold-600 group-hover:text-gold-500 transition-colors">
                      Try it now <ArrowRight className="ml-2 h-3 w-3" />
                    </div>
                  </SpotlightCard>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Value Props */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <FadeIn delay={0.6}>
            <SpotlightCard className="p-8 md:p-12 bg-gradient-to-br from-navy-50 to-white" spotlightColor="rgba(180, 83, 9, 0.05)">
              <div className="grid md:grid-cols-3 gap-12">
                <div className="text-center md:text-left">
                  <div className="mb-4 inline-flex p-3 rounded-2xl bg-white text-navy-900 border border-stone-200 shadow-sm">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">100% Private</h3>
                  <p className="text-navy-600 font-light">
                    Your documents never leave your device. All processing happens locally in your browser.
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <div className="mb-4 inline-flex p-3 rounded-2xl bg-white text-navy-900 border border-stone-200 shadow-sm">
                    <Zap className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">Instant Results</h3>
                  <p className="text-navy-600 font-light">
                    No waiting for manual reviews. Get immediate answers extracted from your tax forms.
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <div className="mb-4 inline-flex p-3 rounded-2xl bg-white text-navy-900 border border-stone-200 shadow-sm">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">Expert Guidance</h3>
                  <p className="text-navy-600 font-light">
                    Built by experts who know the college process inside and out.
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
