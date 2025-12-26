'use client'

import { useState, useEffect } from 'react'
import { School } from '../../lib/store/organize-store'
import { Loader2, X, ArrowRightLeft, Users, MapPin, DollarSign, GraduationCap, PartyPopper, Building2 } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'

type ComparisonData = {
  id: number
  name: string
  city: string
  state: string
  acceptanceRate: number | null
  totalCost: number | null
  averageSalary: number | null
  greekLife: string
  undergradSize: number | null
  atmosphere: string
  goingOutScene: string
  stereotypes: string[]
  locationLabel: string
}

export function ComparisonView({ schools, onClose }: { schools: School[]; onClose: () => void }) {
  const [data, setData] = useState<ComparisonData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'multi' | '1v1'>('multi')
  
  // 1v1 Selection
  const [leftId, setLeftId] = useState<number | ''>('')
  const [rightId, setRightId] = useState<number | ''>('')

  useEffect(() => {
    async function fetchData() {
      if (schools.length === 0) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/college-compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schoolIds: schools.map(s => s.id) })
        })
        
        if (!res.ok) throw new Error('Failed to fetch comparison data')
        
        const json = await res.json()
        setData(json.results || [])
        
        // Set defaults for 1v1
        if (json.results?.length >= 2) {
          setLeftId(json.results[0].id)
          setRightId(json.results[1].id)
        } else if (json.results?.length === 1) {
          setLeftId(json.results[0].id)
        }
      } catch (e) {
        setError('Could not load comparison data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [schools])

  const formatMoney = (n: number | null) => 
    n ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : 'N/A'
  
  const formatPercent = (n: number | null) => 
    n ? `${(n * 100).toFixed(1)}%` : 'N/A'

  const formatNumber = (n: number | null) => 
    n ? n.toLocaleString() : 'N/A'

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-slate-600">Analyzing schools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900">Compare Schools</h2>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('multi')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  activeTab === 'multi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Multi-View
              </button>
              <button
                onClick={() => setActiveTab('1v1')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  activeTab === '1v1' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Head-to-Head
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors" aria-label="Close">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
          {error ? (
            <div className="text-center text-red-600 py-10">{error}</div>
          ) : activeTab === 'multi' ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-slate-50 p-3 text-left font-bold text-slate-500 uppercase text-xs border-b border-slate-200 min-w-[150px]">Metric</th>
                    {data.map(s => (
                      <th key={s.id} className="p-3 text-left font-bold text-slate-900 border-b border-slate-200 min-w-[200px]">
                        {s.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="sticky left-0 bg-white p-3 font-semibold text-slate-700 border-r border-slate-100">Acceptance Rate</td>
                    {data.map(s => <td key={s.id} className="p-3 text-slate-600">{formatPercent(s.acceptanceRate)}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 bg-white p-3 font-semibold text-slate-700 border-r border-slate-100">Total Cost (Avg)</td>
                    {data.map(s => <td key={s.id} className="p-3 text-slate-600">{formatMoney(s.totalCost)}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 bg-white p-3 font-semibold text-slate-700 border-r border-slate-100">Avg Salary (10yr)</td>
                    {data.map(s => <td key={s.id} className="p-3 text-slate-600">{formatMoney(s.averageSalary)}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 bg-white p-3 font-semibold text-slate-700 border-r border-slate-100">Undergrad Size</td>
                    {data.map(s => <td key={s.id} className="p-3 text-slate-600">{formatNumber(s.undergradSize)}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 bg-white p-3 font-semibold text-slate-700 border-r border-slate-100">Location</td>
                    {data.map(s => <td key={s.id} className="p-3 text-slate-600">{s.locationLabel}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 bg-white p-3 font-semibold text-slate-700 border-r border-slate-100">Atmosphere</td>
                    {data.map(s => <td key={s.id} className="p-3 text-slate-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                        {s.atmosphere}
                      </span>
                    </td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 bg-white p-3 font-semibold text-slate-700 border-r border-slate-100">Greek Life</td>
                    {data.map(s => <td key={s.id} className="p-3 text-slate-600">{s.greekLife}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 bg-white p-3 font-semibold text-slate-700 border-r border-slate-100">Going Out Scene</td>
                    {data.map(s => <td key={s.id} className="p-3 text-slate-600 text-xs">{s.goingOutScene}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 bg-white p-3 font-semibold text-slate-700 border-r border-slate-100">Vibe / Stereotypes</td>
                    {data.map(s => (
                      <td key={s.id} className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {s.stereotypes.map(t => (
                            <span key={t} className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <select 
                  value={leftId} 
                  onChange={(e) => setLeftId(Number(e.target.value))}
                  className="p-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  aria-label="Select first school"
                >
                  <option value="" disabled>Select School 1</option>
                  {data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select 
                  value={rightId} 
                  onChange={(e) => setRightId(Number(e.target.value))}
                  className="p-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  aria-label="Select second school"
                >
                  <option value="" disabled>Select School 2</option>
                  {data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {leftId && rightId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto">
                  {[data.find(s => s.id === leftId)!, data.find(s => s.id === rightId)!].map((school, i) => (
                    <GlassCard key={school.id} className={`h-fit ${i === 0 ? 'border-indigo-100 bg-indigo-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
                      <div className="mb-6 text-center">
                        <h3 className="text-2xl font-black text-slate-900 mb-1">{school.name}</h3>
                        <p className="text-slate-500 flex items-center justify-center gap-1">
                          <MapPin className="h-4 w-4" /> {school.locationLabel}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                          <div className="flex items-center gap-2 text-slate-600">
                            <GraduationCap className="h-5 w-5" />
                            <span className="text-sm font-medium">Acceptance Rate</span>
                          </div>
                          <span className="font-bold text-slate-900">{formatPercent(school.acceptanceRate)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                          <div className="flex items-center gap-2 text-slate-600">
                            <DollarSign className="h-5 w-5" />
                            <span className="text-sm font-medium">Total Cost</span>
                          </div>
                          <span className="font-bold text-slate-900">{formatMoney(school.totalCost)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Users className="h-5 w-5" />
                            <span className="text-sm font-medium">Undergrad Size</span>
                          </div>
                          <span className="font-bold text-slate-900">{formatNumber(school.undergradSize)}</span>
                        </div>

                        <div className="p-4 bg-white/60 rounded-xl space-y-3">
                          <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
                            <PartyPopper className="h-5 w-5" />
                            <span>The Vibe</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-slate-500">Atmosphere</div>
                            <div className="font-medium text-slate-900 text-right">{school.atmosphere}</div>
                            
                            <div className="text-slate-500">Greek Life</div>
                            <div className="font-medium text-slate-900 text-right">{school.greekLife}</div>
                          </div>
                          
                          <div className="pt-2 border-t border-slate-200/50">
                            <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Going Out Scene</div>
                            <p className="text-sm text-slate-800 leading-relaxed">{school.goingOutScene}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/50">
                            <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Stereotypes</div>
                            <div className="flex flex-wrap gap-1.5">
                              {school.stereotypes.map(t => (
                                <span key={t} className="px-2 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-sm">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 italic">
                  Select two schools to compare
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
