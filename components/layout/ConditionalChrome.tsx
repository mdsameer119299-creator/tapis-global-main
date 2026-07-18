'use client'

import { usePathname } from 'next/navigation'

/** Hides the public-site chrome (nav, footer, WhatsApp, TARA) on CraftTrack
 * admin routes, which have their own self-contained shell
 * (app/admin/crafttrack/(dashboard)/layout.tsx) and must never show public
 * marketing UI.
 *
 * Deliberately NOT implemented via headers()/cookies() in the root layout —
 * either would force the whole site into dynamic rendering (Next.js opts a
 * route out of static generation the moment a layout reads request state),
 * which would undo the static generation this site relies on for SEO across
 * hundreds of pages. usePathname() in a Client Component has no such cost:
 * it's resolved from the already-known route at render time, so every
 * non-admin page keeps rendering (and statically generating) exactly as
 * before. children are passed in from the (Server Component) root layout so
 * Navbar/Footer/etc. still render server-side for every public page — this
 * component only ever decides whether to include that already-rendered
 * output, never re-renders it client-side. */
export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <>{children}</>
}
