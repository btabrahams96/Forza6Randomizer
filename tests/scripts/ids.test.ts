import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseCarList } from '../../scripts/lib/wiki'
import { makeCarIds, slugify } from '../../scripts/lib/ids'
import { RARITY_BY_CODE, drivetrainFromLayout, engineFromLayout, DIVISION_LABELS } from '../../src/domain/labels'

const rows = parseCarList(readFileSync('tests/fixtures/list-snippet.txt', 'utf8'))

describe('makeCarIds', () => {
  test('ids are unique', () => {
    const ids = makeCarIds(rows)
    expect(new Set(ids).size).toBe(ids.length)
  })
  test('welcome pack twin gets a suffix, the base car keeps the plain slug', () => {
    const ids = makeCarIds(rows)
    expect(ids).toContain('ferrari-fxx-k-evo')
    expect(ids).toContain('ferrari-fxx-k-evo-welcome-pack')
  })
  test('forza edition gets a suffix', () => {
    const fe = { ...rows[0], rarityCode: 'fe' }
    expect(makeCarIds([rows[0], fe])).toEqual(['abarth-124-spider', 'abarth-124-spider-forza-edition'])
  })
  test('forza edition whose wiki name already says so is not suffixed twice', () => {
    const fe = { ...rows[0], name: 'Lotus Evija Forza Edition', rarityCode: 'fe' }
    expect(makeCarIds([fe])).toEqual(['lotus-evija-forza-edition'])
  })
  test('ids are deterministic and independent of the order of other rows', () => {
    const a = makeCarIds(rows)
    expect(makeCarIds(rows)).toEqual(a)
    const reversed = makeCarIds([...rows].reverse()).reverse()
    expect(reversed).toEqual(a)
  })
  test('slugify strips accents and symbols', () => {
    expect(slugify('BMW M4 Competition Coupé')).toBe('bmw-m4-competition-coupe')
    expect(slugify('Alfa Romeo Autodelta Tipo 33/2 Daytona')).toBe('alfa-romeo-autodelta-tipo-33-2-daytona')
  })
})

describe('labels', () => {
  test('layout codes', () => {
    expect(drivetrainFromLayout('ma')).toBe('AWD')
    expect(drivetrainFromLayout('ff')).toBe('FWD')
    expect(drivetrainFromLayout('rr')).toBe('RWD')
    expect(drivetrainFromLayout('f4')).toBe('AWD')
    expect(drivetrainFromLayout(null)).toBeNull()
    expect(engineFromLayout('ma')).toBe('Mid')
  })
  test('rarity and division', () => {
    expect(RARITY_BY_CODE.barn).toBe('Barn Find')
    expect(RARITY_BY_CODE.fe).toBe('Forza Edition')
    expect(DIVISION_LABELS.msu).toBe('Modern Supercars')
  })
})
