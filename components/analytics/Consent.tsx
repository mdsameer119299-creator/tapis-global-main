'use client'

/**
 * A minimal, accessible analytics consent banner. Fixed-position (no CLS),
 * shown only until the visitor chooses. GA4/Clarity load only after "Accept".
 */
import { useEffect, useState } from 'react'
import { readConsent, setConsent } from '@/lib/consent'

export default function Consent() {
  // undefined = SSR/first paint (render nothing); null = undecided (show banner)
  const [choice, setChoice] = useState<'granted' | 'denied' | null | undefined>(undefined)
  useEffect(() => { setChoice(readConsent()) }, [])

  if (choice === undefined || choice !== null) return null

  const decide = (v: 'granted' | 'denied') => { setConsent(v); setChoice(v) }

  return (
    <div role="dialog" aria-label="Analytics consent"
      style={{ position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 900, maxWidth: 720, margin: '0 auto',
        background: '#0e1b2e', color: '#e9eef5', border: '1px solid #2a3d57', borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)', padding: '14px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <p style={{ flex: 1, minWidth: 220, fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>
        We use privacy-friendly analytics (Google Analytics 4 and Microsoft Clarity) to understand site usage.
        No personal data or chat content is sent to them. Do you allow analytics?
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => decide('denied')} style={{ background: 'transparent', color: '#e9eef5', border: '1px solid #2a3d57', borderRadius: 8, padding: '8px 14px', fontSize: 13.5, cursor: 'pointer' }}>Decline</button>
        <button onClick={() => decide('granted')} style={{ background: '#c9a24b', color: '#0e1b2e', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Accept</button>
      </div>
    </div>
  )
}
