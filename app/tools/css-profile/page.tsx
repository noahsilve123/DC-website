import CSSProfileChecklist from '../../components/CSSProfileChecklist'
import CSSProfileCopilot from '../../components/CSSProfileCopilot'

export default function CssProfileToolPage() {
  return (
    <div className="bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">CSS Profile Tool</h1>
          <p className="text-slate-600">Copy CSS Profile answers based on documents you uploaded in the shared Extractor.</p>
        </div>

        <CSSProfileChecklist />
        <CSSProfileCopilot />
      </div>
    </div>
  )
}
