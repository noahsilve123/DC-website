export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">About Destination College</h1>
          <p className="text-slate-700 text-lg leading-relaxed">
            Destination College is a grass-roots, non-profit organization based in Summit, New Jersey.
            It’s run by two grandmas who believe deeply in the power of education—and in what can happen when a student has real direction,
            clear next steps, and someone in their corner.
          </p>
          <p className="text-slate-600 leading-relaxed">
            The college process can be overwhelming: forms, deadlines, unfamiliar terms, and a hundred decisions that feel like they all matter at once.
            We’re here to make it feel more human. More doable. More like a path you can actually walk.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-base font-semibold text-slate-900">Our mission</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Help first-generation students navigate the college process with clarity, encouragement, and practical tools.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-base font-semibold text-slate-900">Our approach</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Break big tasks into small steps, explain what the forms are really asking, and keep students moving forward.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-base font-semibold text-slate-900">Our values</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Respect, privacy, and trust. Students deserve support that protects their information and honors their goals.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">A network that feels like family</h2>
          <p className="text-slate-600 leading-relaxed">
            When students connect with Destination College, they’re not just getting a checklist.
            They’re joining a network—more like a family—where people remember your story, celebrate your wins,
            and help you keep going when the process gets heavy.
          </p>
          <p className="text-slate-600 leading-relaxed">
            We know that a better path forward isn’t only about paperwork.
            It’s about confidence. It’s about guidance.
            It’s about having someone say, “You belong here—and we’ll help you take the next step.”
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">About this website</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            This site includes privacy-first tools that run on your device to help with common parts of the process—like organizing tasks,
            extracting values from documents, and preparing answers for financial-aid forms.
            The goal is simple: fewer late nights, fewer confusing steps, and more confidence.
          </p>
        </section>
      </div>
    </div>
  )
}
