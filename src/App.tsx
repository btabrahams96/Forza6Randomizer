import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { useStore } from './state/store'
import { TabBar, type Tab } from './ui/TabBar'
import { Welcome } from './screens/Welcome'
import { RollScreen } from './screens/RollScreen'
import { GarageScreen } from './screens/GarageScreen'
import { ProfilesScreen } from './screens/ProfilesScreen'
import { FatalScreen } from './ui/Fatal'
import './ui/tokens.css'
import './ui/layout.css'

export default function App() {
  const { ready, activeId, init } = useStore()
  const [tab, setTab] = useState<Tab>('roll')
  const [failed, setFailed] = useState<string | null>(null)

  useEffect(() => {
    init().catch((e: Error) => setFailed(e.message))
  }, [init])

  if (failed !== null) return <FatalScreen detail={failed} />
  if (!ready) return null
  if (!activeId) return <Welcome />

  return (
    <>
      <div className="app">
        {tab === 'roll' && <RollScreen onOpenProfiles={() => setTab('profiles')} />}
        {tab === 'garage' && <GarageScreen />}
        {tab === 'profiles' && <ProfilesScreen />}
      </div>
      <TabBar active={tab} onChange={setTab} />
      {/* Bottom, above the tab bar, so toasts never sit on the large title or its + button. */}
      <Toaster
        position="bottom-center"
        theme="system"
        duration={3500}
        offset={{ bottom: 'calc(var(--tab-h) + env(safe-area-inset-bottom) + 16px)' }}
        mobileOffset={{ bottom: 'calc(var(--tab-h) + env(safe-area-inset-bottom) + 16px)' }}
      />
    </>
  )
}
