import type { Drivetrain, Engine, Rarity } from './types'

export const RARITY_BY_CODE: Record<string, Rarity> = {
  c: 'Common',
  r: 'Rare',
  e: 'Epic',
  l: 'Legendary',
  fe: 'Forza Edition',
  barn: 'Barn Find',
  treasure: 'Treasure Car',
}

// FH6 `div` codes, from the wiki's Template:CarStats. Labels follow the in-game spelling.
export const DIVISION_LABELS: Record<string, string> = {
  b: 'Buggies',
  cc: 'Cult Cars',
  cm: 'Classic Muscle',
  crc: 'Classic Racers',
  crl: 'Classic Rally',
  csc: 'Classic Sports Cars',
  dc: 'Drift Cars',
  ecd: 'Eclectic Domestics',
  ett: 'Extreme Track Toys',
  gtc: 'GT Cars',
  h: 'Hypercars',
  hh: 'Hot Hatch',
  mm: 'Modern Muscle',
  mr: 'Modern Rally',
  msp: 'Modern Sports Cars',
  mss: 'Modern Super Saloons',
  msu: 'Modern Supercars',
  n: 'No Car Type',
  o: 'Offroad',
  p4: "Pickups & 4x4's",
  rac: 'Rods & Customs',
  rc: 'Rare Classics',
  rhh: 'Retro Hot Hatch',
  ram: 'Rally Monsters',
  rem: 'Retro Muscle',
  rrc: 'Retro Racers',
  rra: 'Retro Rally',
  rss: 'Retro Super Saloons',
  rsp: 'Retro Sports Cars',
  rsu: 'Retro Supercars',
  sgt: 'Super GT',
  shh: 'Super Hot Hatch',
  suh: 'Sports Utility Heroes',
  tt: 'Track Toys',
  ub: 'Unlimited Buggies',
  uo: 'Unlimited Offroad',
  uh: 'Utility Heroes',
  utv: "UTV's",
  vr: 'Vintage Racers',
}

export const COUNTRY_LABELS: Record<string, string> = {
  jpn: 'Japan',
  usa: 'United States',
  us: 'United States',
  ger: 'Germany',
  ita: 'Italy',
  uk: 'United Kingdom',
  fra: 'France',
  swe: 'Sweden',
  kor: 'South Korea',
  oz: 'Australia',
  aus: 'Austria',
  ch: 'Switzerland',
  can: 'Canada',
  cro: 'Croatia',
  den: 'Denmark',
}

// `layout` codes from Template:CarInfobox: engine position letter + drive letter.
const ENGINE: Record<string, Engine> = { f: 'Front', m: 'Mid', r: 'Rear' }
const DRIVE: Record<string, Drivetrain> = { f: 'FWD', r: 'RWD', '4': 'AWD', a: 'AWD' }

export function drivetrainFromLayout(code: string | null): Drivetrain | null {
  if (!code || code.length !== 2) return null
  return ENGINE[code[0]] ? DRIVE[code[1]] ?? null : null
}

export function engineFromLayout(code: string | null): Engine | null {
  if (!code || code.length !== 2) return null
  return DRIVE[code[1]] ? ENGINE[code[0]] ?? null : null
}
