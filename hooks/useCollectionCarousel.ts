'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type Options = {
  intervalMs?: number
  autoplay?:  boolean
}

export function useCollectionCarousel(
  count: number,
  { intervalMs = 2000, autoplay = true }: Options = {},
) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused]   = useState(false)
  const intervalRef           = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback(
    (n: number) => {
      if (count <= 0) return
      setCurrent(((n % count) + count) % count)
    },
    [count],
  )

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    if (!autoplay || count <= 1 || paused) return
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % count)
    }, intervalMs)
  }, [autoplay, count, intervalMs, paused, clearTimer])

  // Restart timer when slide changes manually or on mount
  useEffect(() => {
    startTimer()
    return clearTimer
  }, [current, startTimer, clearTimer])

  // Pause when tab hidden (matches HTML visibility behaviour)
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return {
    current,
    goTo,
    next,
    prev,
    pause:  () => setPaused(true),
    resume: () => setPaused(false),
  }
}
