import { PI_MAX, PI_MIN } from './classes'
import type { CustomCar, GarageEntry, Profile } from './types'

export type BackupEntry = { carId: string | null; custom: CustomCar | null; pi: number; nickname: string | null }

export type BackupFile = {
  app: 'forza6-randomizer'
  version: 1
  profileName: string
  exportedAt: string
  entries: BackupEntry[]
}

export type ParseBackupResult =
  | { ok: true; file: BackupFile; skipped: { index: number; reason: string }[] }
  | { ok: false; error: 'not-json' | 'wrong-app' | 'unsupported-version' | 'no-entries' }

export function buildBackup(profile: Profile, entries: GarageEntry[]): BackupFile {
  return {
    app: 'forza6-randomizer',
    version: 1,
    profileName: profile.name,
    exportedAt: new Date().toISOString(),
    entries: entries.map(({ carId, custom, pi, nickname }) => ({ carId, custom, pi, nickname })),
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

function readCustom(v: unknown): CustomCar | null {
  if (!isObj(v) || typeof v.make !== 'string' || typeof v.model !== 'string') return null
  return { make: v.make, model: v.model, year: typeof v.year === 'number' ? v.year : null }
}

export function parseBackup(text: string, knownCarIds: Set<string>): ParseBackupResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'not-json' }
  }
  if (!isObj(raw) || raw.app !== 'forza6-randomizer') return { ok: false, error: 'wrong-app' }
  if (raw.version !== 1) return { ok: false, error: 'unsupported-version' }
  if (!Array.isArray(raw.entries) || raw.entries.length === 0) return { ok: false, error: 'no-entries' }

  const entries: BackupEntry[] = []
  const skipped: { index: number; reason: string }[] = []
  raw.entries.forEach((e: unknown, index: number) => {
    if (!isObj(e)) return skipped.push({ index, reason: 'not an entry' })
    const pi = e.pi
    if (typeof pi !== 'number' || !Number.isInteger(pi) || pi < PI_MIN || pi > PI_MAX) {
      return skipped.push({ index, reason: 'invalid PI' })
    }
    const nickname = typeof e.nickname === 'string' && e.nickname.trim() ? e.nickname : null
    let carId = typeof e.carId === 'string' ? e.carId : null
    let custom = readCustom(e.custom)
    if (carId && !knownCarIds.has(carId)) {
      custom = { make: 'Unknown', model: carId, year: null }
      carId = null
    }
    if (!carId && !custom) return skipped.push({ index, reason: 'no car' })
    entries.push({ carId, custom: carId ? null : custom, pi, nickname })
  })

  return {
    ok: true,
    file: {
      app: 'forza6-randomizer',
      version: 1,
      profileName: typeof raw.profileName === 'string' && raw.profileName.trim() ? raw.profileName : 'Imported',
      exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : '',
      entries,
    },
    skipped,
  }
}
