'use client'

/**
 * A compact, accessible analytics consent bar. Fixed-position (no CLS) and, on
 * mobile, sized/placed to avoid overlapping the TARA launcher, WhatsApp button,
 * sticky CTA bar or page content. Shown only until the visitor chooses; the
 * decision persists for 12 months (see lib/consent.ts) and is read on load.
 * GA4/Clarity load only after "Accept".
 */
import { useEffect, useState } from 'react'
import { readConsent, setConsent } from '@/lib/consent'

export default function Consent() {
  // undefined = SSR/first paint (render nothing); null = undecided (show banner)
  const [choice, setChoice] = useState<'granted' | 'denied' | null | undefined>(undefined)
  useEffect(() => { setChoice(readConsent()) }, [])

  if (choice === undefined || choice !== null) return null

  const decide = (v: 'granted' | 'denied') => { setConsent(v); setChoice(v) }

  // Compact bar. Positioning (globals.css .consent-card) keeps it clear of the
  // TARA launcher, WhatsApp button and sticky CTA bar on mobile.
  return (
    <div className="consent-card" role="dialog" aria-label="Analytics consent">
      <p className="consent-text">We use analytics cookies to improve our website.</p>
      <div className="consent-actions">
        <button type="button" className="consent-btn consent-decline" onClick={() => decide('denied')}>Decline</button>
        <button type="button" className="consent-btn consent-accept" onClick={() => decide('granted')}>Accept</button>
      </div>
    </div>
  )
}
