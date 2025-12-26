"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }
    if (menuOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKey)
      setTimeout(() => firstLinkRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKey)
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKey)
    }
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 text-navy-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 focus:outline-none group"
            aria-label="Destination College home"
          >
            <div className="leading-tight">
              <p className="font-heading font-bold text-2xl tracking-tight text-navy-900 group-hover:text-gold-600 transition-colors">
                Destination College
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
              {['About', 'Tools', 'Organize'].map((item) => (
                <Link 
                  key={item}
                  href={`/${item.toLowerCase()}`} 
                  className="text-sm font-bold tracking-widest uppercase text-navy-600 hover:text-gold-600 transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold-600 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <button
              aria-label="Open menu"
              onClick={() => setMenuOpen((s) => !s)}
              className="md:hidden text-navy-900 hover:text-gold-600 focus:outline-none"
            >
              {menuOpen ? (
                <span className="text-2xl">✕</span>
              ) : (
                <div className="space-y-1.5">
                  <span className="block w-6 h-0.5 bg-current"></span>
                  <span className="block w-6 h-0.5 bg-current"></span>
                  <span className="block w-4 h-0.5 bg-current ml-auto"></span>
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-white/90 backdrop-blur-sm z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <aside className="fixed top-0 right-0 z-50 h-full w-4/5 max-w-xs bg-white text-navy-900 p-8 shadow-2xl border-l border-stone-200">
            <nav className="flex flex-col gap-6 mt-12">
              {['About', 'Tools', 'Organize'].map((item) => (
                <Link 
                  key={item}
                  href={`/${item.toLowerCase()}`} 
                  onClick={() => setMenuOpen(false)} 
                  className="text-2xl font-heading font-bold text-navy-900 hover:text-gold-600 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  )
}
