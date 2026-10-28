// Turns the screenshot transcription in seed/kyle-garage.tsv into a backup file
// the app can import as a new profile: `npm run seed -- kyle`.
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { slugify } from './lib/ids'
import type { BackupEntry, BackupFile } from '../src/domain/backup'
import type { Car } from '../src/domain/types'

const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep, c) => sep + c.toUpperCase())

// tileText looks like "MODEL / YEAR MAKE / RARITY".
function customFromTile(tileText: string): BackupEntry['custom'] {
  const [model = '', yearMake = ''] = tileText.split(' / ')
  const m = yearMake.match(/^(\d{4})\s+(.+)$/)
  return { make: titleCase(m?.[2] ?? 'Unknown'), model: titleCase(model), year: m ? Number(m[1]) : null }
}

function matchCar(masterName: string, tileText: string, byId: Map<string, Car>, cars: Car[]): Car | undefined {
  const exact = byId.get(slugify(masterName))
  if (exact) return exact
  const named = cars.filter((c) => c.name === masterName)
  if (named.length <= 1) return named[0]
  // Several cars share a display name ("Honda Civic Type R"); the tile's year picks one.
  const year = Number(tileText.split(' / ')[1]?.match(/^(\d{4})/)?.[1])
  return named.find((c) => c.year === year)
}

export function tsvToBackup(tsv: string, cars: Car[], profileName: string): { file: BackupFile; notes: string[] } {
  const byId = new Map(cars.map((c) => [c.id, c]))
  const notes: string[] = []
  const entries: BackupEntry[] = []
  for (const line of tsv.trim().split('\n').slice(1)) {
    const [masterName, piText, , tileText, photo, flag = ''] = line.split('\t')
    const car = flag.startsWith('no master match') ? undefined : matchCar(masterName, tileText, byId, cars)
    const pi = piText ? Number(piText) : null
    if (!car) {
      if (pi === null) {
        notes.push(`${photo}: skipped "${tileText}" (no car match and no PI)`)
        continue
      }
      entries.push({ carId: null, custom: customFromTile(tileText), pi, nickname: 'Check car' })
      notes.push(`${photo}: "${tileText}" added as a custom car`)
    } else if (pi === null) {
      entries.push({ carId: car.id, custom: null, pi: car.stockPi, nickname: 'Check PI' })
      notes.push(`${photo}: ${car.name} has no PI, used stock ${car.stockPi}`)
    } else {
      entries.push({ carId: car.id, custom: null, pi, nickname: null })
    }
  }
  return {
    file: { app: 'forza6-randomizer', version: 1, profileName, exportedAt: new Date().toISOString(), entries },
    notes,
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { CARS } = await import('../src/data/catalog')
  // Usage: npm run seed -- <name>   reads seed/<name>-garage.tsv, writes seed/<name>-garage.json
  const who = (process.argv[2] ?? 'kyle').toLowerCase()
  const profileName = who.charAt(0).toUpperCase() + who.slice(1)
  const { file, notes } = tsvToBackup(readFileSync(`seed/${who}-garage.tsv`, 'utf8'), CARS, profileName)
  writeFileSync(`seed/${who}-garage.json`, JSON.stringify(file, null, 1) + '\n')
  console.log(`wrote seed/${who}-garage.json: ${file.entries.length} entries`)
  for (const n of notes) console.log(`  ${n}`)
}
