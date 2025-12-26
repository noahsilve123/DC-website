'use client'

import { useState, useEffect, useRef } from 'react'
import { BackgroundGradient } from '../components/ui/BackgroundGradient'
import { FadeIn } from '../components/ui/FadeIn'
import { GlassCard } from '../components/ui/GlassCard'
import { useOrganizeStore, ApplicationStatus, School } from '../lib/store/organize-store'
import { Trash2, Clock, CheckCircle2, XCircle, GraduationCap, Search, Loader2, FileText, ArrowRightLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ComparisonView } from '../components/organize/ComparisonView'

type Suggestion = {
  id: number
  name: string
  city: string | null
  state: string | null
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: any }> = {
  saved: { label: 'Saved', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText },
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  waitlisted: { label: 'Waitlisted', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  enrolled: { label: 'Enrolled', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: GraduationCap },
}

export default function OrganizePage() {
  const { schools, addSchool, removeSchool, updateStatus, updateNotes } = useOrganizeStore()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }
      setIsSearching(true)
      try {
        const res = await fetch(`/api/college-suggest?query=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.results) setSuggestions(data.results)
      } catch (e) {
        console.error(e)
      } finally {
        setIsSearching(false)
        setShowSuggestions(true)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleAddSchool = (s: Suggestion) => {
    addSchool({
      id: s.id,
      name: s.name,
      city: s.city || undefined,
      state: s.state || undefined,
    })
    setQuery('')
    setShowSuggestions(false)
  }

  // Group schools by status
  const groupedSchools = schools.reduce((acc, school) => {
    const status = school.status
    if (!acc[status]) acc[status] = []
    acc[status].push(school)
    return acc
  }, {} as Record<ApplicationStatus, School[]>)

  const columns: ApplicationStatus[] = ['saved', 'applied', 'waitlisted', 'accepted', 'rejected', 'enrolled']

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50">
      <BackgroundGradient />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <FadeIn>
          <header className="mb-12 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Your College Tracker
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              Keep track of your applications, deadlines, and decisions in one place.
              Your data is saved automatically to this device.
            </p>
            
            {schools.length > 0 && (
              <button
                onClick={() => setShowComparison(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Compare Schools
              </button>
            )}
          </header>

          {showComparison && (
            <ComparisonView schools={schools} onClose={() => setShowComparison(false)} />
          )}

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-16 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                placeholder="Search for a college to add..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-slate-400" />
              )}
            </div>

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleAddSchool(s)}
                      className="w-full text-left px-6 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-sm text-slate-500">
                        {s.city}, {s.state}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Kanban Board */}
          {schools.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
              <p className="text-slate-500 text-lg">No colleges added yet. Search above to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 overflow-x-auto pb-8">
              {columns.map((status) => (
                <div key={status} className="min-w-[280px] flex flex-col gap-4">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${STATUS_CONFIG[status].color} bg-opacity-50`}>
                    {(() => {
                      const Icon = STATUS_CONFIG[status].icon
                      return <Icon className="h-4 w-4" />
                    })()}
                    <span className="font-bold text-sm uppercase tracking-wide">{STATUS_CONFIG[status].label}</span>
                    <span className="ml-auto bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold">
                      {groupedSchools[status]?.length || 0}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {groupedSchools[status]?.map((school) => (
                      <GlassCard key={school.id} className="p-4 group relative hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-900 leading-tight">{school.name}</h3>
                          <button
                            onClick={() => removeSchool(school.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <p className="text-xs text-slate-500 mb-3">
                          {school.city}, {school.state}
                        </p>

                        <div className="space-y-2">
                          <select
                            value={school.status}
                            onChange={(e) => updateStatus(school.id, e.target.value as ApplicationStatus)}
                            className="w-full text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                              <option key={key} value={key}>
                                {config.label}
                              </option>
                            ))}
                          </select>

                          <textarea
                            value={school.notes || ''}
                            onChange={(e) => updateNotes(school.id, e.target.value)}
                            placeholder="Add notes..."
                            className="w-full text-xs p-2 rounded border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none h-16"
                          />
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  )
}
