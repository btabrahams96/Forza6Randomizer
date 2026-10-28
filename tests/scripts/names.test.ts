import { test, expect } from 'vitest'
import { displayNames } from '../../scripts/lib/names'
import type { RawListRow } from '../../scripts/lib/wiki'

const row = (name: string, display: string | null, over: Partial<RawListRow> = {}) =>
  ({ name, display, rarityCode: 'c', unlockCode: 'awh', year: 2000, ...over }) as RawListRow

test('uses the wiki display name when it is unique', () => {
  expect(displayNames([row('Alumicraft 6165 Trick Truck', 'Alumicraft #6165 Trick Truck')])).toEqual(['Alumicraft #6165 Trick Truck'])
})

test('falls back to the full wiki name when display names collide', () => {
  expect(displayNames([
    row('Honda Civic Type R (1997)', 'Honda Civic Type R'),
    row('Honda Civic Type R (2004)', 'Honda Civic Type R'),
  ])).toEqual(['Honda Civic Type R (1997)', 'Honda Civic Type R (2004)'])
})

test('marks Forza Edition and Welcome Pack variants', () => {
  expect(displayNames([
    row('Lotus Evija Forza Edition', null, { rarityCode: 'fe' }),
    row('Ferrari FXX-K Evo', null, { unlockCode: 'wp' }),
    row('Ferrari FXX-K Evo', null),
  ])).toEqual(['Lotus Evija Forza Edition', "Ferrari FXX-K Evo 'Welcome Pack'", 'Ferrari FXX-K Evo'])
})
