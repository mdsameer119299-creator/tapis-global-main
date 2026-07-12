'use client'

/**
 * Persists first/last-touch attribution once per page load. Renders nothing.
 * Runs regardless of analytics IDs so leads are attributable even when GA4 /
 * Clarity are disabled.
 */
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { persistAttribution } from '@/lib/attribution'

export default function AttributionInit() {
  const pathname = usePathname()
  useEffect(() => { persistAttribution() }, [pathname])
  return null
}
