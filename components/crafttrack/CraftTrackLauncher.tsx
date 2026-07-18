'use client'

import { useState } from 'react'
import FloatingCraftTrackButton from './FloatingCraftTrackButton'
import CraftTrackModal from './CraftTrackModal'

export default function CraftTrackLauncher() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <FloatingCraftTrackButton onClick={() => setOpen(true)} />
      <CraftTrackModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
