'use client'

import { useEffect, useState } from 'react'
import FloatingCraftTrackButton from './FloatingCraftTrackButton'
import CraftTrackModal from './CraftTrackModal'
import { CRAFTTRACK_OPEN_EVENT } from '@/lib/crafttrack/events'

export default function CraftTrackLauncher() {
  const [open, setOpen] = useState(false)

  // Lets other UI (e.g. TARA's "Track My Order" quick action) open CraftTrack
  // without prop-drilling or a shared context.
  useEffect(() => {
    const openFromEvent = () => setOpen(true)
    window.addEventListener(CRAFTTRACK_OPEN_EVENT, openFromEvent)
    return () => window.removeEventListener(CRAFTTRACK_OPEN_EVENT, openFromEvent)
  }, [])

  return (
    <>
      <FloatingCraftTrackButton onClick={() => setOpen(true)} />
      <CraftTrackModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
