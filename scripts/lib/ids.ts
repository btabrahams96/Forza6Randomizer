import type { RawListRow } from './wiki'

export function slugify(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Ids must stay stable across re-fetches: garages store them.
export function makeCarIds(rows: RawListRow[]): string[] {
  const base = rows.map((r) => {
    let id = slugify(r.name)
    if (r.rarityCode === 'fe') id += '-forza-edition'
    if (r.unlockCode === 'wp') id += '-welcome-pack'
    return id
  })
  const count = new Map<string, number>()
  return base.map((id) => {
    const n = (count.get(id) ?? 0) + 1
    count.set(id, n)
    return n === 1 ? id : `${id}-${n}`
  })
}
