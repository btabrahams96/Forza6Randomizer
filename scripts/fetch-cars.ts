// Pulls every FH6 car from the Forza Fandom wiki into src/data/cars.json and
// public/cars/*.webp. Run by hand when the game adds cars: `npm run fetch-cars`.
// API responses and images are cached in .cache/ so re-runs are cheap.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import { parseCarList, parseCarPage, type RawListRow } from './lib/wiki'
import { makeCarIds } from './lib/ids'
import { DIVISION_LABELS, RARITY_BY_CODE, drivetrainFromLayout, engineFromLayout } from '../src/domain/labels'
import type { Car } from '../src/domain/types'

const API = 'https://forza.fandom.com/api.php'
const UA = 'Forza6Randomizer/1.0 (private use)'
const CACHE = '.cache/wiki'
const REFRESH = process.argv.includes('--refresh')
const MIN_GAP_MS = 500

const UNLOCK: Record<string, string> = {
  auto: 'Autoshow',
  awh: 'Autoshow, Wheelspin',
  awhaf: 'Autoshow, Wheelspin, Aftermarket',
  wh: 'Wheelspin',
  htf: 'Hard to Find',
  barn: 'Barn Find',
  treasure: 'Treasure Car',
  pass: 'Car Pass',
  wp: 'Welcome Pack',
  vip: 'VIP Membership',
  cm: 'Car Mastery',
  un: 'Unobtainable',
  j: 'Collection Journal',
  aj: 'Autoshow, Collection Journal',
  w: 'Wristband reward',
}

let last = 0
async function polite<T>(fn: () => Promise<T>): Promise<T> {
  const wait = last + MIN_GAP_MS - Date.now()
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  last = Date.now()
  return fn()
}

async function cachedFetch(url: string, kind: 'json' | 'bin'): Promise<Buffer> {
  mkdirSync(CACHE, { recursive: true })
  const file = `${CACHE}/${createHash('sha1').update(url).digest('hex')}.${kind}`
  if (!REFRESH && existsSync(file)) return readFileSync(file)
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await polite(() =>
        fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) }),
      )
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      const buf = Buffer.from(await res.arrayBuffer())
      writeFileSync(file, buf)
      return buf
    } catch (e) {
      // Network timeouts throw rather than return a status; retry both with backoff.
      if (attempt >= 4) throw e
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
}

async function api(params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams({ format: 'json', ...params })
  return JSON.parse((await cachedFetch(`${API}?${qs}`, 'json')).toString('utf8'))
}

async function wikitext(page: string): Promise<string | null> {
  const d = await api({ action: 'parse', page, prop: 'wikitext', redirects: '1' })
  return d.parse?.wikitext?.['*'] ?? null
}

function pageTitle(r: RawListRow): string {
  return r.unlockCode === 'wp' ? `${r.name} 'Welcome Pack'` : r.name
}

function displayName(r: RawListRow): string {
  const base = r.display ?? r.name
  if (r.rarityCode === 'fe') return `${base} Forza Edition`
  if (r.unlockCode === 'wp') return `${base} 'Welcome Pack'`
  return base
}

async function imageUrls(files: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  for (let i = 0; i < files.length; i += 50) {
    const batch = files.slice(i, i + 50)
    const d = await api({
      action: 'query', titles: batch.map((f) => `File:${f}`).join('|'),
      prop: 'imageinfo', iiprop: 'url', iiurlwidth: '720',
    })
    const norm = new Map<string, string>((d.query?.normalized ?? []).map((n: any) => [n.to, n.from]))
    for (const p of Object.values<any>(d.query?.pages ?? {})) {
      const url = p.imageinfo?.[0]?.thumburl ?? p.imageinfo?.[0]?.url
      if (!url) continue
      const title: string = norm.get(p.title) ?? p.title
      out.set(title.replace(/^File:/, ''), url)
    }
  }
  return out
}

async function main() {
  const list = await wikitext('Forza_Horizon_6/Cars')
  if (!list) throw new Error('car list page missing')
  const rows = parseCarList(list)
  const ids = makeCarIds(rows)
  console.log(`list: ${rows.length} cars`)

  const pages: ReturnType<typeof parseCarPage>[] = []
  const missingPage: string[] = []
  for (const [i, r] of rows.entries()) {
    let text = await wikitext(pageTitle(r))
    if (!text && r.unlockCode === 'wp') text = await wikitext(r.name)
    if (!text) missingPage.push(r.name)
    pages.push(text ? parseCarPage(text) : { div: null, layout: null, imageFile: null })
    if (i % 50 === 0) console.log(`pages ${i}/${rows.length}`)
  }

  const files = [...new Set(pages.map((p) => p.imageFile).filter((f): f is string => !!f))]
  const urls = await imageUrls(files)

  const cars: Car[] = []
  const missingImage: string[] = []
  const unknownDiv = new Set<string>()
  const unknownLayout = new Set<string>()
  for (const [i, r] of rows.entries()) {
    const p = pages[i]
    const id = ids[i]
    if (p.div && !DIVISION_LABELS[p.div]) unknownDiv.add(p.div)
    if (p.layout && !drivetrainFromLayout(p.layout)) unknownLayout.add(p.layout)
    let thumb: string | null = null
    let hero: string | null = null
    const url = p.imageFile ? urls.get(p.imageFile) : undefined
    if (url) {
      try {
        const src = await cachedFetch(url, 'bin')
        await sharp(src).resize({ width: 720 }).webp({ quality: 80 }).toFile(`public/cars/${id}-720.webp`)
        await sharp(src).resize({ width: 160 }).webp({ quality: 80 }).toFile(`public/cars/${id}-160.webp`)
        thumb = `/cars/${id}-160.webp`
        hero = `/cars/${id}-720.webp`
      } catch (e) {
        // One bad download shouldn't sink the run; re-running fills the gap from cache.
        missingImage.push(`${r.name} (download failed: ${(e as Error).message})`)
      }
    } else {
      missingImage.push(r.name)
    }
    const [sp, ha, ac, la, br, of] = r.stats
    cars.push({
      id,
      name: displayName(r),
      make: r.make,
      model: r.model,
      year: r.year,
      country: r.country,
      rarity: RARITY_BY_CODE[r.rarityCode] ?? 'Common',
      value: r.value,
      unlock: UNLOCK[r.unlockCode] ?? r.unlockCode,
      stats: { sp, ha, ac, la, br, of },
      stockPi: r.pi,
      carType: p.div ? DIVISION_LABELS[p.div] ?? null : null,
      drivetrain: drivetrainFromLayout(p.layout),
      engine: engineFromLayout(p.layout),
      thumb,
      hero,
    })
  }

  cars.sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model) || a.id.localeCompare(b.id))
  writeFileSync('src/data/cars.json', JSON.stringify(cars, null, 1) + '\n')
  console.log(`wrote ${cars.length} cars`)
  console.log(`missing page (${missingPage.length}): ${missingPage.join('; ')}`)
  console.log(`missing image (${missingImage.length}): ${missingImage.join('; ')}`)
  console.log(`unknown div: ${[...unknownDiv].join(', ') || 'none'}`)
  console.log(`unknown layout: ${[...unknownLayout].join(', ') || 'none'}`)
  console.log(`no div: ${cars.filter((c) => !c.carType).length}, no drivetrain: ${cars.filter((c) => !c.drivetrain).length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
