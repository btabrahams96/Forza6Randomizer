import { test, expect } from 'vitest'
import { CARS, getCar, carImage } from '../../src/data/catalog'
import { classForPi } from '../../src/domain/classes'

test('catalog has the full FH6 list', () => {
  expect(CARS.length).toBeGreaterThanOrEqual(660)
})

test('every id is unique', () => {
  expect(new Set(CARS.map((c) => c.id)).size).toBe(CARS.length)
})

test('every stock PI is a valid FH6 PI', () => {
  for (const c of CARS) expect(() => classForPi(c.stockPi), c.id).not.toThrow()
})

test('car type comes from the wiki division', () => {
  expect(getCar('acura-nsx-type-s')?.carType).toBe('Modern Supercars')
})

test('missing car or photo falls back to the placeholder', () => {
  expect(carImage(undefined, 'thumb')).toBe('/cars/placeholder.svg')
  expect(carImage({ ...CARS[0], hero: null }, 'hero')).toBe('/cars/placeholder.svg')
})
