import { test, expect } from 'vitest'
import { roll } from '../../src/domain/roll'

const pool = [1, 2, 3].map((n) => ({ key: String(n) })) as any[]

test('empty pool rolls nothing', () => {
  expect(roll([])).toBeNull()
})
test('rng 0 picks the first item', () => {
  expect(roll(pool, () => 0)).toBe(pool[0])
})
test('rng just under 1 picks the last item', () => {
  expect(roll(pool, () => 0.9999)).toBe(pool[2])
})
test('every item can come up', () => {
  const seen = new Set([0, 0.34, 0.67].map((r) => roll(pool, () => r)!.key))
  expect(seen.size).toBe(3)
})
