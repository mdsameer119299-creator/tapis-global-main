'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

async function call(method: string, url: string, body?: unknown): Promise<{ ok: boolean; status: number; json: any }> {
  const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok && json.ok !== false, status: res.status, json }
}

function useAction() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  async function run(fn: () => Promise<{ ok: boolean; json: any }>, okText: (j: any) => string) {
    setBusy(true)
    setMsg(null)
    try {
      const r = await fn()
      setMsg(r.ok ? { kind: 'ok', text: okText(r.json) } : { kind: 'err', text: r.json?.error ?? r.json?.summary?.error ?? 'Request failed' })
      if (r.ok) router.refresh()
    } catch {
      setMsg({ kind: 'err', text: 'Network error' })
    } finally {
      setBusy(false)
    }
  }
  return { busy, msg, run }
}

const btn = 'rounded bg-ink px-4 py-2 text-sm text-white disabled:opacity-50'
const btnSm = 'rounded border border-ivory-k px-3 py-1 text-xs text-ink hover:bg-ivory disabled:opacity-50'
const input = 'w-full rounded border border-ivory-k px-3 py-2 text-sm'

function Msg({ m }: { m: { kind: 'ok' | 'err'; text: string } | null }) {
  if (!m) return null
  return <p role="status" className={`mt-2 text-xs ${m.kind === 'ok' ? 'text-emerald-700' : 'text-red-700'}`}>{m.text}</p>
}

export function CrawlButton() {
  const { busy, msg, run } = useAction()
  return (
    <div>
      <button className={btn} disabled={busy} onClick={() => run(() => call('POST', '/api/admin/seo/crawl'), (j) => `Crawl ${j.summary.status.toLowerCase()}: ${j.summary.pagesFetched} pages, score ${j.summary.healthScore}, ${j.summary.newIssues} new / ${j.summary.resolvedIssues} resolved issues.`)}>
        {busy ? 'Crawling… (up to a minute)' : 'Run crawl now'}
      </button>
      <Msg m={msg} />
    </div>
  )
}

export function KeywordForm() {
  const { busy, msg, run } = useAction()
  const [text, setText] = useState('')
  const [target, setTarget] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    run(() => call('POST', '/api/admin/seo/keywords', { keywords: text, targetUrl: target || undefined }), (j) => `${j.added} keyword(s) added.`).then(() => setText(''))
  }
  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea className={input} rows={3} placeholder="One keyword per line, e.g. handmade wool rugs exporter" value={text} onChange={(e) => setText(e.target.value)} maxLength={5000} />
      <input className={input} placeholder="Target page URL (optional)" value={target} onChange={(e) => setTarget(e.target.value)} maxLength={500} />
      <button className={btn} disabled={busy || !text.trim()}>Add keywords</button>
      <Msg m={msg} />
    </form>
  )
}

export function DeleteButton({ url, id, label = 'Remove' }: { url: string; id: string; label?: string }) {
  const { busy, msg, run } = useAction()
  return (
    <span>
      <button className={btnSm} disabled={busy} onClick={() => run(() => call('DELETE', url, { id }), () => 'Removed')}>{label}</button>
      {msg?.kind === 'err' && <Msg m={msg} />}
    </span>
  )
}

export function CompetitorForm() {
  const { busy, msg, run } = useAction()
  const [domain, setDomain] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    run(() => call('POST', '/api/admin/seo/competitors', { domain }), (j) => (j.created ? `Added ${j.domain}.` : `${j.domain} is already tracked.`)).then(() => setDomain(''))
  }
  return (
    <form onSubmit={submit} className="flex flex-wrap items-start gap-2">
      <input className={`${input} max-w-xs`} placeholder="competitor-domain.com" value={domain} onChange={(e) => setDomain(e.target.value)} maxLength={253} />
      <button className={btn} disabled={busy || !domain.trim()}>Add competitor</button>
      <Msg m={msg} />
    </form>
  )
}

export function SnapshotButton({ id }: { id: string }) {
  const { busy, msg, run } = useAction()
  return (
    <span>
      <button className={btnSm} disabled={busy} onClick={() => run(() => call('POST', '/api/admin/seo/competitors', { snapshotId: id }), (j) => `Snapshot saved (HTTP ${j.snapshot.httpStatus ?? 'n/a'}).`)}>{busy ? 'Fetching…' : 'Refresh snapshot'}</button>
      <Msg m={msg} />
    </span>
  )
}

export function DecisionControls({ id, tier }: { id: string; tier: string }) {
  const { busy, msg, run } = useAction()
  const [note, setNote] = useState('')
  const decide = (decision: 'APPROVE' | 'REJECT' | 'DEFER') => run(() => call('POST', `/api/admin/seo/recommendations/${id}`, { decision, note }), (j) => `Recorded: ${j.status}. No change was made to the website.`)
  return (
    <div className="mt-3 space-y-2">
      <input className={input} placeholder="Decision note (required to reject)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
      <div className="flex flex-wrap gap-2">
        <button className={btnSm} disabled={busy} onClick={() => decide('APPROVE')} title={tier === 'HIGH_IMPACT' ? 'High-impact: SEO owners only' : ''}>Approve</button>
        <button className={btnSm} disabled={busy || !note.trim()} onClick={() => decide('REJECT')}>Reject</button>
        <button className={btnSm} disabled={busy} onClick={() => decide('DEFER')}>Defer</button>
      </div>
      <Msg m={msg} />
    </div>
  )
}

export function PageSpeedForm({ defaultUrl }: { defaultUrl: string }) {
  const { busy, msg, run } = useAction()
  const [url, setUrl] = useState(defaultUrl)
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile')
  return (
    <form onSubmit={(e) => { e.preventDefault(); run(() => call('POST', '/api/admin/seo/pagespeed', { url, strategy }), (j) => `Measured: performance ${j.metrics?.perfScore ?? 'n/a'}.`) }} className="flex flex-wrap items-start gap-2">
      <input className={`${input} max-w-md`} value={url} onChange={(e) => setUrl(e.target.value)} maxLength={500} />
      <select className="rounded border border-ivory-k px-2 py-2 text-sm" value={strategy} onChange={(e) => setStrategy(e.target.value as 'mobile' | 'desktop')}>
        <option value="mobile">Mobile</option>
        <option value="desktop">Desktop</option>
      </select>
      <button className={btn} disabled={busy || !url}>{busy ? 'Measuring…' : 'Measure'}</button>
      <Msg m={msg} />
    </form>
  )
}
