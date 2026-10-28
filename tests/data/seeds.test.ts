import { test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { CARS } from '../../src/data/catalog'
import { parseBackup } from '../../src/domain/backup'

const known = new Set(CARS.map((c) => c.id))

// Guards against a wiki re-fetch renaming ids that real garages already use.
test.each([
  ['kyle', 193],
  ['bryton', 277],
])('%s seed reads cleanly against the current catalog', (who, count) => {
  const parsed = parseBackup(readFileSync(`seed/${who}-garage.json`, 'utf8'), known)
  expect(parsed.ok).toBe(true)
  if (!parsed.ok) return
  expect(parsed.file.entries).toHaveLength(count)
  expect(parsed.skipped).toEqual([])
  expect(parsed.unrecognized).toBe(0)
})
