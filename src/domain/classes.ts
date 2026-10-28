export type ClassId = 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'R' | 'X'

export const CLASS_ORDER: ClassId[] = ['D', 'C', 'B', 'A', 'S1', 'S2', 'R', 'X']

// FH6 bands (changed from FH5, adds R). Source: Forza wiki "Performance Index".
export const CLASS_BANDS: Record<ClassId, { min: number; max: number }> = {
  D: { min: 100, max: 400 },
  C: { min: 401, max: 500 },
  B: { min: 501, max: 600 },
  A: { min: 601, max: 700 },
  S1: { min: 701, max: 800 },
  S2: { min: 801, max: 900 },
  R: { min: 901, max: 998 },
  X: { min: 999, max: 999 },
}

export const PI_MIN = 100
export const PI_MAX = 999

export function classForPi(pi: number): ClassId {
  if (!Number.isInteger(pi) || pi < PI_MIN || pi > PI_MAX) {
    throw new RangeError(`PI must be an integer ${PI_MIN}–${PI_MAX}, got ${pi}`)
  }
  return CLASS_ORDER.find((c) => pi <= CLASS_BANDS[c].max)!
}

export type ParsePiResult =
  | { ok: true; pi: number }
  | { ok: false; reason: 'empty' | 'not-a-number' | 'out-of-range' }

export function parsePi(input: string): ParsePiResult {
  const s = input.trim()
  if (s === '') return { ok: false, reason: 'empty' }
  if (!/^\d+$/.test(s)) return { ok: false, reason: 'not-a-number' }
  const pi = Number(s)
  if (pi < PI_MIN || pi > PI_MAX) return { ok: false, reason: 'out-of-range' }
  return { ok: true, pi }
}
