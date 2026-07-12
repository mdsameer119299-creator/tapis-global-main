'use client'

/**
 * AttributionTracker — persists first-touch attribution (landing page, referrer,
 * UTM params) once per session so it survives internal navigation. Renders
 * nothing. Mounted in the root layout.
 */
import { useEffect } from 'react'
import { persistFirstTouch } from '@/lib/attribution'

export default function AttributionTracker() {
  useEffect(() => {
    persistFirstTouch()
  }, [])
  return null
}
