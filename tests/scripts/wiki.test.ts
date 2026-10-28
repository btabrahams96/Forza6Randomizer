import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseCarList, parseCarPage } from '../../scripts/lib/wiki'

const list = readFileSync('tests/fixtures/list-snippet.txt', 'utf8')
const page = readFileSync('tests/fixtures/page-acura-nsx.txt', 'utf8')
const artura = readFileSync('tests/fixtures/page-mclaren-artura.txt', 'utf8')

describe('parseCarList', () => {
  const rows = parseCarList(list)

  test('parses every row', () => {
    expect(rows).toHaveLength(22)
  })

  test('reads fields of the first row', () => {
    expect(rows[0]).toMatchObject({
      name: 'Abarth 124 Spider', display: null, make: 'Abarth', model: '124 Spider',
      year: 2017, rarityCode: 'r', value: 250000, unlockCode: 'htf', pi: 450, country: 'ita',
      stats: [5.2, 4.7, 3.8, 4.6, 3.3, 5.5],
    })
  })

  test('keeps named extras', () => {
    expect(rows.find((r) => r.name === 'Acura NSX Type S')!.extra.band).toBe('Blue')
  })

  test('takes make from the comment even when its spacing differs', () => {
    const r = rows.find((r) => r.name === 'Alumicraft 6165 Trick Truck')!
    expect(r.make).toBe('Alumicraft')
    expect(r.display).toBe('Alumicraft #6165 Trick Truck')
  })

  test('drops exact duplicate rows', () => {
    const twice = list + list.split('\n').find((l) => l.includes('Abarth 124 Spider'))
    expect(parseCarList(twice)).toHaveLength(22)
  })
})

describe('parseCarPage', () => {
  test('reads FH6 division, layout and thumbnail', () => {
    expect(parseCarPage(page)).toEqual({ div: 'msu', layout: 'ma', imageFile: 'FH6 Acura NSX Type-S.png' })
  })
  test('reads division past nested templates inside the FH6 stats block', () => {
    expect(parseCarPage(artura).div).toBe('msu')
  })
  test('returns nulls for a page without the fields', () => {
    expect(parseCarPage('nothing here')).toEqual({ div: null, layout: null, imageFile: null })
  })
})
