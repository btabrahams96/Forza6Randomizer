import { describe, test, expect, beforeEach } from 'vitest'
import { screen, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RollScreen } from '../../src/screens/RollScreen'
import { useStore } from '../../src/state/store'
import { freshStore, renderUi } from './helpers'

beforeEach(async () => {
  await freshStore()
  await act(() => useStore.getState().addCars(['acura-integra-a-spec', 'acura-nsx-type-s']))
})

const result = () => screen.getByRole('region', { name: 'Rolled car' })

describe('Roll', () => {
  test('rolls a car from my garage using the injected random', async () => {
    renderUi(<RollScreen rng={() => 0.99} />)
    expect(await screen.findByText('2 matching cars')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Roll' }))
    expect(within(result()).getByText('NSX Type S')).toBeInTheDocument()
    expect(within(result()).getByLabelText('Class S1, PI 734')).toBeInTheDocument()
  })

  test('shows the nickname of the rolled build', async () => {
    const nsx = useStore.getState().entries.find((e) => e.carId === 'acura-nsx-type-s')!
    await act(() => useStore.getState().updateEntry(nsx.id, { nickname: 'Track build' }))
    renderUi(<RollScreen rng={() => 0.99} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Roll' }))
    expect(within(result()).getByText('Track build')).toBeInTheDocument()
  })

  test('the button says Roll again after the first roll', async () => {
    renderUi(<RollScreen rng={() => 0} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Roll' }))
    expect(screen.getByRole('button', { name: 'Roll again' })).toBeInTheDocument()
  })

  test('no matches disables Roll and Clear filters resets', async () => {
    await act(() => useStore.getState().setFilters({ class: ['X'] }))
    renderUi(<RollScreen rng={() => 0} />)
    expect(await screen.findByText('No cars match these filters.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Roll' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(await screen.findByText('2 matching cars')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Roll' })).toBeEnabled()
  })

  test('empty garage points to All Cars or the garage', async () => {
    await freshStore('Kyle')
    renderUi(<RollScreen rng={() => 0} />)
    expect(await screen.findByText('Your garage is empty.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: 'All Cars' }))
    expect(await screen.findByText('665 matching cars')).toBeInTheDocument()
  })

  test('pool and filters survive a reload', async () => {
    const view = renderUi(<RollScreen rng={() => 0} />)
    await userEvent.click(await screen.findByRole('radio', { name: 'All Cars' }))
    await act(() => useStore.getState().setFilters({ make: ['Acura'] }))
    view.unmount()
    const profileId = useStore.getState().activeId!
    useStore.setState({ ready: false, entries: [], settings: null })
    await act(() => useStore.getState().init())
    expect(useStore.getState().activeId).toBe(profileId)
    renderUi(<RollScreen rng={() => 0} />)
    expect(await screen.findByRole('radio', { name: 'All Cars' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Acura' })).toBeInTheDocument()
  })
})
