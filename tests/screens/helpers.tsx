import type { ReactNode } from 'react'
import { render, act } from '@testing-library/react'
import { IDBFactory } from 'fake-indexeddb'
import { Toaster } from 'sonner'
import { VirtuosoMockContext } from 'react-virtuoso'
import * as db from '../../src/storage/db'
import { useStore } from '../../src/state/store'

export async function freshStore(profileName = 'Bryton') {
  globalThis.indexedDB = new IDBFactory()
  db.resetConnection()
  useStore.setState({ ready: false, profiles: [], activeId: null, entries: [], settings: null, lastRoll: {} })
  await act(() => useStore.getState().init())
  if (profileName) await act(() => useStore.getState().createProfile(profileName).then(() => {}))
  return useStore
}

export function renderUi(ui: ReactNode) {
  return render(
    <VirtuosoMockContext.Provider value={{ viewportHeight: 4000, itemHeight: 64 }}>
      {ui}
      <Toaster />
    </VirtuosoMockContext.Provider>,
  )
}
