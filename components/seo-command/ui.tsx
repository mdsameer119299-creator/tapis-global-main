import Link from 'next/link'
import type { ReactNode } from 'react'
import type { PageData } from '@/lib/seo-command/auth'

const SEV: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
  LOW: 'bg-sky-100 text-sky-800 border-sky-200',
  INFO: 'bg-gray-100 text-gray-700 border-gray-200',
}

export function SeverityBadge({ severity }: { severity: string }) {
  return <span className={`inline-block rounded border px-2 py-0.5 text-2xs font-medium ${SEV[severity] ?? SEV.INFO}`}>{severity}</span>
}

export function Panel({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-ivory-k bg-white p-5">
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-lg text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-lg border border-ivory-k bg-white p-4">
      <div className="text-2xs uppercase tracking-wide text-ink-m">{label}</div>
      <div className="mt-1 font-display text-3xl text-ink">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-s">{sub}</div>}
    </div>
  )
}

export function ConnectionBadge({ name, status }: { name: string; status: string }) {
  const pending = status === 'PENDING' || status === 'NOT_CONFIGURED'
  return (
    <div className={`rounded-lg border p-4 ${pending ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
      <div className="text-sm font-medium text-ink">{name}</div>
      <div className="mt-1 text-xs text-ink-s">
        {pending ? 'Connection pending. No data is shown until Google access is authorised; nothing is estimated.' : status === 'CONFIGURED' ? 'Connected' : status}
      </div>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded border border-dashed border-ivory-k p-6 text-center text-sm text-ink-s">{children}</p>
}

/** Renders loading outcomes consistently: setup state, error state, or the data. */
export function Gate<T>({ result, children }: { result: PageData<T>; children: (data: T) => ReactNode }) {
  if (result.state === 'not_configured') {
    return (
      <Panel title="SEO database not connected">
        <p className="text-sm text-ink-s">
          This environment has no <code className="rounded bg-ivory px-1">SEO_DATABASE_URL</code>. Add it in Vercel (Preview environment) using the connection string of the <strong>tapis-global-seo-dev</strong> Supabase project, then redeploy. The website database is never used for SEO data.
        </p>
      </Panel>
    )
  }
  if (result.state === 'error') return <Panel title="Could not load data"><p className="text-sm text-red-700">{result.message}</p></Panel>
  return <>{children(result.data)}</>
}

export function Sparkline({ values, width = 260, height = 56 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return <p className="text-xs text-ink-m">Trend appears after two completed crawls.</p>
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 100)
  const x = (i: number) => (i / (values.length - 1)) * (width - 8) + 4
  const y = (v: number) => height - 4 - ((v - min) / (max - min || 1)) * (height - 8)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <svg width={width} height={height} role="img" aria-label={`Health score trend, latest ${values[values.length - 1]}`}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-gold" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="3" className="fill-gold" />
    </svg>
  )
}

export function Nav({ email }: { email: string }) {
  const links = [
    ['/admin/seo', 'Overview'],
    ['/admin/seo/issues', 'Issues'],
    ['/admin/seo/pages', 'Pages'],
    ['/admin/seo/keywords', 'Keywords'],
    ['/admin/seo/competitors', 'Competitors'],
    ['/admin/seo/recommendations', 'Recommendations'],
    ['/admin/seo/reports', 'Reports'],
  ]
  return (
    <header className="border-b border-ivory-k bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/admin/seo" className="font-display text-lg text-ink">
          SEO Command Centre
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="text-ink-s hover:text-ink">
              {label}
            </Link>
          ))}
          <span className="text-2xs text-ink-m">{email}</span>
        </nav>
      </div>
    </header>
  )
}

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '–'
  return new Date(d).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' IST'
}

export function codeLabel(code: string): string {
  return code.toLowerCase().replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}
