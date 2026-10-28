import { test, expect } from 'vitest'
import { tsvToBackup } from '../../scripts/seed-from-tsv'
import type { Car } from '../../src/domain/types'

const car = (id: string, name: string, stockPi: number) =>
  ({ id, name, make: name.split(' ')[0], model: name, year: 2016, stockPi }) as Car
const cars = [car('chevrolet-k-10-custom', 'Chevrolet K-10 Custom', 250), car('cadillac-cts-v-sedan', 'Cadillac CTS-V Sedan', 648)]

const tsv = [
  'masterName\tpi\tclassShown\ttileText\tphoto\tflag',
  'Chevrolet K-10 Custom\t268\tD\tK-10 CUSTOM / 1972 CHEVROLET / COMMON\tIMG_7142\t',
  'Cadillac CTS-V Sedan\t\tS2\tCTS-V / 2016 CA… / COMMON (partial edge tile)\tIMG_7156\tPI not visible (partial edge tile)',
  'Acura Integra Type R\t860\tS2\t#33 BYP RACING INTEG… / 2001 HONDA / EPIC\tIMG_7156\tno master match (BYP race car; guess only)',
].join('\n')

test('matched, blank-PI and unmatched rows all become entries', () => {
  const { file, notes } = tsvToBackup(tsv, cars, 'Kyle')
  expect(file.profileName).toBe('Kyle')
  expect(file.entries).toEqual([
    { carId: 'chevrolet-k-10-custom', custom: null, pi: 268, nickname: null },
    { carId: 'cadillac-cts-v-sedan', custom: null, pi: 648, nickname: 'Check PI' },
    { carId: null, custom: { make: 'Honda', model: '#33 Byp Racing Integ…', year: 2001 }, pi: 860, nickname: 'Check car' },
  ])
  expect(notes).toHaveLength(2)
})
