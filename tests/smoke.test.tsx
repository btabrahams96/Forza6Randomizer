import { test, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { IDBFactory } from 'fake-indexeddb'
import * as db from '../src/storage/db'
import { useStore } from '../src/state/store'
import { listProfiles } from '../src/storage/db'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App'

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  db.resetConnection()
  useStore.setState({ ready: false, profiles: [], activeId: null, entries: [], settings: null })
})

test('first launch asks for a name, then opens on Roll', async () => {
  render(<App />)
  await userEvent.type(await screen.findByLabelText('Your name'), 'Bryton')
  await userEvent.click(screen.getByRole('button', { name: 'Start' }))
  expect(await screen.findByRole('heading', { name: 'Roll' })).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument()
})

test('a double tap on Start makes one profile', async () => {
  render(<App />)
  await userEvent.type(await screen.findByLabelText('Your name'), 'Bryton')
  await userEvent.dblClick(screen.getByRole('button', { name: 'Start' }))
  await screen.findByRole('heading', { name: 'Roll' })
  expect(await listProfiles()).toHaveLength(1)
})

test('storage that will not open shows a way out, not a blank screen', async () => {
  globalThis.indexedDB = { open() { throw new Error('blocked') } } as unknown as IDBFactory
  db.resetConnection()
  await act(async () => { render(<App />) })
  expect(await screen.findByText("Couldn't open your garage")).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
})
