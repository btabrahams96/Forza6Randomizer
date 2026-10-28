export type Rarity =
  | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Forza Edition' | 'Barn Find' | 'Treasure Car'

export type Drivetrain = 'FWD' | 'RWD' | 'AWD'
export type Engine = 'Front' | 'Mid' | 'Rear'

export type Car = {
  id: string
  name: string
  make: string
  model: string
  year: number
  country: string
  rarity: Rarity
  value: number
  unlock: string
  stats: { sp: number; ha: number; ac: number; la: number; br: number; of: number }
  stockPi: number
  carType: string | null
  drivetrain: Drivetrain | null
  engine: Engine | null
  thumb: string | null
  hero: string | null
}
