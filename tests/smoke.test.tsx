import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/App'

test('app renders the Roll tab', () => {
  render(<App />)
  expect(screen.getAllByText('Roll').length).toBeGreaterThan(0)
})
