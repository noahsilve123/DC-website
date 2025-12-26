'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check } from 'lucide-react'

const themes = [
  {
    name: 'Navy',
    colors: {
      50: '#f0f4f8',
      100: '#d9e2ec',
      200: '#bcccdc',
      300: '#9fb3c8',
      400: '#829ab1',
      500: '#627d98',
      600: '#486581',
      700: '#334e68',
      800: '#243b53',
      900: '#102a43',
      950: '#0a1c2e',
    },
    preview: '#0a1c2e'
  },
  {
    name: 'Emerald',
    colors: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    preview: '#052e16'
  },
  {
    name: 'Crimson',
    colors: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
      950: '#4c0519',
    },
    preview: '#4c0519'
  },
  {
    name: 'Royal',
    colors: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
    preview: '#3b0764'
  },
  {
    name: 'Charcoal',
    colors: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    preview: '#020617'
  }
]

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTheme, setActiveTheme] = useState('Navy')

  const setTheme = (themeName: string) => {
    const theme = themes.find(t => t.name === themeName)
    if (!theme) return

    setActiveTheme(themeName)
    
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--navy-${key}`, value)
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-2 flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white/90 p-2 shadow-xl backdrop-blur-md"
          >
            {themes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setTheme(theme.name)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-navy-900 transition-colors hover:bg-stone-100"
              >
                <div 
                  className="h-6 w-6 rounded-full border border-stone-200 shadow-sm"
                  style={{ backgroundColor: theme.preview }}
                />
                <span className="w-16 text-left">{theme.name}</span>
                {activeTheme === theme.name && (
                  <Check className="h-4 w-4 text-gold-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-navy-900 shadow-lg transition-transform hover:scale-110 hover:shadow-xl border border-stone-200"
        aria-label="Change theme"
      >
        <Palette className="h-5 w-5" />
      </button>
    </div>
  )
}
