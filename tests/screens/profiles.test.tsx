import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { screen, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfilesScreen } from '../../src/screens/ProfilesScreen'
import { useStore } from '../../src/state/store'
import { listEntries, listProfiles } from '../../src/storage/db'
import { freshStore, renderUi } from './helpers'

const kyle = readFileSync('seed/kyle-garage.json', 'utf8')
const file = (text: string, name = 'kyle-garage.json') => new File([text], name, { type: 'application/json' })

let brytonId: string
beforeEach(async () => {
  await freshStore('Bryton')
  brytonId = useStore.getState().activeId!
  await act(() => useStore.getState().addCars(['acura-nsx-type-s']))
})

describe('Profiles', () => {
  test('import as a new profile leaves the existing one alone', async () => {
    renderUi(<ProfilesScreen />)
    await userEvent.upload(await screen.findByLabelText('Import backup'), file(kyle))
    const sheet = await screen.findByRole('dialog', { name: 'Import Garage' })
    expect(within(sheet).getByRole('radio', { name: /New profile/ })).toBeChecked()
    expect(within(sheet).getByLabelText('Profile name')).toHaveValue('Kyle')
    await userEvent.click(within(sheet).getByRole('button', { name: 'Import 193 cars' }))
    expect(await screen.findByText(/Imported 193 cars/)).toBeInTheDocument()
    const profiles = await listProfiles()
    expect(profiles.map((p) => p.name)).toEqual(['Bryton', 'Kyle'])
    expect(await listEntries(profiles[1].id)).toHaveLength(193)
    expect(await listEntries(brytonId)).toHaveLength(1)
    expect(useStore.getState().activeId).toBe(profiles[1].id)
  })

  test('replacing a garage needs a second confirmation', async () => {
    renderUi(<ProfilesScreen />)
    await userEvent.upload(await screen.findByLabelText('Import backup'), file(kyle))
    const sheet = await screen.findByRole('dialog', { name: 'Import Garage' })
    await userEvent.click(within(sheet).getByRole('radio', { name: /Replace Bryton/ }))
    await userEvent.click(within(sheet).getByRole('button', { name: 'Import 193 cars' }))
    const confirm = await screen.findByRole('alertdialog', { name: "Replace Bryton's 1 car?" })
    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }))
    expect(await listEntries(brytonId)).toHaveLength(1)

    await userEvent.click(within(screen.getByRole('dialog', { name: 'Import Garage' })).getByRole('button', { name: 'Import 193 cars' }))
    await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Replace garage' }))
    expect(await screen.findByText(/Imported 193 cars/)).toBeInTheDocument()
    expect(await listEntries(brytonId)).toHaveLength(193)
    expect(await listProfiles()).toHaveLength(1)
  })

  test('a file that is not a backup changes nothing', async () => {
    renderUi(<ProfilesScreen />)
    await userEvent.upload(await screen.findByLabelText('Import backup'), file('not json', 'photo.json'))
    expect(await screen.findByText("This file isn't a garage backup.")).toBeInTheDocument()
    expect(await listProfiles()).toHaveLength(1)
    expect(await listEntries(brytonId)).toHaveLength(1)
  })

  test('switching profile changes the active garage', async () => {
    await act(() => useStore.getState().createProfile('Kyle').then(() => {}))
    renderUi(<ProfilesScreen />)
    await userEvent.click(await screen.findByRole('radio', { name: /Bryton/ }))
    expect(useStore.getState().activeId).toBe(brytonId)
    expect(screen.getByRole('radio', { name: /Bryton, 1 car/ })).toBeChecked()
  })

  test('deleting a profile asks first and names the car count', async () => {
    await act(() => useStore.getState().createProfile('Kyle').then(() => {}))
    renderUi(<ProfilesScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'Edit Bryton' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete profile' }))
    const confirm = await screen.findByRole('alertdialog', { name: 'Delete Bryton and 1 car?' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'Delete profile' }))
    expect((await listProfiles()).map((p) => p.name)).toEqual(['Kyle'])
  })

  test('new profile starts empty and becomes active', async () => {
    renderUi(<ProfilesScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'New profile' }))
    await userEvent.type(screen.getByLabelText('Profile name'), 'Kyle')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(await screen.findByRole('radio', { name: /Kyle, 0 cars/ })).toBeChecked()
  })
})

test('adds the other player with their garage', async () => {
  renderUi(<ProfilesScreen />)
  await userEvent.click(await screen.findByRole('button', { name: "Add Kyle's garage, 193 cars" }))
  expect(await screen.findByRole('radio', { name: /Kyle, 193 cars/ })).toBeChecked()
  expect(screen.queryByRole('button', { name: /Add Kyle's garage/ })).not.toBeInTheDocument()
  // A Bryton profile is already on this phone, so his garage isn't offered twice.
  expect(screen.queryByRole('button', { name: /Add Bryton's garage/ })).not.toBeInTheDocument()
})

describe('Export', () => {
  afterEach(() => {
    // @ts-expect-error test cleanup
    delete navigator.share
    // @ts-expect-error test cleanup
    delete navigator.canShare
  })

  test('opens the share sheet with the garage file', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { share, canShare: () => true })
    renderUi(<ProfilesScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'Edit Bryton' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Export 1 car' }))
    expect(share).toHaveBeenCalledTimes(1)
    const sent: File = share.mock.calls[0][0].files[0]
    expect(sent.name).toBe('bryton-garage.json')
    expect(JSON.parse(await sent.text()).entries).toHaveLength(1)
  })

  test('says so when the share sheet fails', async () => {
    const err = Object.assign(new Error('gesture'), { name: 'NotAllowedError' })
    Object.assign(navigator, { share: vi.fn().mockRejectedValue(err), canShare: () => true })
    renderUi(<ProfilesScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'Edit Bryton' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Export 1 car' }))
    expect(await screen.findByText(/Couldn't open the share sheet/)).toBeInTheDocument()
  })
})
