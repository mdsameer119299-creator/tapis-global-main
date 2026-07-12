'use client'

/**
 * LeadSection — reusable conversion block for hub/landing pages.
 *
 * Composes: buyer-guidance intro → five BuyerPaths → a pre-selecting
 * QualificationForm → direct WhatsApp/email channels (with analytics). Drop it
 * near the foot of a hub page to give every visitor a qualified next step.
 * Content is guidance only — no fabricated capacity/certification/pricing claims.
 */
import { useState } from 'react'
import { SITE } from '@/lib/data'
import BuyerPaths from '@/components/leads/BuyerPaths'
import QualificationForm from '@/components/leads/QualificationForm'
import { trackEvent, LEAD_EVENTS } from '@/lib/analytics'
import type { BuyerType } from '@/lib/buyer-paths'

export default function LeadSection({
  source,
  heading = 'Start your enquiry',
  intro = 'Tell us who you are and what you need — we route your enquiry to the right team and reply by email or WhatsApp.',
}: {
  source?: string
  heading?: string
  intro?: string
}) {
  const [buyer, setBuyer] = useState<BuyerType>('importer')
  const waHref = `${SITE.whatsapp}?text=${encodeURIComponent('Hello Tapis Global, I would like to discuss a carpet/rug requirement.')}`
  const mailHref = `mailto:${SITE.email}`

  return (
    <section className="py-14 lg:py-16 px-8 max-lg:px-5" style={{ background: 'rgba(192,155,74,0.05)' }}>
      <div className="mx-auto max-w-5xl">
        <p className="text-[13px] tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: 'var(--gd)' }}>
          Choose your path
        </p>
        <h2 className="font-medium leading-[1.1] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px,2.8vw,36px)', color: 'var(--ink)' }}>
          {heading}
        </h2>
        <p className="text-[15.5px] font-light leading-[1.8] max-w-2xl mb-8" style={{ color: 'var(--inkm)' }}>{intro}</p>

        <BuyerPaths source={source} onSelect={setBuyer} />

        <div id="qualify" className="mt-12 scroll-mt-24 rounded-sm border p-6 lg:p-8" style={{ borderColor: 'var(--bd)', background: 'rgba(255,255,255,0.6)' }}>
          <h3 className="text-[19px] font-medium mb-5" style={{ fontFamily: '"Cormorant Garamond", serif', color: 'var(--ink)' }}>
            Qualification details
          </h3>
          <QualificationForm defaultBuyerType={buyer} source={source} />
        </div>

        <div className="mt-8 flex flex-wrap gap-6 text-[14px]" style={{ color: 'var(--inkm)' }}>
          <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent(LEAD_EVENTS.whatsappClick, { source })} style={{ color: '#128C4A' }}>
            WhatsApp: {SITE.phone}
          </a>
          <a href={mailHref} onClick={() => trackEvent(LEAD_EVENTS.emailClick, { source })} style={{ color: 'var(--c)' }}>
            Email: {SITE.email}
          </a>
        </div>
      </div>
    </section>
  )
}
