export type RawListRow = {
  name: string
  display: string | null
  make: string
  model: string
  year: number
  rarityCode: string
  value: number
  unlockCode: string
  stats: number[]
  pi: number
  country: string
  extra: Record<string, string>
}

const ROW = /\{\{CarListStatsFH6\|([^}]*)\}\}/
const MAKE_COMMENT = /<!--\s*(.+?)\s*-->/

// The list groups rows under `<!-- Make -->` comments whose spacing can differ
// from the car name ("Alumi Craft" vs "Alumicraft"); prefer the name's spelling.
function splitMake(name: string, comment: string): { make: string; model: string } {
  const want = comment.replace(/\s+/g, '').toLowerCase()
  let consumed = ''
  let i = 0
  while (i < name.length && consumed.length < want.length) {
    if (name[i] !== ' ') consumed += name[i].toLowerCase()
    i++
  }
  if (consumed === want && (i === name.length || name[i] === ' ')) {
    return { make: name.slice(0, i), model: name.slice(i).trim() }
  }
  return { make: comment, model: name }
}

const num = (s: string) => Number(s.replace(/,/g, ''))

export function parseCarList(wikitext: string): RawListRow[] {
  const rows: RawListRow[] = []
  const seen = new Set<string>()
  let comment = ''
  for (const line of wikitext.split('\n')) {
    const c = line.match(MAKE_COMMENT)
    if (c && !line.includes('{{')) {
      comment = c[1]
      continue
    }
    const m = line.match(ROW)
    if (!m || seen.has(m[1])) continue
    seen.add(m[1])
    const parts = m[1].split('|').map((p) => p.trim())
    const positional = parts.filter((p) => !p.includes('='))
    const extra: Record<string, string> = {}
    for (const p of parts.filter((p) => p.includes('='))) {
      const [k, ...v] = p.split('=')
      extra[k.trim()] = v.join('=').trim()
    }
    const [name, display, year, rarityCode, value, unlockCode, ...rest] = positional
    rows.push({
      name,
      display: display || null,
      ...splitMake(name, comment),
      year: num(year),
      rarityCode: rarityCode.toLowerCase(),
      value: num(value),
      unlockCode: unlockCode.toLowerCase(),
      stats: rest.slice(0, 6).map(num),
      pi: num(rest[6]),
      country: (rest[7] ?? '').toLowerCase(),
      extra,
    })
  }
  return rows
}

export function parseCarPage(wikitext: string): { div: string | null; layout: string | null; imageFile: string | null } {
  const stats = wikitext.match(/\{\{CarStats\|fh6\b([\s\S]*?)\}\}/)
  const div = stats?.[1].match(/\|\s*div\s*=\s*([^|\s}]+)/)?.[1] ?? null
  const layout = wikitext.match(/\|\s*layout\s*=\s*([^|\s}]+)/)?.[1] ?? null
  const imageFile = wikitext.match(/(FH6 [^|\n\]]+?\.(?:png|jpg))/)?.[1] ?? null
  return { div, layout, imageFile }
}
