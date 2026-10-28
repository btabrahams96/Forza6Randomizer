import { describe, test, expect, beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import * as db from '../../src/storage/db'

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  db.resetConnection()
})

describe('garage storage', () => {
  test('adding the same car twice makes two entries at stock PI', async () => {
    const p = await db.createProfile('Bryton')
    await db.addEntries(p.id, ['acura-nsx-type-s', 'acura-nsx-type-s'])
    const entries = await db.listEntries(p.id)
    expect(entries).toHaveLength(2)
    expect(entries.every((e) => e.pi === 734)).toBe(true)
  })

  test('a bad PI is rejected and the entry is unchanged', async () => {
    const p = await db.createProfile('Bryton')
    const [e] = await db.addEntries(p.id, ['acura-nsx-type-s'])
    await expect(db.updateEntry(e.id, { pi: 1000 })).rejects.toThrow(RangeError)
    expect((await db.listEntries(p.id))[0].pi).toBe(734)
  })

  test('update replaces the build', async () => {
    const p = await db.createProfile('Bryton')
    const [e] = await db.addEntries(p.id, ['acura-nsx-type-s'])
    await db.updateEntry(e.id, { pi: 905, nickname: 'Grip' })
    expect((await db.listEntries(p.id))[0]).toMatchObject({ pi: 905, nickname: 'Grip' })
  })

  test('deleting a profile leaves other profiles alone', async () => {
    const a = await db.createProfile('A')
    const b = await db.createProfile('B')
    await db.addEntries(a.id, ['acura-nsx-type-s'])
    await db.addEntries(b.id, ['acura-nsx-type-s'])
    await db.deleteProfile(a.id)
    expect(await db.listEntries(b.id)).toHaveLength(1)
    expect(await db.listEntries(a.id)).toHaveLength(0)
    expect((await db.listProfiles()).map((p) => p.name)).toEqual(['B'])
  })

  test('delete then restore round-trips an entry', async () => {
    const p = await db.createProfile('A')
    const [e] = await db.addEntries(p.id, ['acura-nsx-type-s'])
    const removed = await db.deleteEntry(e.id)
    expect(await db.listEntries(p.id)).toHaveLength(0)
    await db.restoreEntry(removed)
    expect(await db.listEntries(p.id)).toEqual([e])
  })

  test('duplicate copies the build as a new entry', async () => {
    const p = await db.createProfile('A')
    const [e] = await db.addEntries(p.id, ['acura-nsx-type-s'])
    const copy = await db.duplicateEntry(e.id)
    expect(copy.id).not.toBe(e.id)
    expect(copy.pi).toBe(e.pi)
    expect(await db.listEntries(p.id)).toHaveLength(2)
  })

  test('replacing entries touches only that profile', async () => {
    const a = await db.createProfile('A')
    const b = await db.createProfile('B')
    await db.addEntries(a.id, ['acura-nsx-type-s'])
    await db.addEntries(b.id, ['acura-nsx-type-s', 'acura-nsx-type-s'])
    await db.replaceEntries(a.id, [{ carId: null, custom: { make: 'Honda', model: 'X', year: null }, pi: 860, nickname: null }])
    expect(await db.listEntries(a.id)).toHaveLength(1)
    expect(await db.listEntries(b.id)).toHaveLength(2)
  })

  test('settings and active profile persist', async () => {
    const p = await db.createProfile('A')
    await db.setActiveProfileId(p.id)
    await db.saveSettings({ profileId: p.id, pool: 'all', filters: { class: ['A'] } })
    expect(await db.getActiveProfileId()).toBe(p.id)
    expect(await db.getSettings(p.id)).toEqual({ profileId: p.id, pool: 'all', filters: { class: ['A'] } })
  })

  test('settings default to my garage with no filters', async () => {
    expect(await db.getSettings('nobody')).toEqual({ profileId: 'nobody', pool: 'garage', filters: {} })
  })
})
