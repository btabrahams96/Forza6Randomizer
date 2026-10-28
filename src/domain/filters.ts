import { CLASS_ORDER, classForPi, type ClassId } from './classes'
import { COUNTRY_LABELS } from './labels'
import type { Car, CustomCar } from './types'

export type FilterKey = 'class' | 'carType' | 'make' | 'country' | 'rarity' | 'drivetrain' | 'decade'
export type FilterState = Partial<Record<FilterKey, string[]>>

export const FILTER_KEYS: FilterKey[] = ['class', 'carType', 'make', 'country', 'rarity', 'drivetrain', 'decade']

export const FILTER_LABELS: Record<FilterKey, string> = {
  class: 'Class',
  carType: 'Car Type',
  make: 'Manufacturer',
  country: 'Country',
  rarity: 'Rarity',
  drivetrain: 'Drivetrain',
  decade: 'Year',
}

// One rollable thing: a garage entry (its own PI) or, in All Cars, a car at stock PI.
export type RollItem = {
  key: string
  car: Car | undefined
  custom: CustomCar | null
  pi: number
  nickname: string | null
  entryId: string | null
}

export function decade(year: number): string {
  return `${Math.floor(year / 10) * 10}s`
}

export function valueFor(item: RollItem, key: FilterKey): string | null {
  const { car, custom } = item
  switch (key) {
    case 'class':
      return classForPi(item.pi)
    case 'make':
      return car?.make ?? custom?.make ?? null
    case 'decade': {
      const year = car?.year ?? custom?.year
      return year ? decade(year) : null
    }
    case 'country':
      return car ? COUNTRY_LABELS[car.country] ?? car.country : null
    case 'carType':
      return car?.carType ?? null
    case 'rarity':
      return car?.rarity ?? null
    case 'drivetrain':
      return car?.drivetrain ?? null
  }
}

export function applyFilters(items: RollItem[], f: FilterState): RollItem[] {
  const active = FILTER_KEYS.filter((k) => f[k]?.length)
  return items.filter((item) =>
    active.every((k) => {
      const v = valueFor(item, k)
      return v !== null && f[k]!.includes(v)
    }),
  )
}

export function facetOptions(items: RollItem[], key: FilterKey): { value: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    const v = valueFor(item, key)
    if (v !== null) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  const options = [...counts].map(([value, count]) => ({ value, count }))
  if (key === 'class') {
    return options.sort((a, b) => CLASS_ORDER.indexOf(a.value as ClassId) - CLASS_ORDER.indexOf(b.value as ClassId))
  }
  return options.sort((a, b) => a.value.localeCompare(b.value))
}
