import { describe, test, expect } from 'vitest'
import { applyFilters, facetOptions, decade, type RollItem } from '../../src/domain/filters'
import type { Car } from '../../src/domain/types'

const car = (over: Partial<Car>): Car => ({
  id: 'x', name: 'X', make: 'Toyota', model: 'X', year: 2020, country: 'jpn', rarity: 'Common',
  value: 0, unlock: '', stats: { sp: 0, ha: 0, ac: 0, la: 0, br: 0, of: 0 }, stockPi: 500,
  carType: 'Modern Sports Cars', drivetrain: 'RWD', engine: 'Front', thumb: null, hero: null, ...over,
})
const item = (key: string, pi: number, c: Car | undefined, custom: RollItem['custom'] = null): RollItem => ({
  key, car: c, custom, pi, nickname: null, entryId: key,
})

const supra = car({ id: 'supra', make: 'Toyota' })
const nsx = car({ id: 'nsx', make: 'Acura', year: 1968, drivetrain: 'AWD' })
const items = [item('a', 700, supra), item('b', 900, supra), item('c', 650, nsx)]

describe('applyFilters', () => {
  test('class uses the entry PI, so two copies split by class', () => {
    expect(applyFilters(items.slice(0, 2), { class: ['A'] }).map((i) => i.key)).toEqual(['a'])
  })
  test('values within one filter are OR', () => {
    expect(applyFilters(items.slice(0, 2), { class: ['A', 'S2'] })).toHaveLength(2)
  })
  test('different filters are AND', () => {
    expect(applyFilters(items, { class: ['A'], make: ['Toyota'] }).map((i) => i.key)).toEqual(['a'])
  })
  test('empty selections are ignored', () => {
    expect(applyFilters(items, { class: [], make: [] })).toHaveLength(3)
  })
  test('drivetrain and decade', () => {
    expect(applyFilters(items, { drivetrain: ['AWD'], decade: ['1960s'] }).map((i) => i.key)).toEqual(['c'])
  })
  test('unknown car passes only filters it has data for', () => {
    const ghost = item('g', 700, undefined)
    expect(applyFilters([ghost], { class: ['A'] })).toHaveLength(1)
    expect(applyFilters([ghost], { carType: ['Modern Sports Cars'] })).toHaveLength(0)
  })
  test('custom car matches on its own make and year', () => {
    const custom = item('k', 860, undefined, { make: 'Honda', model: '#33 Integra', year: 2001 })
    expect(applyFilters([custom], { make: ['Honda'], decade: ['2000s'] })).toHaveLength(1)
    expect(applyFilters([custom], { rarity: ['Epic'] })).toHaveLength(0)
  })
})

describe('facetOptions', () => {
  test('class options are in class order with counts', () => {
    expect(facetOptions(items, 'class')).toEqual([
      { value: 'A', count: 2 }, { value: 'S2', count: 1 },
    ])
  })
  test('other options are alphabetical', () => {
    expect(facetOptions(items, 'make').map((o) => o.value)).toEqual(['Acura', 'Toyota'])
  })
  test('decade options ascend', () => {
    expect(facetOptions(items, 'decade').map((o) => o.value)).toEqual(['1960s', '2020s'])
  })
})

test('decade buckets', () => {
  expect(decade(1968)).toBe('1960s')
  expect(decade(2000)).toBe('2000s')
})
