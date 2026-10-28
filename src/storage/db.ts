import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { getCar } from '../data/catalog'
import { classForPi } from '../domain/classes'
import type { BackupEntry } from '../domain/backup'
import type { CustomCar, GarageEntry, Profile, RollSettings } from '../domain/types'

interface Schema extends DBSchema {
  profiles: { key: string; value: Profile }
  entries: { key: string; value: GarageEntry; indexes: { byProfile: string } }
  settings: { key: string; value: RollSettings }
  meta: { key: string; value: string }
}

let conn: Promise<IDBPDatabase<Schema>> | null = null

function db() {
  if (!conn) {
    conn = openDB<Schema>('f6r', 1, {
      upgrade(d) {
        d.createObjectStore('profiles', { keyPath: 'id' })
        d.createObjectStore('entries', { keyPath: 'id' }).createIndex('byProfile', 'profileId')
        d.createObjectStore('settings', { keyPath: 'profileId' })
        d.createObjectStore('meta')
      },
    })
    // Ask the browser not to evict the garage under storage pressure.
    void navigator.storage?.persist?.().catch(() => {})
  }
  return conn
}

// Tests swap in a fresh IndexedDB between cases.
export function resetConnection() {
  conn = null
}

const newId = () => crypto.randomUUID()

export async function listProfiles(): Promise<Profile[]> {
  return (await (await db()).getAll('profiles')).sort((a, b) => a.createdAt - b.createdAt)
}

export async function createProfile(name: string): Promise<Profile> {
  const p: Profile = { id: newId(), name: name.trim(), createdAt: Date.now() }
  await (await db()).put('profiles', p)
  return p
}

export async function renameProfile(id: string, name: string): Promise<void> {
  const d = await db()
  const p = await d.get('profiles', id)
  if (p) await d.put('profiles', { ...p, name: name.trim() })
}

export async function deleteProfile(id: string): Promise<void> {
  const tx = (await db()).transaction(['profiles', 'entries', 'settings'], 'readwrite')
  const keys = await tx.objectStore('entries').index('byProfile').getAllKeys(id)
  await Promise.all([
    ...keys.map((k) => tx.objectStore('entries').delete(k)),
    tx.objectStore('profiles').delete(id),
    tx.objectStore('settings').delete(id),
    tx.done,
  ])
}

export async function listEntries(profileId: string): Promise<GarageEntry[]> {
  const all = await (await db()).getAllFromIndex('entries', 'byProfile', profileId)
  return all.sort((a, b) => a.addedAt - b.addedAt || a.id.localeCompare(b.id))
}

function makeEntry(profileId: string, e: BackupEntry, at: number): GarageEntry {
  classForPi(e.pi)
  return { id: newId(), profileId, carId: e.carId, custom: e.custom, pi: e.pi, nickname: e.nickname, addedAt: at, updatedAt: at }
}

async function putAll(entries: GarageEntry[]) {
  const tx = (await db()).transaction('entries', 'readwrite')
  await Promise.all([...entries.map((e) => tx.store.put(e)), tx.done])
}

export async function addEntries(profileId: string, carIds: string[]): Promise<GarageEntry[]> {
  const now = Date.now()
  const entries = carIds.map((carId, i) => {
    const car = getCar(carId)
    if (!car) throw new Error(`unknown car ${carId}`)
    return makeEntry(profileId, { carId, custom: null, pi: car.stockPi, nickname: null }, now + i)
  })
  await putAll(entries)
  return entries
}

export async function addCustomEntry(profileId: string, custom: CustomCar, pi: number): Promise<GarageEntry> {
  const e = makeEntry(profileId, { carId: null, custom, pi, nickname: null }, Date.now())
  await putAll([e])
  return e
}

export async function updateEntry(id: string, patch: { pi?: number; nickname?: string | null }): Promise<GarageEntry> {
  if (patch.pi !== undefined) classForPi(patch.pi)
  const d = await db()
  const e = await d.get('entries', id)
  if (!e) throw new Error(`no entry ${id}`)
  const next = { ...e, ...patch, updatedAt: Date.now() }
  if (next.nickname !== null && next.nickname !== undefined && !next.nickname.trim()) next.nickname = null
  await d.put('entries', next)
  return next
}

export async function duplicateEntry(id: string): Promise<GarageEntry> {
  const d = await db()
  const e = await d.get('entries', id)
  if (!e) throw new Error(`no entry ${id}`)
  const now = Date.now()
  const copy = { ...e, id: newId(), addedAt: now, updatedAt: now }
  await d.put('entries', copy)
  return copy
}

export async function deleteEntry(id: string): Promise<GarageEntry> {
  const d = await db()
  const e = await d.get('entries', id)
  if (!e) throw new Error(`no entry ${id}`)
  await d.delete('entries', id)
  return e
}

export async function restoreEntry(entry: GarageEntry): Promise<void> {
  await (await db()).put('entries', entry)
}

export async function replaceEntries(profileId: string, entries: BackupEntry[]): Promise<GarageEntry[]> {
  const now = Date.now()
  const fresh = entries.map((e, i) => makeEntry(profileId, e, now + i))
  const tx = (await db()).transaction('entries', 'readwrite')
  const old = await tx.store.index('byProfile').getAllKeys(profileId)
  await Promise.all([...old.map((k) => tx.store.delete(k)), ...fresh.map((e) => tx.store.put(e)), tx.done])
  return fresh
}

export async function getSettings(profileId: string): Promise<RollSettings> {
  return (await (await db()).get('settings', profileId)) ?? { profileId, pool: 'garage', filters: {} }
}

export async function saveSettings(s: RollSettings): Promise<void> {
  await (await db()).put('settings', s)
}

export async function getActiveProfileId(): Promise<string | null> {
  return (await (await db()).get('meta', 'activeProfile')) ?? null
}

export async function setActiveProfileId(id: string): Promise<void> {
  await (await db()).put('meta', id, 'activeProfile')
}
