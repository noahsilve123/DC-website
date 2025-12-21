"use client"

import Link from 'next/link'

const quickLinks = [
  { label: 'Programs', href: '/programs' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
  { label: 'Donate', href: '/donate' },
]

const supportLinks = [
  { label: 'Refer a student', href: '/programs#mentorship' },
  { label: 'Volunteer', href: '/about#involved' },
  { label: 'Corporate giving', href: '/donate' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white" aria-labelledby="site-footer">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(2,1fr)]">
          <div>
            <p id="site-footer" className="text-xl font-semibold site-title text-white">Destination College</p>
            <p className="mt-3 text-sm text-white/70 max-w-md">
              Mentorship, academic coaching, and financial-aid guidance for first-generation Summit High School students and their families.
            </p>
            <div className="mt-5 space-y-1 text-sm text-white/80">
              <p>hello@destinationcollege.org</p>
              <p>(973) 555-0110</p>
              <p>28 Morris Ave, Summit, NJ 07901</p>
            </div>
          </div>

          <nav aria-label="Quick links" className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Explore</p>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/80 hover:text-white transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Support links" className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Support</p>
            <ul className="space-y-2 text-sm">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/80 hover:text-white transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Destination College. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#top" className="hover:text-white transition">
              Back to top ↑
            </Link>
            <Link href="/resources#privacy" className="hover:text-white transition">
              Privacy notice
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
