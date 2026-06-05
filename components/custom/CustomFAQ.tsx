'use client'

import { useState } from 'react'
import { CUSTOM_FAQ } from '@/lib/custom'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CustomFAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section
      className="px-12 max-lg:px-6 py-20 lg:py-24"
      style={{ background: '#0d0a08' }}
    >
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <Eyebrow white>FAQ</Eyebrow>
            <h2
              className="font-medium leading-[1.06]"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(32px, 3.5vw, 44px)',
                color: '#fff',
              }}
            >
              Common
              <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}> Questions</em>
            </h2>
          </div>
        </Reveal>

        <div className="flex flex-col gap-3">
          {CUSTOM_FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.q} delay={i * 40}>
                <div
                  className="rounded-lg overflow-hidden transition-all duration-300"
                  style={{
                    background: isOpen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isOpen ? 'rgba(192,155,74,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[16px] font-medium" style={{ color: isOpen ? 'var(--gp)' : 'rgba(248,244,238,0.85)' }}>
                      {item.q}
                    </span>
                    <span
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[18px] transition-transform duration-300"
                      style={{
                        background: 'rgba(192,155,74,0.1)',
                        color: 'var(--gp)',
                        transform: isOpen ? 'rotate(45deg)' : 'none',
                      }}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-400 ease-out"
                    style={{ maxHeight: isOpen ? '300px' : '0', opacity: isOpen ? 1 : 0 }}
                  >
                    <p
                      className="px-6 pb-5 text-[16px] font-light leading-[1.82]"
                      style={{ color: 'rgba(248,244,238,0.48)' }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
