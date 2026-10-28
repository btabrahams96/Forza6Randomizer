import { useCallback, useRef, useState } from 'react'

// Ignore repeat taps while an async action is still running.
export function useBusy(): [boolean, (fn: () => Promise<unknown>) => Promise<void>] {
  const running = useRef(false)
  const [busy, setBusy] = useState(false)
  const run = useCallback(async (fn: () => Promise<unknown>) => {
    if (running.current) return
    running.current = true
    setBusy(true)
    try {
      await fn()
    } finally {
      running.current = false
      setBusy(false)
    }
  }, [])
  return [busy, run]
}
