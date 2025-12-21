import Link from "next/link"

export const metadata = {
  title: "Resources | Destination College",
  description: "Links and guides for first-gen students and families navigating financial aid.",
}

const resources = [
  {
    title: "FAFSA Completion Help",
    summary:
      "Step-by-step guidance for Summit High School families so students can claim all eligible aid dollars.",
    href: "https://studentaid.gov/h/apply-for-aid/fafsa",
  },
  {
    title: "Scholarship Tracker",
    summary: "Notes about regional scholarships, deadlines, and application tips collected by Destination College mentors.",
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
    <div className="min-h-screen bg-gradient-to-b from-white via-[#e0f2ff] to-white py-16 px-6">
      <div className="mx-auto max-w-4xl space-y-6 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-[var(--crimson)]">Summit High School</p>
        <h1 className="text-3xl font-semibold text-[#0b1d3f] sm:text-4xl">Resources for the first-gen journey</h1>
        <p className="text-base text-gray-700">
          Destination College keeps a curated list of trusted tools, guidance, and partner programs that help students enter and remain
          in college with confidence.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        {resources.map((item) => (
          <article key={item.title} className="rounded-2xl border border-[var(--gold)]/60 bg-white/80 p-6 shadow-lg transition hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-[#0b1d3f]">{item.title}</h2>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">{item.summary}</p>
            <Link
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center text-sm font-semibold text-[var(--crimson)] transition hover:text-[var(--crimson-dark)]"
            >
              Open resource ↗
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
