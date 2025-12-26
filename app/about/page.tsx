'use client'

import { BackgroundGradient } from '../components/ui/BackgroundGradient'
import { FadeIn } from '../components/ui/FadeIn'
import { GlassCard } from '../components/ui/GlassCard'
import { Heart, Users, Lightbulb, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundGradient />

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-24">
        
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto">
          <FadeIn>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
              More than just a checklist.
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Destination College is a grass-roots non-profit run by two grandmas who believe in the power of education—and in what happens when a student has someone in their corner.
            </p>
          </FadeIn>
        </header>

        {/* Mission Grid */}
        <section>
          <div className="grid md:grid-cols-3 gap-6">
            <FadeIn delay={0.2} className="h-full">
              <GlassCard className="h-full bg-rose-50/50 border-rose-100">
                <div className="p-3 bg-rose-100 w-fit rounded-xl mb-4 text-rose-600">
                  <Heart className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Our Mission</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Help first-generation students navigate the college process with clarity, encouragement, and practical tools.
                </p>
              </GlassCard>
            </FadeIn>

            <FadeIn delay={0.3} className="h-full">
              <GlassCard className="h-full bg-blue-50/50 border-blue-100">
                <div className="p-3 bg-blue-100 w-fit rounded-xl mb-4 text-blue-600">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Our Approach</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Break big tasks into small steps, explain what the forms are really asking, and keep students moving forward.
                </p>
              </GlassCard>
            </FadeIn>

            <FadeIn delay={0.4} className="h-full">
              <GlassCard className="h-full bg-emerald-50/50 border-emerald-100">
                <div className="p-3 bg-emerald-100 w-fit rounded-xl mb-4 text-emerald-600">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Our Values</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Respect, privacy, and trust. Students deserve support that protects their information and honors their goals.
                </p>
              </GlassCard>
            </FadeIn>
          </div>
        </section>

        {/* Story Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <FadeIn delay={0.2} direction="right">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">A network that feels like family</h2>
              <p className="text-slate-600 leading-relaxed">
                The college process can be overwhelming: forms, deadlines, unfamiliar terms, and a hundred decisions that feel like they all matter at once.
              </p>
              <p className="text-slate-600 leading-relaxed">
                When students connect with Destination College, they’re not just getting a checklist. They’re joining a network where people remember your story, celebrate your wins, and help you keep going when the process gets heavy.
              </p>
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 text-slate-900 font-semibold">
                  <span className="h-px w-8 bg-slate-900"></span>
                  We’re here to make it doable.
                </div>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.4} direction="left">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-rose-200 rounded-3xl blur-2xl opacity-30 transform rotate-3"></div>
              <GlassCard className="relative bg-white/60 backdrop-blur-xl border-white/80 p-8">
                <blockquote className="text-lg font-medium text-slate-800 italic mb-6">
                  "We know that a better path forward isn’t only about paperwork. It’s about confidence. It’s about guidance. It’s about having someone say, 'You belong here—and we’ll help you take the next step.'"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-xl">👵</div>
                  <div>
                    <div className="font-bold text-slate-900">The Founders</div>
                    <div className="text-sm text-slate-500">Destination College</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </FadeIn>
        </section>

        {/* Tech Section */}
        <section>
          <FadeIn delay={0.5}>
            <GlassCard className="bg-slate-900 text-white border-slate-800">
              <div className="md:flex items-center justify-between gap-8">
                <div className="space-y-4 mb-6 md:mb-0">
                  <h2 className="text-2xl font-bold">About this website</h2>
                  <p className="text-slate-300 leading-relaxed max-w-2xl">
                    This site includes privacy-first tools that run on your device to help with common parts of the process—like organizing tasks, extracting values from documents, and preparing answers for financial-aid forms.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <a href="/tools" className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-semibold hover:bg-slate-100 transition-colors">
                    Explore Tools <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </GlassCard>
          </FadeIn>
        </section>

      </div>
    </div>
  )
}
