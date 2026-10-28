import type { ComponentType } from 'react'
import { DiceIcon, GarageIcon, PersonIcon } from './icons'
import './TabBar.css'

export type Tab = 'roll' | 'garage' | 'profiles'

const TABS: { id: Tab; label: string; Icon: ComponentType<{ width?: number; height?: number }> }[] = [
  { id: 'roll', label: 'Roll', Icon: DiceIcon },
  { id: 'garage', label: 'Garage', Icon: GarageIcon },
  { id: 'profiles', label: 'Profiles', Icon: PersonIcon },
]

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Sections">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className="tabbar__tab"
          aria-current={active === id ? 'page' : undefined}
          onClick={() => onChange(id)}
        >
          <Icon width={26} height={26} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
