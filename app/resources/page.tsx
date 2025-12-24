import Link from "next/link"

export const metadata = {
  title: "Resources | First Gen Aid",
  description: "Links and guides for first-gen students and families navigating financial aid.",
}

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
    <div className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="mx-auto max-w-4xl space-y-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">First Gen Aid</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Resources for the first-gen journey</h1>
        <p className="text-base text-slate-600">
          A curated list of trusted tools, guidance, and programs to help you apply, afford, and stay on track.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        {resources.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.summary}</p>
            <Link
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center text-sm font-semibold text-slate-900 hover:underline"
            >
              Open resource ↗
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
