'use client'

import { useRef, useState } from 'react'

type MediaItem = { id: string; url: string; caption: string | null; isHero: boolean }

type Props = {
  target: { kind: 'stage'; stageId: string } | { kind: 'journey'; journeyId: string }
  media: MediaItem[]
  onChange: () => void
  allowMultiple?: boolean
}

/** Drag-drop + <input type="file"> fallback (the drop zone alone is not
 * keyboard-operable) media uploader, shared between stage galleries and
 * the single journey cover photo — same widget, parameterized by target,
 * per docs/CRAFTTRACK-PRODUCT-DESIGN.md §6. v1's UI surface deliberately
 * narrow: file, hero toggle, caption only — title/altText/tags/imageType
 * exist in the schema but aren't exposed here. */
export default function MediaUploadPanel({ target, media, onChange, allowMultiple = true }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const uploadUrl =
    target.kind === 'stage'
      ? `/api/admin/crafttrack/stages/${target.stageId}/media`
      : `/api/admin/crafttrack/journeys/${target.journeyId}/cover`

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).slice(0, allowMultiple ? files.length : 1)
    if (list.length === 0) return

    setUploading(true)
    setError(null)

    try {
      for (const file of list) {
        const body = new FormData()
        body.append('file', file)
        const res = await fetch(uploadUrl, { method: 'POST', body })
        const data = (await res.json()) as { ok: boolean; error?: string }
        if (!res.ok || !data.ok) {
          setError(data.error ?? 'Could not upload the image.')
          break
        }
      }
      onChange()
    } catch {
      setError('Could not upload the image.')
    } finally {
      setUploading(false)
    }
  }

  async function updateMedia(mediaId: string, patch: Partial<{ caption: string; isHero: boolean }>) {
    await fetch(`/api/admin/crafttrack/media/${mediaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    onChange()
  }

  async function deleteMedia(mediaId: string) {
    if (!confirm('Remove this image?')) return
    await fetch(`/api/admin/crafttrack/media/${mediaId}`, { method: 'DELETE' })
    onChange()
  }

  return (
    <div>
      {error && (
        <p role="alert" className="text-sm text-red-600 mb-3">
          {error}
        </p>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
        }}
        className={`border border-dashed rounded-sm p-6 text-center mb-5 transition-colors ${
          dragOver ? 'border-gold bg-ivory' : 'border-ivory-k'
        }`}
      >
        <p className="text-sm text-ink-m mb-0">
          Drag images here or{' '}
          <button type="button" onClick={() => inputRef.current?.click()} className="text-ink underline underline-offset-4">
            browse files
          </button>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={allowMultiple}
          aria-label="Upload image"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>
      <div aria-live="polite" className="sr-only">
        {uploading ? 'Uploading…' : ''}
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="border border-ivory-k rounded-sm overflow-hidden">
              <div className="relative aspect-[4/3] bg-ivory-d">
                {/* eslint-disable-next-line @next/next/no-img-element -- Blob URLs aren't a configured next/image remote domain */}
                <img src={item.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => updateMedia(item.id, { isHero: !item.isHero })}
                  aria-pressed={item.isHero}
                  aria-label={item.isHero ? 'Remove as hero image' : 'Set as hero image'}
                  className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-2xs ${
                    item.isHero ? 'bg-gold text-ink' : 'bg-white/90 text-ink-m'
                  }`}
                >
                  {item.isHero ? '★ Hero' : '☆ Hero'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteMedia(item.id)}
                  aria-label="Remove image"
                  className="absolute top-2 right-2 rounded-full bg-white/90 text-ink-m w-6 h-6 text-xs leading-6"
                >
                  ×
                </button>
              </div>
              <input
                defaultValue={item.caption ?? ''}
                onBlur={(e) => updateMedia(item.id, { caption: e.target.value })}
                placeholder="Caption"
                aria-label="Image caption"
                className="w-full text-2xs px-2 py-1.5 border-0 outline-none focus:ring-2 focus:ring-gold/30"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
