'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import AdminTextField from '@/components/crafttrack/admin/AdminTextField'
import AdminSelect from '@/components/crafttrack/admin/AdminSelect'
import StatusBadge from '@/components/crafttrack/admin/StatusBadge'
import MediaUploadPanel from '@/components/crafttrack/admin/MediaUploadPanel'
import PublishConfirmDialog from '@/components/crafttrack/admin/PublishConfirmDialog'

type StageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE'
type MediaItem = { id: string; url: string; caption: string | null; isHero: boolean; role: string; stageId: string | null }
type StageItem = {
  id: string
  sequence: number
  draftName: string
  draftMessage: string | null
  draftStatus: StageStatus
  publishedName: string | null
  publishedStatus: StageStatus | null
  publishedAt: string | null
  media: MediaItem[]
}
type MessageItem = { id: string; body: string; authorType: string; createdAt: string }
type NotificationItem = { id: string; type: string; channel: string; recipientEmail: string; sentAt: string }
type JourneyData = {
  id: string
  productName: string
  productSlug: string | null
  completedAt: string | null
  currentStage: { id: string } | null
  journeyTemplate: { name: string }
  order: { orderNumber: string; customer: { name: string; email: string } }
  media: MediaItem[]
  stages: StageItem[]
  messages: MessageItem[]
  notifications: NotificationItem[]
}

type Tab = 'stages' | 'messages' | 'notifications'
const TABS: { id: Tab; label: string }[] = [
  { id: 'stages', label: 'Stages' },
  { id: 'messages', label: 'Messages' },
  { id: 'notifications', label: 'Notifications' },
]

export default function JourneyWorkspace({ journeyId }: { journeyId: string }) {
  const [journey, setJourney] = useState<JourneyData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('stages')
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/crafttrack/journeys/${journeyId}`)
      const data = (await res.json()) as { ok: boolean; error?: string; journey?: JourneyData }
      if (!res.ok || !data.ok || !data.journey) {
        setLoadError(data.error ?? 'Could not load this journey.')
        return
      }
      setJourney(data.journey)
      setLoadError(null)
      setSelectedStageId((prev) => prev ?? data.journey!.stages[0]?.id ?? null)
    } catch {
      setLoadError('Could not load this journey.')
    }
  }, [journeyId])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (loadError) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {loadError}
      </p>
    )
  }

  if (!journey) {
    return (
      <div>
        <div className="w-24 h-24 rounded-sm bg-ivory-d animate-pulse" />
        <p className="sr-only" aria-live="polite">
          Loading journey…
        </p>
      </div>
    )
  }

  const cover = journey.media.find((m) => m.role === 'COVER') ?? null
  const selectedStage = journey.stages.find((s) => s.id === selectedStageId) ?? journey.stages[0] ?? null

  return (
    <div>
      <JourneyHeader journey={journey} cover={cover} onCoverChange={refresh} />

      <div role="tablist" aria-label="Journey sections" className="flex gap-1 border-b border-ivory-k mt-8 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => {
              const idx = TABS.findIndex((x) => x.id === tab)
              if (e.key === 'ArrowRight') setTab(TABS[(idx + 1) % TABS.length].id)
              if (e.key === 'ArrowLeft') setTab(TABS[(idx - 1 + TABS.length) % TABS.length].id)
            }}
            className={`px-4 py-2.5 text-sm -mb-px border-b-2 focus-visible:ring-2 focus-visible:ring-gold/50 rounded-t-sm ${
              tab === t.id ? 'border-gold text-ink' : 'border-transparent text-ink-m'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="panel-stages" aria-labelledby="tab-stages" hidden={tab !== 'stages'}>
        <StagesPanel
          journey={journey}
          selectedStage={selectedStage}
          onSelectStage={setSelectedStageId}
          onChange={refresh}
        />
      </div>

      <div role="tabpanel" id="panel-messages" aria-labelledby="tab-messages" hidden={tab !== 'messages'}>
        <MessagesPanel journeyId={journeyId} messages={journey.messages} onChange={refresh} />
      </div>

      <div role="tabpanel" id="panel-notifications" aria-labelledby="tab-notifications" hidden={tab !== 'notifications'}>
        <NotificationsPanel notifications={journey.notifications} />
      </div>
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────

function JourneyHeader({
  journey,
  cover,
  onCoverChange,
}: {
  journey: JourneyData
  cover: MediaItem | null
  onCoverChange: () => void
}) {
  const [editingCover, setEditingCover] = useState(false)

  return (
    <div className="flex gap-6 items-start">
      <div className="w-28 h-28 flex-shrink-0 bg-ivory-d rounded-sm overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- Blob URLs aren't a configured next/image remote domain
          <img src={cover.url} alt="" className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="flex-1">
        <h1 className="font-display text-2xl text-ink mb-1">{journey.productName}</h1>
        <p className="text-sm text-ink-m mb-1">
          {journey.order.orderNumber} · {journey.order.customer.name} · {journey.journeyTemplate.name}
        </p>
        {journey.currentStage ? (
          <p className="text-sm text-ink-s">
            Current stage:{' '}
            {journey.stages.find((s) => s.id === journey.currentStage!.id)?.publishedName ?? '—'}
          </p>
        ) : (
          <p className="text-2xs text-ink-m">No current stage yet — publish a stage to set one.</p>
        )}
        <div className="flex items-center gap-4 mt-3">
          <button
            type="button"
            onClick={() => setEditingCover((v) => !v)}
            className="text-2xs text-ink-m underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
          >
            {editingCover ? 'Close' : cover ? 'Change cover photo' : 'Add cover photo'}
          </button>
          <Link
            href={`/admin/crafttrack/journeys/${journey.id}/preview`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xs text-gold-d underline underline-offset-4"
          >
            Preview customer experience ↗
          </Link>
        </div>
        {editingCover && (
          <div className="mt-4 max-w-xs">
            <MediaUploadPanel
              target={{ kind: 'journey', journeyId: journey.id }}
              media={cover ? [{ id: cover.id, url: cover.url, caption: cover.caption, isHero: cover.isHero }] : []}
              onChange={() => {
                onCoverChange()
                setEditingCover(false)
              }}
              allowMultiple={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Stages panel ────────────────────────────────────────────────────────

function StagesPanel({
  journey,
  selectedStage,
  onSelectStage,
  onChange,
}: {
  journey: JourneyData
  selectedStage: StageItem | null
  onSelectStage: (id: string) => void
  onChange: () => void
}) {
  if (!selectedStage) return <p className="text-sm text-ink-m">This journey has no stages.</p>

  return (
    <div className="flex gap-8">
      <ol className="w-56 flex-shrink-0 flex flex-col gap-1">
        {journey.stages.map((stage) => (
          <li key={stage.id}>
            <button
              type="button"
              onClick={() => onSelectStage(stage.id)}
              aria-current={stage.id === selectedStage.id ? 'true' : undefined}
              className={`w-full text-left px-3 py-2.5 rounded-sm text-sm flex items-center justify-between gap-2 focus-visible:ring-2 focus-visible:ring-gold/50 ${
                stage.id === selectedStage.id ? 'bg-ivory-d text-ink' : 'text-ink-s hover:bg-ivory'
              }`}
            >
              <span>
                {stage.sequence}. {stage.draftName}
              </span>
              {stage.publishedAt ? (
                <span className="text-2xs text-ink-m">Live</span>
              ) : (
                <span className="text-2xs text-ink-l">Draft</span>
              )}
            </button>
          </li>
        ))}
      </ol>
      <div className="flex-1">
        <StageEditor
          key={selectedStage.id}
          journeyId={journey.id}
          stage={selectedStage}
          isCurrentStage={journey.currentStage?.id === selectedStage.id}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

function StageEditor({
  journeyId,
  stage,
  isCurrentStage,
  onChange,
}: {
  journeyId: string
  stage: StageItem
  isCurrentStage: boolean
  onChange: () => void
}) {
  const [draftMessage, setDraftMessage] = useState(stage.draftMessage ?? '')
  const [draftStatus, setDraftStatus] = useState<StageStatus>(stage.draftStatus)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [savedAnnouncement, setSavedAnnouncement] = useState('')
  const [error, setError] = useState<string | null>(null)

  const dirty = draftMessage !== (stage.draftMessage ?? '') || draftStatus !== stage.draftStatus

  async function saveDraft() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/crafttrack/stages/${stage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftName: stage.draftName, draftMessage, draftStatus }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Could not save the draft.')
        return
      }
      setSavedAnnouncement('Draft saved')
      onChange()
    } catch {
      setError('Could not save the draft.')
    } finally {
      setSaving(false)
    }
  }

  async function publish() {
    setPublishing(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/crafttrack/stages/${stage.id}/publish`, { method: 'POST' })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Could not publish this stage.')
        return
      }
      setConfirmOpen(false)
      onChange()
    } catch {
      setError('Could not publish this stage.')
    } finally {
      setPublishing(false)
    }
  }

  async function setAsCurrent() {
    setError(null)
    const res = await fetch(`/api/admin/crafttrack/journeys/${journeyId}/current-stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageId: stage.id }),
    })
    const data = (await res.json()) as { ok: boolean; error?: string }
    if (!res.ok || !data.ok) {
      setError(data.error ?? 'Could not set this as the current stage.')
      return
    }
    onChange()
  }

  return (
    <div>
      {error && (
        <p role="alert" className="text-sm text-red-600 mb-4">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-xl text-ink">{stage.draftName}</h2>
        {stage.publishedAt && stage.publishedStatus && <StatusBadge status={stage.publishedStatus} />}
      </div>
      <p className="text-2xs text-ink-m mb-6">
        {stage.publishedAt ? `Published ${new Date(stage.publishedAt).toLocaleDateString('en-IN')}` : 'Not yet published'}
        {isCurrentStage && ' · Current stage'}
      </p>

      <AdminTextField
        label="Message to customer"
        name={`message-${stage.id}`}
        value={draftMessage}
        onChange={(e) => setDraftMessage(e.target.value)}
        multiline
        rows={4}
      />

      <div className="mt-5">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-2xs text-ink-l underline underline-offset-4"
        >
          {showAdvanced ? '− Hide advanced fields' : '+ Advanced fields'}
        </button>
        {showAdvanced && (
          <div className="mt-3 max-w-xs">
            <AdminSelect
              label="Status"
              name={`status-${stage.id}`}
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value as StageStatus)}
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'IN_PROGRESS', label: 'In progress' },
                { value: 'COMPLETE', label: 'Complete' },
              ]}
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-2xs uppercase tracking-wide text-ink-m mb-3">Images</h3>
        <MediaUploadPanel
          target={{ kind: 'stage', stageId: stage.id }}
          media={stage.media}
          onChange={onChange}
        />
      </div>

      <div className="flex items-center gap-5 mt-8">
        <button
          type="button"
          onClick={saveDraft}
          disabled={saving || !dirty}
          aria-busy={saving}
          className="text-sm text-ink-m underline underline-offset-4 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
        >
          {saving ? 'Saving…' : 'Save draft'}
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="bg-ink text-gold-p rounded-sm px-5 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-gold/50"
        >
          Publish changes
        </button>
        {stage.publishedAt && !isCurrentStage && (
          <button
            type="button"
            onClick={setAsCurrent}
            className="text-sm text-ink-m underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
          >
            Set as current stage
          </button>
        )}
        <span aria-live="polite" className="sr-only">
          {savedAnnouncement}
        </span>
      </div>

      <PublishConfirmDialog
        open={confirmOpen}
        stageName={stage.draftName}
        busy={publishing}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={publish}
      />
    </div>
  )
}

// ─── Messages panel ──────────────────────────────────────────────────────

function MessagesPanel({
  journeyId,
  messages,
  onChange,
}: {
  journeyId: string
  messages: MessageItem[]
  onChange: () => void
}) {
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function post() {
    if (!body.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/crafttrack/journeys/${journeyId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Could not post the message.')
        return
      }
      setBody('')
      onChange()
    } catch {
      setError('Could not post the message.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-lg">
      {error && (
        <p role="alert" className="text-sm text-red-600 mb-3">
          {error}
        </p>
      )}
      <AdminTextField label="New message" name="new-message" value={body} onChange={(e) => setBody(e.target.value)} multiline rows={3} />
      <button
        type="button"
        onClick={post}
        disabled={busy || !body.trim()}
        aria-busy={busy}
        className="mt-3 bg-ink text-gold-p rounded-sm px-4 py-2 text-sm disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        {busy ? 'Posting…' : 'Post message'}
      </button>

      <ul className="mt-8 flex flex-col gap-4">
        {messages.length === 0 && <p className="text-sm text-ink-m">No messages yet.</p>}
        {messages.map((m) => (
          <li key={m.id} className="border-b border-ivory-d pb-4">
            <p className="text-sm text-ink-s">{m.body}</p>
            <p className="text-2xs text-ink-m mt-1">{new Date(m.createdAt).toLocaleString('en-IN')}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Notifications panel ─────────────────────────────────────────────────

function NotificationsPanel({ notifications }: { notifications: NotificationItem[] }) {
  if (notifications.length === 0) {
    return <p className="text-sm text-ink-m">No notifications sent yet.</p>
  }

  return (
    <table className="w-full max-w-lg text-sm">
      <caption className="sr-only">Notification history</caption>
      <thead>
        <tr className="border-b border-ivory-k text-left text-2xs uppercase tracking-wide text-ink-m">
          <th scope="col" className="py-2 font-normal">Type</th>
          <th scope="col" className="py-2 font-normal">Channel</th>
          <th scope="col" className="py-2 font-normal">Recipient</th>
          <th scope="col" className="py-2 font-normal">Sent</th>
        </tr>
      </thead>
      <tbody>
        {notifications.map((n) => (
          <tr key={n.id} className="border-b border-ivory-d">
            <td className="py-2.5 text-ink">{n.type.replace(/_/g, ' ').toLowerCase()}</td>
            <td className="py-2.5 text-ink-s">{n.channel}</td>
            <td className="py-2.5 text-ink-s">{n.recipientEmail}</td>
            <td className="py-2.5 text-ink-m text-2xs">{new Date(n.sentAt).toLocaleString('en-IN')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
