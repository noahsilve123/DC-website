import CSSProfileCopilot from './components/CSSProfileCopilot'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CSS Profile Copilot</h1>
          <p className="text-lg text-gray-600">
            Securely scan your tax forms locally to generate your CSS Profile answers.
          </p>
        </div>
        <CSSProfileCopilot />
      </div>
    </main>
  )
}
