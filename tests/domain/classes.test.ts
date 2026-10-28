import { describe, test, expect } from 'vitest'
import { classForPi, parsePi, CLASS_ORDER } from '../../src/domain/classes'

describe('classForPi', () => {
  const cases: [number, string][] = [
    [100, 'D'], [400, 'D'], [401, 'C'], [500, 'C'], [501, 'B'], [600, 'B'],
    [601, 'A'], [700, 'A'], [701, 'S1'], [800, 'S1'], [801, 'S2'], [900, 'S2'],
    [901, 'R'], [998, 'R'], [999, 'X'],
  ]
  test.each(cases)('PI %i is class %s', (pi, cls) => {
    expect(classForPi(pi)).toBe(cls)
  })
  test.each([99, 1000, 7.5, NaN])('PI %s throws RangeError', (pi) => {
    expect(() => classForPi(pi)).toThrow(RangeError)
  })
  test('class order runs D to X', () => {
    expect(CLASS_ORDER).toEqual(['D', 'C', 'B', 'A', 'S1', 'S2', 'R', 'X'])
  })
})

describe('parsePi', () => {
  test.each([
    ['', 'empty'], ['  ', 'empty'], ['abc', 'not-a-number'], ['7.5', 'not-a-number'],
    ['99', 'out-of-range'], ['1000', 'out-of-range'],
  ])('%j is rejected as %s', (input, reason) => {
    expect(parsePi(input)).toEqual({ ok: false, reason })
  })
  test('trims and accepts a valid PI', () => {
    expect(parsePi(' 701 ')).toEqual({ ok: true, pi: 701 })
  })
})
