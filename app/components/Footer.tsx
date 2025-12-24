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
    <footer className="bg-white text-slate-700 border-t border-slate-200" aria-labelledby="site-footer">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(2,1fr)]">
          <div>
            <p id="site-footer" className="text-xl font-semibold site-title text-slate-900">First Gen Aid</p>
            <p className="mt-3 text-sm text-slate-600 max-w-md">
              Practical financial-aid guidance and private, on-device document tools for first-generation and low-income students and families.
            </p>
          </div>

          <nav aria-label="Quick links" className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Explore</p>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-slate-600 hover:text-slate-900 transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Support links" className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Support</p>
            <ul className="space-y-2 text-sm">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-slate-600 hover:text-slate-900 transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} First Gen Aid. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#top" className="hover:text-slate-900 transition">
              Back to top ↑
            </Link>
            <Link href="/resources#privacy" className="hover:text-slate-900 transition">
              Privacy notice
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
