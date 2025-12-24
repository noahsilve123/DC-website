import CSSProfileCopilot from './components/CSSProfileCopilot'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">First Gen Aid</h1>
          <p className="text-lg text-gray-600">Privacy-first tools to help you complete the CSS Profile and FAFSA.</p>
        </div>
        <CSSProfileCopilot />
      </div>
    </main>
  )
}
