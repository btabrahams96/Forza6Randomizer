import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App'

test('first launch asks for a name, then opens on Roll', async () => {
  render(<App />)
  await userEvent.type(await screen.findByLabelText('Your name'), 'Bryton')
  await userEvent.click(screen.getByRole('button', { name: 'Start' }))
  expect(await screen.findByRole('heading', { name: 'Roll' })).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument()
})
