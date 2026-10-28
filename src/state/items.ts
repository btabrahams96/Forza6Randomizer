import { CARS, getCar } from '../data/catalog'
import type { RollItem } from '../domain/filters'
import type { Car, CustomCar, GarageEntry } from '../domain/types'

export function entryItems(entries: GarageEntry[]): RollItem[] {
  return entries.map((e) => ({
    key: e.id,
    car: e.carId ? getCar(e.carId) : undefined,
    custom: e.custom,
    pi: e.pi,
    nickname: e.nickname,
    entryId: e.id,
  }))
}

let allItems: RollItem[] | null = null
export function allCarItems(): RollItem[] {
  allItems ??= CARS.map((c) => ({ key: c.id, car: c, custom: null, pi: c.stockPi, nickname: null, entryId: null }))
  return allItems
}

export function itemTitle(item: { car: Car | undefined; custom: CustomCar | null }): string {
  if (item.car) return item.car.name
  if (item.custom) return `${item.custom.make} ${item.custom.model}`.trim()
  return 'Unknown car'
}

export function fold(s: string): string {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function matchesSearch(item: RollItem, query: string): boolean {
  const q = fold(query.trim())
  if (!q) return true
  const hay = fold([itemTitle(item), item.car?.make, item.custom?.make, item.nickname].filter(Boolean).join(' '))
  return q.split(/\s+/).every((word) => hay.includes(word))
}
