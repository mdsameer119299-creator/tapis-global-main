'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { EVENTS, trackEvent } from '@/lib/analytics'
import { captureAttribution } from '@/lib/attribution'
import { scoreLead } from '@/lib/lead-scoring'
import { submitEnquiry } from '@/lib/submit-enquiry'
import { TARA_CATEGORIES, TARA_MATERIALS, TARA_CONSTRUCTIONS, COMPANY_FACTS, TARA_GREETING } from '@/lib/tara/knowledge'

const NAVY = '#0e1b2e'
const NAVY_SOFT = '#14263d'
const GOLD = '#c9a24b'
const INK_ON_NAVY = '#e9eef5'

type CardKind = 'categories' | 'materials' | 'constructions' | null
type LeadMode = 'catalogue' | 'human' | null
interface Msg { id: number; role: 'tara' | 'user'; text: string; cards?: CardKind }
let uid = 0
const mk = (role: Msg['role'], text: string, cards: CardKind = null): Msg => ({ id: ++uid, role, text, cards })
const GREETING = `${TARA_GREETING} (I'm an AI assistant.)`
const initialMessages = () => [mk('tara', GREETING, 'categories')]

export default function Tara() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [aiOn, setAiOn] = useState<boolean | null>(null)
  const [leadMode, setLeadMode] = useState<LeadMode>(null)
  const [ctx, setCtx] = useState<{ categories: string[]; materials: string[]; constructions: string[]; handoffReason?: string }>({ categories: [], materials: [], constructions: [] })
  const scrollRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const requestId = useRef(0)
  const companyInfoShown = useRef(false)

  useEffect(() => {
    if (open && !initialized.current) { initialized.current = true; setMsgs(initialMessages()) }
  }, [open])
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [msgs, leadMode])

  function openWidget() { setOpen(true); trackEvent(EVENTS.taraOpen, { source: typeof window !== 'undefined' ? window.location.pathname : undefined }) }
  function closeWidget() { setOpen(false); trackEvent(EVENTS.taraClose) }
  function restart() {
    requestId.current += 1
    setBusy(false); setAiOn(null); setInput(''); setLeadMode(null)
    setCtx({ categories: [], materials: [], constructions: [] })
    companyInfoShown.current = false
    initialized.current = true
    setMsgs(initialMessages())
  }
  function pushTara(text: string, cards: CardKind = null) {
    setMsgs((m) => m.some((x) => x.role === 'tara' && x.text === text) ? m : [...m, mk('tara', text, cards)])
  }
  function addChoice(userText: string, taraText: string, cards: CardKind = null) {
    setMsgs((m) => [...m.map((x) => x.cards ? { ...x, cards: null } : x), mk('user', userText), mk('tara', taraText, cards)])
  }

  function chooseCategory(slug: string, name: string) {
    setCtx((c) => ({ ...c, categories: Array.from(new Set([...c.categories, slug])) }))
    trackEvent(EVENTS.taraCategorySelected, { category: slug })
    addChoice(name, `Great — ${name}. Which material or fibre are you considering? You can also tell me sizes, quantity and timeline.`, 'materials')
  }
  function chooseMaterial(id: string, name: string) {
    setCtx((c) => ({ ...c, materials: Array.from(new Set([...c.materials, id])) }))
    trackEvent(EVENTS.taraMaterialSelected, { material: id })
    const mat = TARA_MATERIALS.find((x) => x.id === id)
    addChoice(name, `${name} — ${mat?.notes ?? ''} Typical use: ${mat?.applications ?? ''} Would you like to compare constructions, or continue by telling me about your project?`, 'constructions')
  }
  function chooseConstruction(id: string, name: string) {
    setCtx((c) => ({ ...c, constructions: Array.from(new Set([...c.constructions, id])) }))
    const con = TARA_CONSTRUCTIONS.find((x) => x.id === id)
    addChoice(name, `${name} — ${con?.notes ?? ''} Tell me about the space, sizes, quantity, design direction or timeline and I can continue helping you.`)
  }

  function openLead(mode: Exclude<LeadMode, null>) {
    if (leadMode === mode) return
    setLeadMode(mode)
    const reason = mode === 'catalogue' ? 'catalogue' : 'human'
    setCtx((c) => ({ ...c, handoffReason: reason }))
    trackEvent(EVENTS.taraHandoffRequested, { source: reason })
    trackEvent(EVENTS.taraLeadCaptureStart)
  }
  function showCompanyInfo() {
    setLeadMode(null)
    if (companyInfoShown.current) return
    companyInfoShown.current = true
    pushTara(`${COMPANY_FACTS.identity} ${COMPANY_FACTS.locations} I can also answer general questions about our carpet and rug categories, materials and manufacturing knowledge.`)
  }

  async function send(text: string) {
    const q = text.trim()
    if (!q || busy) return
    setInput(''); setLeadMode(null); setBusy(true)
    const userMsg = mk('user', q)
    const historyBase = [...msgs, userMsg]
    setMsgs((m) => [...m.map((x) => x.cards ? { ...x, cards: null } : x), userMsg])
    trackEvent(EVENTS.taraMessageSent)
    const currentRequest = ++requestId.current
    try {
      const history = historyBase.filter((m) => m.text).slice(-10).map((m) => ({ role: m.role === 'tara' ? 'assistant' : 'user', content: m.text }))
      const res = await fetch('/api/tara', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: history }) })
      const data = (await res.json()) as { available?: boolean; reply?: string | null; handoffSuggested?: boolean }
      if (currentRequest !== requestId.current) return
      setAiOn(Boolean(data.available))
      if (data.available && data.reply) pushTara(data.reply)
      else pushTara('I can help you explore categories, materials and constructions. Pick an option below or continue asking questions.', 'categories')
    } catch {
      if (currentRequest === requestId.current) pushTara('I had trouble responding just now. You can continue browsing categories or try your question again.', 'categories')
    } finally {
      if (currentRequest === requestId.current) setBusy(false)
    }
  }

  if (!open) return <button onClick={openWidget} aria-label="Open TARA, the TAPIS AI Rug Advisor" style={{ position: 'fixed', left: 20, bottom: 20, zIndex: 700, background: NAVY, color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 999, padding: '12px 18px', fontSize: 15, fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,0.35)', cursor: 'pointer' }}><span aria-hidden style={{ marginRight: 8 }}>✦</span> Ask TARA</button>

  return (
    <div role="dialog" aria-label="TARA — TAPIS AI Rug Advisor" data-clarity-mask="true" style={{ position: 'fixed', left: 0, bottom: 0, zIndex: 800, width: 'min(400px, 100vw)', height: 'min(620px, 100dvh)', display: 'flex', flexDirection: 'column', background: NAVY, color: INK_ON_NAVY, boxShadow: '0 12px 48px rgba(0,0,0,0.5)', borderTopRightRadius: 14, borderRight: `1px solid ${NAVY_SOFT}`, margin: 12, maxWidth: 'calc(100vw - 24px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${NAVY_SOFT}` }}>
        <span aria-hidden style={{ color: GOLD, fontSize: 18 }}>✦</span><div style={{ flex: 1 }}><div style={{ fontWeight: 700, letterSpacing: 0.3 }}>TARA</div><div style={{ fontSize: 12, opacity: 0.7 }}>TAPIS AI Rug Advisor</div></div>
        <button onClick={restart} aria-label="Restart conversation" style={hdrBtn}>↺</button><button onClick={() => setOpen(false)} aria-label="Minimize" style={hdrBtn}>—</button><button onClick={closeWidget} aria-label="Close" style={hdrBtn}>✕</button>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m) => <div key={m.id}><div style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', marginLeft: m.role === 'user' ? 'auto' : 0, background: m.role === 'user' ? GOLD : NAVY_SOFT, color: m.role === 'user' ? NAVY : INK_ON_NAVY, padding: '9px 12px', borderRadius: 12, fontSize: 14.5, lineHeight: 1.5 }}>{m.text}</div>{m.cards === 'categories' && <CardGrid>{TARA_CATEGORIES.map((c) => <Card key={c.slug} img={c.image} label={c.name} onClick={() => chooseCategory(c.slug, c.name)} />)}</CardGrid>}{m.cards === 'materials' && <Chips>{TARA_MATERIALS.map((mm) => <Chip key={mm.id} label={`${mm.name} · ${mm.positioning}`} onClick={() => chooseMaterial(mm.id, mm.name)} />)}</Chips>}{m.cards === 'constructions' && <Chips>{TARA_CONSTRUCTIONS.map((cc) => <Chip key={cc.id} label={cc.name} onClick={() => chooseConstruction(cc.id, cc.name)} />)}</Chips>}</div>)}
        {busy && <div style={{ fontSize: 13, opacity: 0.6 }}>TARA is typing…</div>}
        {leadMode && <LeadForm mode={leadMode} ctx={ctx} onClose={() => setLeadMode(null)} onDone={() => setLeadMode(null)} />}
      </div>
      <div style={{ borderTop: `1px solid ${NAVY_SOFT}`, padding: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}><Chip label="Request catalogue" onClick={() => openLead('catalogue')} /><Chip label="Talk to the team" onClick={() => openLead('human')} /><Chip label="Company info" onClick={showCompanyInfo} /></div>
        <form onSubmit={(e) => { e.preventDefault(); send(input) }} style={{ display: 'flex', gap: 8 }}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about carpets, rugs, materials or projects…" aria-label="Message TARA" maxLength={2000} style={{ flex: 1, background: NAVY_SOFT, color: INK_ON_NAVY, border: 'none', borderRadius: 10, padding: '10px 12px', fontSize: 14 }} /><button type="submit" disabled={busy} aria-label="Send" style={{ background: GOLD, color: NAVY, border: 'none', borderRadius: 10, padding: '0 16px', fontWeight: 700, cursor: 'pointer' }}>→</button></form>
        {aiOn === false && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6 }}>Guided mode — you can keep browsing and chatting.</div>}
      </div>
    </div>
  )
}

const hdrBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: INK_ON_NAVY, fontSize: 16, cursor: 'pointer', opacity: 0.75, width: 28, height: 28 }
function CardGrid({ children }: { children: React.ReactNode }) { return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>{children}</div> }
function Card({ img, label, onClick }: { img: string; label: string; onClick: () => void }) { return <button onClick={onClick} style={{ background: NAVY_SOFT, border: `1px solid ${NAVY_SOFT}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', padding: 0, textAlign: 'left' }}><span style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '16/10' }}><Image src={img} alt={label} fill sizes="180px" style={{ objectFit: 'cover' }} /></span><span style={{ display: 'block', padding: '7px 9px', fontSize: 12.5, color: INK_ON_NAVY }}>{label}</span></button> }
function Chips({ children }: { children: React.ReactNode }) { return <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>{children}</div> }
function Chip({ label, onClick }: { label: string; onClick: () => void }) { return <button onClick={onClick} style={{ background: 'transparent', color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 999, padding: '6px 11px', fontSize: 12.5, cursor: 'pointer' }}>{label}</button> }

function LeadForm({ mode, ctx, onClose, onDone }: { mode: Exclude<LeadMode, null>; ctx: { categories: string[]; materials: string[]; constructions: string[]; handoffReason?: string }; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ name: '', email: '', country: '', mobile: '', buyerType: '' })
  const [err, setErr] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!f.name.trim() || !f.email.trim() || !f.country.trim() || !f.mobile.trim()) { setErr('Name, email, country and phone/WhatsApp are required.'); return }
    setErr(null); setState('sending'); trackEvent(EVENTS.taraLeadCaptureSubmit, { buyer_type: f.buyerType || undefined })
    const attribution = captureAttribution()
    const score = scoreLead({ businessEmail: f.email, buyerType: f.buyerType, productInterests: ctx.categories, materialInterests: ctx.materials, constructionInterests: ctx.constructions, handoffRequested: true, sourcePath: attribution.landing_page })
    const summary = [ctx.categories.length ? `Categories: ${ctx.categories.join(', ')}` : '', ctx.materials.length ? `Materials: ${ctx.materials.join(', ')}` : '', ctx.constructions.length ? `Constructions: ${ctx.constructions.join(', ')}` : '', `Request: ${mode}`].filter(Boolean).join(' | ')
    const fields: Record<string, string> = { name: f.name, email: f.email, mobile: f.mobile, country: f.country, buyerType: f.buyerType || 'Not specified', leadSource: 'TARA', taraSummary: summary || 'General enquiry', leadScore: String(score.score), leadTemperature: score.temperature, scoreReasons: score.reasons.join('; '), ...Object.fromEntries(Object.entries(attribution).map(([k, v]) => [k, String(v)])) }
    const res = await submitEnquiry('tara', fields)
    if (res.ok) { setState('done'); trackEvent(EVENTS.taraHandoffCompleted, { lead_temperature: score.temperature }); trackEvent(EVENTS.taraProjectQualified, { lead_temperature: score.temperature }) }
    else { setErr(res.error || 'Could not send. Please try again.'); setState('idle') }
  }
  if (state === 'done') return <div style={{ background: NAVY_SOFT, borderRadius: 12, padding: 14, fontSize: 14 }}>Thank you. Your details have been received. <button onClick={onDone} style={linkBtn}>Continue chatting</button></div>
  const inp: React.CSSProperties = { width: '100%', background: NAVY, color: INK_ON_NAVY, border: `1px solid ${NAVY_SOFT}`, borderRadius: 8, padding: '9px 10px', fontSize: 14, marginBottom: 8 }
  return <form onSubmit={submit} data-clarity-mask="true" style={{ background: NAVY_SOFT, borderRadius: 12, padding: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}><div style={{ fontSize: 13, opacity: 0.8 }}>{mode === 'catalogue' ? 'Request the TAPIS GLOBAL catalogue.' : 'Share your project details with the TAPIS GLOBAL team.'}</div><button type="button" onClick={onClose} aria-label="Back to chat" style={linkBtn}>Back to chat</button></div><input style={inp} placeholder="Full name*" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-label="Full name" /><input style={inp} placeholder="Business email*" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-label="Email" /><input style={inp} placeholder="Country / location*" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} aria-label="Country" /><input style={inp} placeholder="Phone / WhatsApp*" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} aria-label="Phone or WhatsApp" /><select style={inp} value={f.buyerType} onChange={(e) => setF({ ...f, buyerType: e.target.value })} aria-label="Buyer type"><option value="">What are you sourcing for? (optional)</option>{['Architect', 'Interior Designer', 'Hotel / Resort', 'Hospitality Procurement', 'Builder / Developer', 'Importer', 'Distributor', 'Wholesaler', 'Carpet Dealer', 'Furniture Retailer', 'Sourcing Company', 'OEM Buyer', 'Private Label Buyer', 'Institutional Buyer', 'Personal Project', 'Other'].map((b) => <option key={b} value={b}>{b}</option>)}</select>{err && <div style={{ color: '#f0a0a0', fontSize: 12.5, marginBottom: 8 }}>{err}</div>}<button type="submit" disabled={state === 'sending'} style={{ width: '100%', background: GOLD, color: NAVY, border: 'none', borderRadius: 8, padding: '10px', fontWeight: 700, cursor: 'pointer' }}>{state === 'sending' ? 'Sending…' : mode === 'catalogue' ? 'Request catalogue' : 'Send to TAPIS GLOBAL team'}</button><div style={{ fontSize: 11, opacity: 0.55, marginTop: 8 }}>By submitting you agree we may contact you about your enquiry.</div></form>
}
const linkBtn: React.CSSProperties = { background: 'transparent', color: GOLD, border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }
