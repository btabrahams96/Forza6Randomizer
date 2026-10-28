import type { RawListRow } from './wiki'

function base(r: RawListRow): string {
  return r.display ?? r.name
}

// The wiki's display column drops the year ("Honda Civic Type R" x7); when two
// cars would show the same name, fall back to the full wiki name.
export function displayNames(rows: RawListRow[]): string[] {
  const label = (r: RawListRow, name: string) => {
    if (r.rarityCode === 'fe' && !/forza edition$/i.test(name)) return `${name} Forza Edition`
    if (r.unlockCode === 'wp') return `${name} 'Welcome Pack'`
    return name
  }
  const first = rows.map((r) => label(r, base(r)))
  const count = new Map<string, number>()
  for (const n of first) count.set(n, (count.get(n) ?? 0) + 1)
  return rows.map((r, i) => (count.get(first[i])! > 1 ? label(r, r.name) : first[i]))
}
