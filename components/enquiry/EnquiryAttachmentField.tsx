'use client'

import { useCallback, useRef, useState } from 'react'
import {
  ENQUIRY_FILE_ACCEPT,
  ENQUIRY_MAX_FILE_BYTES,
  enquiryAttachmentError,
} from '@/lib/enquiry-form'

type Props = {
  file: File | null
  onFileChange: (file: File | null) => void
  error?: string | null
}

export default function EnquiryAttachmentField({ file, onFileChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleFile = useCallback(
    (candidate: File | null) => {
      setLocalError(null)
      if (!candidate) {
        onFileChange(null)
        return
      }
      const validationError = enquiryAttachmentError(candidate)
      if (validationError) {
        setLocalError(validationError)
        onFileChange(null)
        if (inputRef.current) inputRef.current.value = ''
        return
      }
      onFileChange(candidate)
    },
    [onFileChange],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      handleFile(e.dataTransfer.files[0] ?? null)
    },
    [handleFile],
  )

  const displayError = error ?? localError

  return (
    <div>
      <label
        className="block text-[14px] tracking-[0.24em] uppercase mb-1.5 font-medium"
        style={{ color: 'var(--gd)' }}
      >
        Attachment <span className="normal-case tracking-normal opacity-50">(Optional)</span>
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="relative border border-dashed cursor-pointer transition-all duration-300 flex items-center gap-3 py-3.5 px-4 enquiry-attachment-zone"
        style={{
          borderColor: dragging ? 'rgba(192,155,74,0.5)' : 'rgba(255,255,255,0.12)',
          background: dragging ? 'rgba(192,155,74,0.06)' : 'rgba(255,255,255,0.02)',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ENQUIRY_FILE_ACCEPT}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(192,155,74,0.6)"
          strokeWidth="1.2"
          className="flex-shrink-0"
        >
          <path
            d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="min-w-0 text-left">
          {file ? (
            <>
              <p className="text-[17px] font-light truncate" style={{ color: 'var(--gp)' }}>
                {file.name}
              </p>
              <p className="text-[15px]" style={{ color: 'rgba(255,255,255,0.32)' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB · tap to replace
              </p>
            </>
          ) : (
            <>
              <p className="text-[14px] font-light leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Upload floor plans, BOQ, drawings, reference images or specifications
              </p>
              <p className="text-[15px] mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
                PDF, DOCX, JPG, PNG, ZIP · max {(ENQUIRY_MAX_FILE_BYTES / (1024 * 1024)).toFixed(0)} MB
              </p>
            </>
          )}
        </div>
      </div>
      {displayError && (
        <p className="enquiry-field-error mt-1.5 text-[16px] font-light" role="alert">
          {displayError}
        </p>
      )}
    </div>
  )
}
