export function roll<T>(pool: T[], rng: () => number = Math.random): T | null {
  if (pool.length === 0) return null
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))]
}
