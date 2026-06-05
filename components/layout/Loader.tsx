'use client'

import { useEffect, useState } from 'react'

const SESSION_KEY = 'tgi-loader-seen'
const MAX_MS      = 280

export default function Loader() {
  const [gone, setGone] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem(SESSION_KEY, '1')
      return
    }

    setGone(false)
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, '1')
      setGone(true)
    }, MAX_MS)

    return () => window.clearTimeout(timer)
  }, [])

  if (gone) return null

  return (
    <div
      id="loader"
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-4 pointer-events-none"
      style={{ background: 'var(--cd)' }}
      aria-hidden="true"
    >
      <div
        className="font-display text-[42px] font-normal tracking-[0.08em] animate-ldfade"
        style={{ color: 'var(--gp)' }}
        aria-hidden
      >
        TG
      </div>
      <div className="h-px w-[110px] overflow-hidden bg-white/10">
        <div className="h-full w-full origin-left animate-ldbar-scale" style={{ background: 'var(--g)' }} />
      </div>
    </div>
  )
}
