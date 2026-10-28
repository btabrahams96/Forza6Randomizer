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
  useStore.setState({ ready: false, profiles: [], activeId: null, entries: [], settings: null, lastRoll: {} })
})

test('first launch asks who is playing; picking Kyle loads his garage', async () => {
  render(<App />)
  await userEvent.click(await screen.findByRole('button', { name: /^Kyle, 193 cars/ }))
  expect(await screen.findByRole('heading', { name: 'Roll' })).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument()
  expect(await screen.findByText('193 matching cars')).toBeInTheDocument()
  expect((await listProfiles()).map((p) => p.name)).toEqual(['Kyle'])
})

test('someone else can start with their own name and an empty garage', async () => {
  render(<App />)
  await userEvent.click(await screen.findByRole('button', { name: 'Someone else' }))
  await userEvent.type(screen.getByLabelText('Your name'), 'Sam')
  await userEvent.click(screen.getByRole('button', { name: 'Start' }))
  expect(await screen.findByRole('heading', { name: 'Roll' })).toBeInTheDocument()
  expect(await screen.findByText('Your garage is empty.')).toBeInTheDocument()
})

test('a double tap on a name makes one profile', async () => {
  render(<App />)
  await userEvent.dblClick(await screen.findByRole('button', { name: /^Bryton, 277 cars/ }))
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
