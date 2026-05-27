'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const SESSION_KEY = 'tgi-loader-seen'
const MAX_MS      = 650

export default function Loader() {
  const [gone, setGone] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    setGone(false)
    let done = false

    const finish = () => {
      if (done) return
      done = true
      sessionStorage.setItem(SESSION_KEY, '1')
      setGone(true)
    }

    const timer = window.setTimeout(finish, MAX_MS)
    if (document.readyState === 'complete') {
      finish()
    } else {
      window.addEventListener('load', finish, { once: true })
    }

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('load', finish)
    }
  }, [])

  if (gone) return null

  return (
    <div
      id="loader"
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-5"
      style={{ background: 'var(--cd)' }}
      aria-hidden="true"
    >
      <Image
        src="/logos/tgi-footer-logo1.png"
        alt=""
        width={200}
        height={60}
        priority
        quality={75}
        className="block h-[60px] w-auto max-w-[200px] object-contain animate-ldfade"
      />
      <div className="h-px w-0 animate-ldbar" style={{ background: 'var(--g)' }} />
    </div>
  )
}
