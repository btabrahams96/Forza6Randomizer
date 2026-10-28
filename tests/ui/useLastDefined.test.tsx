import { test, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLastDefined } from '../../src/ui/useLastDefined'

test('keeps showing the last value while a sheet closes', () => {
  const { result, rerender } = renderHook(({ v }) => useLastDefined(v), { initialProps: { v: null as string | null } })
  expect(result.current).toBeNull()
  rerender({ v: 'nsx' })
  expect(result.current).toBe('nsx')
  rerender({ v: null })
  expect(result.current).toBe('nsx')
  rerender({ v: 'supra' })
  expect(result.current).toBe('supra')
})
