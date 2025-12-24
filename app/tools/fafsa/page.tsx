import Link from 'next/link'
import FafsaInterpreter from '../../components/tools/FafsaInterpreter'

const sections = [
  {
    title: 'Before you start (10–20 minutes)',
    items: [
      'Decide who is filling it out: student, parent, or both (most families will do both).',
      'Gather basics: legal names, DOB, address history, email + phone, and your Social Security Number (if you have one).',
      'Have a list of colleges you might apply to (you can update later).',
      'If you are a dependent student, plan for a parent to be present for the parent portion.',
    ],
  },
  {
    title: 'Step 1 — Create your FSA ID(s)',
    items: [
      'Student creates an FSA ID at StudentAid.gov and writes down the email + password used.',
      'If required: one parent creates their own FSA ID (do not share one ID).',
      'Use an email you control long-term (you will use it for renewals and verification).',
      'Enable account recovery options (phone / authenticator / backup email) if available.',
    ],
  },
  {
    title: 'Step 2 — Start a new FAFSA',
    items: [
      'Log in and start the FAFSA for the correct academic year.',
      'Confirm student identity information is correct (name must match government records).',
      'Save early, save often. Use the “save” action at the end of each section.',
    ],
  },
  {
    title: 'Step 3 — Student information',
    items: [
      'Confirm citizenship / eligible non-citizen status questions.',
      'Answer dependency questions carefully (these decide whether parent info is required).',
      'If you are unsure, don’t guess—pause and verify (dependency status is a common source of errors).',
    ],
  },
  {
    title: 'Step 4 — Add schools',
    items: [
      'Add the colleges you are considering (you can reorder or update later).',
      'Make sure your state schools and any private colleges are included if you want aid from them.',
      'If you apply to more schools than the form allows at once, submit then come back and update.',
    ],
  },
  {
    title: 'Step 5 — Parent information (if required)',
    items: [
      'Use the correct parent(s) per FAFSA rules (this is about household/financial responsibility, not just who you live with).',
      'Enter parent demographics and contact information exactly.',
      'If parents are divorced/separated/remarried, verify which parent and whether a stepparent must be included.',
    ],
  },
  {
    title: 'Step 6 — Financial information and consent',
    items: [
      'Provide required consent for tax data sharing when prompted (this is critical for processing).',
      'Review imported or entered financial details for obvious mistakes.',
      'If something looks wrong, correct it using official documents (tax returns, W-2s, etc.).',
    ],
  },
  {
    title: 'Step 7 — Sign and submit',
    items: [
      'Student signs with their FSA ID.',
      'Parent signs with their FSA ID if the FAFSA requires parent info.',
      'Submit and save confirmation (screenshot or PDF).',
    ],
  },
  {
    title: 'Step 8 — After you submit',
    items: [
      'Watch for confirmation emails and any follow-up requests (verification).',
      'Check your StudentAid.gov account for status updates and processing results.',
      'If you add schools later, update the FAFSA and resubmit.',
    ],
  },
] as const

const commonPitfalls = [
  {
    title: 'Names and SSNs don’t match records',
    detail: 'Use exact legal spelling. Double-check SSN entry; a single digit error can block processing.',
  },
  {
    title: 'Wrong parent/household selection',
    detail: 'Dependency and “which parent” rules are nuanced. If parents are separated/remarried, verify before submitting.',
  },
  {
    title: 'Skipping required consent',
    detail: 'If you do not provide required consent for tax data sharing when prompted, the FAFSA may not be processed for aid.',
  },
  {
    title: 'Forgetting to sign',
    detail: 'The form is not complete until required signatures are provided (student and sometimes parent).',
  },
] as const

export default function FafsaToolPage() {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full crimson-pill px-3 py-1 text-sm font-semibold">FAFSA Tool</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">A thorough FAFSA checklist</h1>
          <p className="text-slate-600">
            This page is a detailed, step-by-step walkthrough you can follow while completing the FAFSA. If you’re here to extract numbers from tax
            forms, use the CSS Profile Tool.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/tools" className="btn-crimson-outline inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold">
              Back to Tools
            </Link>
            <Link href="/tools/css-profile" className="btn-crimson inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white">
              Open CSS Profile Tool
            </Link>
          </div>
        </header>

        <FafsaInterpreter />

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">How to use this</h2>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
            <li>Work top-to-bottom and check items off as you go.</li>
            <li>If you’re unsure on a question, pause and verify rather than guessing.</li>
            <li>Keep a copy of your submission confirmation for your records.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Step-by-step</h2>
          <div className="grid gap-4">
            {sections.map((s) => (
              <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-2">
                  {s.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Common pitfalls</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {commonPitfalls.map((p) => (
              <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Next steps</h2>
          <p className="mt-2 text-sm text-slate-600">
            After FAFSA is submitted, keep an eye out for verification requests from colleges. Also confirm each college received your FAFSA.
          </p>
        </section>
      </div>
    </div>
  )
}
