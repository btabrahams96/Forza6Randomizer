import { test, expect } from 'vitest'
import { PLAYERS } from '../../src/data/players'

test('Bryton and Kyle ship with their garages', () => {
  expect(PLAYERS.map((p) => [p.name, p.garage.entries.length])).toEqual([
    ['Bryton', 277],
    ['Kyle', 193],
  ])
})
