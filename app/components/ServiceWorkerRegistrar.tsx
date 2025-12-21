"use client"

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    // Avoid dev-server oddities and test flakiness.
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return
    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js')
      } catch (err) {
        console.warn('Service worker registration failed', err)
      }
    }
    register()
  }, [])
  return null
}
