'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const baseItems = [
  'Most recent federal tax return (Form 1040) for parent(s) and student, if filed',
  'W-2 forms for all employers for parent(s) and student',
  'Recent bank statements for checking and savings accounts',
  'Records of untaxed income (Social Security benefits, child support received, etc.)',
]

const divorceItems = [
  'Noncustodial parent tax return and W-2s',
  'Noncustodial parent contact information (email, mailing address)',
]

const businessItems = [
  'Most recent business tax returns (Schedule C, 1120, 1120-S, or 1065)',
  'Balance sheet or most recent profit & loss statement for businesses or family farms',
]

const homeEquityItems = [
  'Current estimated market value of primary home',
  'Most recent mortgage statement with remaining balance',
]

const collegeBoardLinks = [
  {
    label: 'CSS Profile (College Board)',
    href: 'https://cssprofile.collegeboard.org/',
  },
  {
    label: 'College Board Net Price & Aid Calculators',
    href: 'https://bigfuture.collegeboard.org/pay-for-college/college-costs',
  },
]

export default function CSSProfileChecklist() {
  const [hasDivorcedParents, setHasDivorcedParents] = useState(false)
  const [hasBusinessOrFarm, setHasBusinessOrFarm] = useState(false)
  const [ownsHome, setOwnsHome] = useState(false)

  const items: string[] = [
    ...baseItems,
    ...(hasDivorcedParents ? divorceItems : []),
    ...(hasBusinessOrFarm ? businessItems : []),
    ...(ownsHome ? homeEquityItems : []),
  ]

  return (
    <section className="bg-white border rounded-2xl shadow-sm p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-full bg-[var(--crimson-soft)] p-2 text-[var(--crimson)]">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">College Board</p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">CSS Profile document checklist</h2>
          <p className="mt-1 text-sm text-gray-600">
            Many private colleges use the College Board CSS Profile alongside FAFSA to award institutional aid. Use this checklist to gather
            common documents before you start the Profile on the official site.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 text-sm text-gray-700">
        <fieldset className="space-y-2 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Your family</legend>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasDivorcedParents}
              onChange={(event) => setHasDivorcedParents(event.target.checked)}
            />
            <span>Parents are divorced, separated, or never married</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasBusinessOrFarm}
              onChange={(event) => setHasBusinessOrFarm(event.target.checked)}
            />
            <span>Family owns a business or farm</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ownsHome}
              onChange={(event) => setOwnsHome(event.target.checked)}
            />
            <span>Family owns their home</span>
          </label>
        </fieldset>

        <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Suggested documents</p>
          <ul className="mt-2 space-y-2 list-disc pl-5">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <AlertCircle size={14} />
          <p className="font-semibold">Use this only as a planning guide.</p>
        </div>
        <p>
          Always follow instructions on the official College Board and college financial-aid websites. Requirements change by school and year, and
          you may be asked for additional forms beyond what is listed here.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {collegeBoardLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-amber-400 px-3 py-1 font-semibold text-[0.7rem] text-amber-900 hover:bg-amber-100"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
