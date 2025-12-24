import Link from 'next/link'
import ScholarshipInterpreter from '../../components/tools/ScholarshipInterpreter'

export default function ScholarshipToolPage() {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full crimson-pill px-3 py-1 text-sm font-semibold">Scholarship Tool</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Summarize an award letter</h1>
          <p className="text-slate-600">
            Upload your award letter once in the Extractor (on the Tools page), then view grant/loan totals here.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/tools" className="btn-crimson-outline inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold">
              Back to Tools
            </Link>
          </div>
        </header>

        <ScholarshipInterpreter />
      </div>
    </div>
  )
}
