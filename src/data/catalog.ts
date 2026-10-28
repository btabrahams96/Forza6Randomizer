import type { Car } from '../domain/types'
import cars from './cars.json'

export const CARS = cars as Car[]

const byId = new Map(CARS.map((c) => [c.id, c]))

export function getCar(id: string): Car | undefined {
  return byId.get(id)
}

export const PLACEHOLDER_IMAGE = '/cars/placeholder.svg'

export function carImage(car: Car | undefined, size: 'thumb' | 'hero'): string {
  return (size === 'thumb' ? car?.thumb : car?.hero) ?? PLACEHOLDER_IMAGE
}
