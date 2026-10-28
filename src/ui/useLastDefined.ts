import { useRef } from 'react'

// Sheets animate out after their driving value goes null; render from the last
// real value so the content doesn't vanish mid-slide.
export function useLastDefined<T>(value: T | null | undefined): T | null {
  const last = useRef<T | null>(null)
  if (value !== null && value !== undefined) last.current = value
  return last.current
}
