import Link from 'next/link'
import { ArrowRight, ClipboardList, FolderKanban, Info, Sparkles } from 'lucide-react'

export default function Home() {
  const quickLinks = [
    {
      title: 'CSS Profile Tool',
      description: 'Upload documents and copy calculated answers for the CSS Profile.',
      href: '/tools/css-profile',
      label: 'Start here',
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      title: 'All financial tools',
      description: 'See what’s available (more tools coming soon).',
      href: '/tools',
      label: 'Browse tools',
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      title: 'Organize your checklist',
      description: 'A simple place to keep track of what you still need.',
      href: '/organize',
      label: 'Coming soon',
      icon: <FolderKanban className="h-5 w-5" />,
    },
  ] as const

  return (
    <div className="bg-white text-gray-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-zinc-50 text-gray-900">
        <div className="absolute inset-0 opacity-40 pattern-grid" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full crimson-pill px-3 py-1 text-sm font-medium">
              <Info className="h-4 w-4" /> Privacy-first • on-device
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl font-black leading-tight text-gray-900">Financial aid, without the chaos.</h1>
            <p className="mt-4 text-lg text-gray-700">
              A minimal set of tools to help you move faster through the CSS Profile and financial-aid paperwork—without sending your documents to the cloud.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/tools/css-profile"
                className="btn-crimson inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition hover:-translate-y-0.5"
              >
                Open CSS Profile Tool <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/tools" className="btn-crimson-outline inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition">
                Browse all tools
              </Link>
            </div>
          </div>

          <section className="glass-panel rounded-3xl p-8 text-gray-900 relative overflow-hidden" aria-label="What you can do here">
            <div className="relative z-10">
              <p className="text-sm font-semibold text-[var(--crimson)]">
                What this site does
              </p>
              <p className="mt-4 text-xl font-semibold">Upload → extract → copy answers.</p>
              <p className="mt-3 text-sm text-gray-600">
                Start with the CSS Profile Tool. More financial tools will be added over time.
              </p>
              <div className="mt-6 h-px bg-gray-200" />
              <ul className="mt-6 space-y-4 text-sm text-gray-700">
                <li className="flex items-center gap-3">
                  <span className="stat-dot" /> On-device scanning
                </li>
                <li className="flex items-center gap-3">
                  <span className="stat-dot" /> Clear table of values to copy
                </li>
                <li className="flex items-center gap-3">
                  <span className="stat-dot" /> Minimal UI, fewer steps
                </li>
              </ul>
            </div>
          </section>
        </div>
      </section>

      <section className="relative -mt-8 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="sr-only">Quick links</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {quickLinks.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-offset-4"
              >
                <div className="inline-flex items-center gap-2 crimson-pill px-3 py-1 text-sm font-medium">
                  {card.icon}
                  {card.label}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{card.description}</p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold crimson-link">
                  Open <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
