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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b-2 border-slate-200 text-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 focus:outline-offset-4"
            aria-label="Destination College home"
          >
            <div className="leading-tight">
              <p className="site-title text-slate-900">Destination College</p>
              <p className="text-xs md:text-sm text-slate-600">Financial aid guidance • On-device document tools</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-6" aria-label="Primary navigation">
              <Link href="/about" className="nav-link hover:opacity-90 hidden md:inline-flex">
                About
              </Link>
              <Link href="/tools" className="nav-link hover:opacity-90 hidden md:inline-flex">
                Tools
              </Link>
              <Link href="/organize" className="nav-link hover:opacity-90 hidden md:inline-flex">
                Organize
              </Link>
            </nav>

            <button
              aria-label="Open menu"
              onClick={() => setMenuOpen((s) => !s)}
              className="md:hidden text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <aside className="fixed top-0 right-0 z-50 h-full w-4/5 max-w-xs bg-white text-slate-900 p-6 shadow-2xl border-l border-slate-200">
            <nav className="flex flex-col gap-4">
              <Link href="/about" ref={firstLinkRef} onClick={() => setMenuOpen(false)} className="text-lg nav-link">
                About
              </Link>
              <Link href="/tools" onClick={() => setMenuOpen(false)} className="text-lg nav-link">
                Tools
              </Link>
              <Link href="/organize" onClick={() => setMenuOpen(false)} className="text-lg nav-link">
                Organize
              </Link>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}
