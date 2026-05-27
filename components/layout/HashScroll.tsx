'use client'

import { useEffect } from 'react'

/** Scroll to URL hash after client navigation (e.g. /products#tufted). */
export default function HashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace(/^#/, '')
      if (!id) return
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }

    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [])

  return null
}
