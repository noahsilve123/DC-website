import Link from 'next/link'
import ExtractorHubMini from '../components/ExtractorHubMini'

const tools = [
  {
    title: 'CSS Profile Tool',
    description: 'Upload documents and copy calculated answers for the CSS Profile.',
    href: '/tools/css-profile',
    ready: true,
  },
  {
    title: 'FAFSA Tool',
    description: 'Step-by-step FAFSA guide and checklist.',
    href: '/tools/fafsa',
    ready: true,
  },
  {
    title: 'Scholarship Tool',
    description: 'Upload award letters and summarize grants/loans.',
    href: '/tools/scholarships',
    ready: true,
  },
  {
    title: 'Budget Tool',
    description: 'Coming soon.',
    href: null,
    ready: false,
  },
] as const

export default function ToolsPage() {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Tools</h1>
          <p className="text-slate-600">Choose a financial tool to get started.</p>
        </div>

        <ExtractorHubMini />

        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => {
            const card = (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{tool.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{tool.description}</p>
                  </div>
                  {!tool.ready && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                      Not set up yet
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  {tool.ready && tool.href ? (
                    <span className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                      Open
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">
                      Coming soon
                    </span>
                  )}
                </div>
              </div>
            )

            if (tool.ready && tool.href) {
              return (
                <Link key={tool.title} href={tool.href} className="block focus:outline-offset-4">
                  {card}
                </Link>
              )
            }

            return <div key={tool.title}>{card}</div>
          })}
        </div>
      </div>
    </div>
  )
}
