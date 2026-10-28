import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClassBadge } from '../../src/ui/ClassBadge'

test('shows the FH6 class for the PI', () => {
  render(<ClassBadge pi={901} />)
  expect(screen.getByText('R')).toBeInTheDocument()
  expect(screen.getByText('901')).toBeInTheDocument()
})

test('A tops out at 700', () => {
  render(<ClassBadge pi={700} />)
  expect(screen.getByText('A')).toBeInTheDocument()
})

test('reads as one label for screen readers', () => {
  render(<ClassBadge pi={850} />)
  expect(screen.getByLabelText('Class S2, PI 850')).toBeInTheDocument()
})
