import { describe, test, expect } from 'vitest'
import { buildBackup, parseBackup } from '../../src/domain/backup'
import type { GarageEntry, Profile } from '../../src/domain/types'

const profile: Profile = { id: 'p', name: 'Kyle', createdAt: 0 }
const entry = (over: Partial<GarageEntry>): GarageEntry => ({
  id: 'e', profileId: 'p', carId: 'supra', custom: null, pi: 800, nickname: null, addedAt: 0, updatedAt: 0, ...over,
})
const known = new Set(['supra', 'nsx'])

describe('backup', () => {
  test('round-trips', () => {
    const file = buildBackup(profile, [entry({}), entry({ id: 'f', carId: null, custom: { make: 'Honda', model: 'X', year: 2001 }, pi: 860 })])
    const parsed = parseBackup(JSON.stringify(file), known)
    expect(parsed).toEqual({ ok: true, file, skipped: [], unrecognized: 0 })
  })
  test('not JSON', () => {
    expect(parseBackup('nope', known)).toEqual({ ok: false, error: 'not-json' })
  })
  test('another app', () => {
    expect(parseBackup('{"app":"other"}', known)).toEqual({ ok: false, error: 'wrong-app' })
  })
  test('newer version', () => {
    const file = { ...buildBackup(profile, [entry({})]), version: 2 }
    expect(parseBackup(JSON.stringify(file), known)).toEqual({ ok: false, error: 'unsupported-version' })
  })
  test('no entries', () => {
    expect(parseBackup(JSON.stringify(buildBackup(profile, [])), known)).toEqual({ ok: false, error: 'no-entries' })
  })
  test('bad PI is skipped, the rest is kept', () => {
    const file = buildBackup(profile, [entry({ pi: 50 }), entry({ id: 'f' })])
    const parsed = parseBackup(JSON.stringify(file), known)
    expect(parsed.ok && parsed.file.entries).toHaveLength(1)
    expect(parsed.ok && parsed.skipped).toEqual([{ index: 0, reason: 'invalid PI' }])
  })
  test('a backup with no readable entries is refused', () => {
    const file = buildBackup(profile, [entry({ pi: 50 }), entry({ pi: 1000 })])
    expect(parseBackup(JSON.stringify(file), known)).toEqual({ ok: false, error: 'no-entries' })
  })
  test('unknown car ids are counted', () => {
    const file = buildBackup(profile, [entry({ carId: 'gone' }), entry({})])
    const parsed = parseBackup(JSON.stringify(file), known)
    expect(parsed.ok && parsed.unrecognized).toBe(1)
  })
  test('unknown car id becomes a custom car', () => {
    const file = buildBackup(profile, [entry({ carId: 'gone' })])
    const parsed = parseBackup(JSON.stringify(file), known)
    expect(parsed.ok && parsed.file.entries[0]).toMatchObject({ carId: null, custom: { make: 'Unknown', model: 'gone', year: null } })
  })
  test('malformed entries are skipped', () => {
    const raw = { app: 'forza6-randomizer', version: 1, profileName: 'K', exportedAt: '', entries: [{ carId: 'supra' }, 'x', { carId: 'nsx', custom: null, pi: 701, nickname: 7 }] }
    const parsed = parseBackup(JSON.stringify(raw), known)
    expect(parsed.ok && parsed.file.entries).toEqual([{ carId: 'nsx', custom: null, pi: 701, nickname: null }])
    expect(parsed.ok && parsed.skipped.map((s) => s.index)).toEqual([0, 1])
  })
})
