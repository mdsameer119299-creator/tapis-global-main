'use client'

import { usePathname } from 'next/navigation'

/** Hides the public-site chrome (nav, footer, WhatsApp, TARA, and the
 * CraftTrack launcher itself) on two route trees that are each their own
 * focused, self-contained experience rather than "a page on the marketing
 * site": /admin/crafttrack (its own shell,
 * app/admin/crafttrack/(dashboard)/layout.tsx) and /crafttrack itself — the
 * approved CraftTrack screens (login, order lookup, dashboard, journey
 * timeline) were designed as full-bleed, chrome-free screens, not forms
 * dropped into the middle of the normal nav/footer/WhatsApp/TARA layout.
 * The launcher button also has no reason to re-offer the teaser modal once
 * a visitor is already inside the CraftTrack flow.
 *
 * Deliberately NOT implemented via headers()/cookies() in the root layout —
 * either would force the whole site into dynamic rendering (Next.js opts a
 * route out of static generation the moment a layout reads request state),
 * which would undo the static generation this site relies on for SEO across
 * hundreds of pages. usePathname() in a Client Component has no such cost:
 * it's resolved from the already-known route at render time, so every
 * other page keeps rendering (and statically generating) exactly as
 * before. children are passed in from the (Server Component) root layout so
 * Navbar/Footer/etc. still render server-side for every public page — this
 * component only ever decides whether to include that already-rendered
 * output, never re-renders it client-side. */
export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/crafttrack')) return null
  return <>{children}</>
}
