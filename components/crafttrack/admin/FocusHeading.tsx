'use client'

import { useEffect, useRef } from 'react'

/** Next.js App Router doesn't manage focus on client-side navigation the
 * way a full page load does — a router.push() after a form submission
 * silently leaves focus wherever it was on the previous page. Wrap a
 * page's <h1> in this on any page that's a common redirect target after
 * an action (e.g. the order detail page after "Create order") so
 * keyboard/screen-reader users land somewhere sensible. */
export default function FocusHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <h1 ref={ref} tabIndex={-1} className={className}>
      {children}
    </h1>
  )
}
