"use client"

import Link from 'next/link'

const quickLinks = [
  { label: 'About', href: '/about' },
  { label: 'Tools', href: '/tools' },
  { label: 'Organize', href: '/organize' },
  { label: 'Resources', href: '/resources' },
]

const supportLinks = [
  { label: 'Privacy notice', href: '/resources#privacy' },
]

export default function Footer() {
  return (
    <footer className="bg-white text-navy-700 border-t border-stone-200" aria-labelledby="site-footer">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(2,1fr)]">
          <div>
            <p id="site-footer" className="text-xl font-semibold site-title text-navy-900">Destination College</p>
            <p className="mt-3 text-sm text-navy-600 max-w-md">
              Practical financial-aid guidance and private, on-device document tools for first-generation students and families.
            </p>
          </div>

          <nav aria-label="Quick links" className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-navy-500">Explore</p>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-navy-600 hover:text-navy-900 transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Support links" className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-navy-500">Support</p>
            <ul className="space-y-2 text-sm">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-navy-600 hover:text-navy-900 transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-stone-200 pt-6 text-xs text-navy-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Destination College. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#top" className="hover:text-navy-900 transition">
              Back to top ↑
            </Link>
            <Link href="/resources#privacy" className="hover:text-navy-900 transition">
              Privacy notice
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
