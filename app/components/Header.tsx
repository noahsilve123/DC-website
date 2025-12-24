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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 text-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 focus:outline-offset-4"
            aria-label="First Gen Aid home"
          >
            <div className="leading-tight">
              <p className="site-title text-slate-900">First Gen Aid</p>
              <p className="text-xs md:text-sm text-slate-600">Financial aid guidance • On-device document tools</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-6" aria-label="Primary navigation">
              <Link href="/" className="nav-link hover:opacity-90 hidden md:inline-flex">
                Home
              </Link>
              <Link href="/about" className="nav-link hover:opacity-90 hidden md:inline-flex">
                About
              </Link>
              <Link href="/programs" className="nav-link hover:opacity-90 hidden md:inline-flex">
                Program
              </Link>
              <Link href="/resources" className="nav-link hover:opacity-90 font-semibold">
                Resources
              </Link>
              <Link href="/network" className="nav-link hover:opacity-90 hidden md:inline-flex">
                Network
              </Link>
              <Link
                href="/donate"
                className="ml-2 btn-crimson hidden md:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              >
                Donate
              </Link>
            </nav>

            <button
              aria-label="Open menu"
              aria-expanded={menuOpen}
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
              <Link href="/" ref={firstLinkRef} onClick={() => setMenuOpen(false)} className="text-lg nav-link">
                Home
              </Link>
              <Link href="/about" onClick={() => setMenuOpen(false)} className="text-lg nav-link">
                About
              </Link>
              <Link href="/programs" onClick={() => setMenuOpen(false)} className="text-lg nav-link">
                Program
              </Link>
              <Link href="/resources" onClick={() => setMenuOpen(false)} className="text-lg nav-link">
                Resources
              </Link>
              <Link href="/network" onClick={() => setMenuOpen(false)} className="text-lg nav-link">
                Network
              </Link>
              <Link
                href="/donate"
                onClick={() => setMenuOpen(false)}
                className="mt-4 btn-crimson inline-flex items-center justify-center rounded-full px-4 py-2 text-white"
              >
                Donate
              </Link>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}
