import { describe, test, expect, beforeEach } from 'vitest'
import { screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GarageScreen } from '../../src/screens/GarageScreen'
import { useStore } from '../../src/state/store'
import { restoreEntry } from '../../src/storage/db'
import { freshStore, renderUi } from './helpers'

beforeEach(async () => {
  await freshStore()
})

const sectionHeading = (cls: string) => screen.queryByRole('heading', { name: new RegExp(`^Class ${cls}\\b`) })

describe('Garage', () => {
  test('empty garage offers to add cars', async () => {
    renderUi(<GarageScreen />)
    expect(await screen.findByRole('button', { name: 'Add your cars' })).toBeInTheDocument()
  })

  test('ticking a car you own adds a second copy', async () => {
    renderUi(<GarageScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'Add cars' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search all cars' }), 'Acura NSX Type S')
    await userEvent.click(await screen.findByRole('checkbox', { name: /Acura NSX Type S/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Add 1 car' }))
    expect(await screen.findAllByRole('button', { name: /^Edit Acura NSX Type S/ })).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Add cars' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search all cars' }), 'Acura NSX Type S')
    expect(await screen.findByText('In garage')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('checkbox', { name: /Acura NSX Type S/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Add another copy' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add 1 car' }))
    expect(await screen.findAllByRole('button', { name: /^Edit Acura NSX Type S/ })).toHaveLength(2)
  })

  test('ticking a car you own asks first; Cancel leaves it unticked', async () => {
    await act(() => useStore.getState().addCars(['acura-nsx-type-s']))
    renderUi(<GarageScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'Add cars' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search all cars' }), 'Acura NSX Type S')
    const row = await screen.findByRole('checkbox', { name: /Acura NSX Type S, .*in your garage/ })
    await userEvent.click(row)
    expect(screen.getByText('You already have this car. Add another copy?')).toBeInTheDocument()
    expect(row).not.toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel adding a copy' }))
    expect(screen.queryByText(/Add another copy\?/)).not.toBeInTheDocument()
    expect(row).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Select cars to add' })).toBeDisabled()

    // Tapping the row again while asked cancels; only "Add another copy" adds.
    await userEvent.click(row)
    await userEvent.click(row)
    expect(screen.queryByText(/Add another copy\?/)).not.toBeInTheDocument()
    expect(row).not.toBeChecked()
  })

  test('Show narrows Add Cars to owned or not-owned cars', async () => {
    await act(() => useStore.getState().addCars(['acura-nsx-type-s']))
    renderUi(<GarageScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'Add cars' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search all cars' }), 'Acura')
    await userEvent.click(screen.getByRole('radio', { name: 'Owned' }))
    expect(screen.getAllByRole('checkbox').map((c) => c.getAttribute('aria-label')?.split(',')[0])).toEqual(['Acura NSX Type S'])
    await userEvent.click(screen.getByRole('radio', { name: 'Not owned' }))
    const names = screen.getAllByRole('checkbox').map((c) => c.getAttribute('aria-label')?.split(',')[0])
    expect(names).not.toContain('Acura NSX Type S')
    expect(names.length).toBeGreaterThan(0)
  })

  test('a double tap on Add adds the cars once', async () => {
    renderUi(<GarageScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'Add cars' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search all cars' }), 'Acura NSX Type S')
    await userEvent.click(await screen.findByRole('checkbox', { name: /Acura NSX Type S/ }))
    await userEvent.dblClick(screen.getByRole('button', { name: 'Add 1 car' }))
    await screen.findAllByRole('button', { name: /^Edit Acura NSX Type S/ })
    expect(useStore.getState().entries).toHaveLength(1)
  })

  test('Add button is disabled until something is ticked', async () => {
    renderUi(<GarageScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'Add cars' }))
    expect(screen.getByRole('button', { name: 'Select cars to add' })).toBeDisabled()
  })

  test('editing PI to 701 moves the car under S1', async () => {
    await act(() => useStore.getState().addCars(['acura-integra-a-spec']))
    renderUi(<GarageScreen />)
    expect(await screen.findByRole('heading', { name: /^Class C\b/ })).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: /^Edit Acura Integra A-Spec/ }))
    const pi = screen.getByLabelText('PI')
    await userEvent.clear(pi)
    await userEvent.type(pi, '701')
    expect(within(screen.getByRole('dialog')).getByLabelText('Class S1, PI 701')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('heading', { name: /^Class S1\b/ })).toBeInTheDocument()
    expect(sectionHeading('C')).not.toBeInTheDocument()
  })

  test('a PI of 1000 cannot be saved', async () => {
    await act(() => useStore.getState().addCars(['acura-integra-a-spec']))
    renderUi(<GarageScreen />)
    await userEvent.click(await screen.findByRole('button', { name: /^Edit Acura Integra A-Spec/ }))
    const pi = screen.getByLabelText('PI')
    await userEvent.clear(pi)
    await userEvent.type(pi, '1000')
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByText('PI goes from 100 to 999.')).toBeInTheDocument()
  })

  test('delete asks first, then Undo brings the car back', async () => {
    await act(() => useStore.getState().addCars(['acura-integra-a-spec']))
    renderUi(<GarageScreen />)
    await userEvent.click(await screen.findByRole('button', { name: /^Edit Acura Integra A-Spec/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const confirm = await screen.findByRole('alertdialog')
    await userEvent.click(within(confirm).getByRole('button', { name: 'Delete car' }))
    expect(await screen.findByRole('button', { name: 'Add your cars' })).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    expect(await screen.findByRole('button', { name: /^Edit Acura Integra A-Spec/ })).toBeInTheDocument()
  })

  test('a double tap on Delete car deletes once without an error', async () => {
    await act(() => useStore.getState().addCars(['acura-integra-a-spec', 'acura-nsx-type-s']))
    renderUi(<GarageScreen />)
    await userEvent.click(await screen.findByRole('button', { name: /^Edit Acura Integra A-Spec/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await userEvent.dblClick(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete car' }))
    await screen.findByRole('button', { name: /^Edit Acura NSX Type S/ })
    expect(useStore.getState().entries).toHaveLength(1)
  })

  test('an entry whose car left the catalog shows as Unknown car', async () => {
    const profileId = useStore.getState().activeId!
    await restoreEntry({ id: 'ghost', profileId, carId: 'gone', custom: null, pi: 700, nickname: null, addedAt: 1, updatedAt: 1 })
    await act(() => useStore.getState().switchProfile(profileId))
    renderUi(<GarageScreen />)
    expect(await screen.findByRole('button', { name: /^Edit Unknown car/ })).toBeInTheDocument()
  })

  test('search matches nickname, ignoring case and accents', async () => {
    await act(() => useStore.getState().addCars(['acura-integra-a-spec', 'acura-nsx-type-s']))
    const nsx = useStore.getState().entries.find((e) => e.carId === 'acura-nsx-type-s')!
    await act(() => useStore.getState().updateEntry(nsx.id, { nickname: 'Drâg build' }))
    renderUi(<GarageScreen />)
    await userEvent.type(await screen.findByRole('searchbox', { name: 'Search garage' }), 'drag')
    expect(screen.getAllByRole('button', { name: /^Edit / })).toHaveLength(1)
  })

  test('a car missing from the wiki can be added by hand', async () => {
    renderUi(<GarageScreen />)
    await userEvent.click(await screen.findByRole('button', { name: 'Add cars' }))
    await userEvent.click(screen.getByRole('button', { name: "Add a car that's not listed" }))
    await userEvent.type(screen.getByLabelText('Make'), 'Honda')
    await userEvent.type(screen.getByLabelText('Model'), '#33 BYP Racing Integra')
    await userEvent.type(screen.getByLabelText('Year'), '2001')
    await userEvent.type(screen.getByLabelText('PI'), '860')
    await userEvent.click(screen.getByRole('button', { name: 'Add car' }))
    expect(await screen.findByRole('button', { name: /^Edit Honda #33 BYP Racing Integra/ })).toBeInTheDocument()
  })
})
