import { describe, test, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InstallHint } from '../../src/ui/InstallHint'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const setUA = (ua: string) => Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true })
const setStandalone = (v: boolean | undefined) => Object.defineProperty(navigator, 'standalone', { value: v, configurable: true })

describe('InstallHint', () => {
  const original = navigator.userAgent
  afterEach(() => {
    setUA(original)
    setStandalone(undefined)
  })

  test('tells iPhone Safari users to add the app to the Home Screen first', () => {
    setUA(IPHONE)
    setStandalone(false)
    render(<InstallHint />)
    expect(screen.getByText(/Add to Home Screen first/)).toBeInTheDocument()
  })

  test('stays hidden once installed', () => {
    setUA(IPHONE)
    setStandalone(true)
    render(<InstallHint />)
    expect(screen.queryByText(/Add to Home Screen/)).not.toBeInTheDocument()
  })

  test('stays hidden off iOS', () => {
    render(<InstallHint />)
    expect(screen.queryByText(/Add to Home Screen/)).not.toBeInTheDocument()
  })
})
