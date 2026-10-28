import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { useStore } from './state/store'
import { TabBar, type Tab } from './ui/TabBar'
import { Welcome } from './screens/Welcome'
import { RollScreen } from './screens/RollScreen'
import { GarageScreen } from './screens/GarageScreen'
import { ProfilesScreen } from './screens/ProfilesScreen'
import './ui/tokens.css'
import './ui/layout.css'

export default function App() {
  const { ready, activeId, init } = useStore()
  const [tab, setTab] = useState<Tab>('roll')

  useEffect(() => {
    void init()
  }, [init])

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
      <Toaster position="top-center" theme="system" offset="calc(env(safe-area-inset-top) + 12px)" />
    </>
  )
}
