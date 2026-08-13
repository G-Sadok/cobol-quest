import { describe, expect, it } from 'vitest'
import { espacerMilliers } from './format.js'

const FINE = ' '

describe('espacerMilliers', () => {
  it('laisse les nombres a trois chiffres tranquilles', () => {
    expect(espacerMilliers(0)).toBe('0')
    expect(espacerMilliers(30)).toBe('30')
    expect(espacerMilliers(999)).toBe('999')
  })

  it('coupe par tranches de trois a partir du millier', () => {
    expect(espacerMilliers(1000)).toBe(`1${FINE}000`)
    expect(espacerMilliers(4210)).toBe(`4${FINE}210`)
    expect(espacerMilliers(1234567)).toBe(`1${FINE}234${FINE}567`)
  })

  it('separe par une espace fine insecable, jamais par une espace ordinaire', () => {
    expect(espacerMilliers(1000)).not.toContain(' ')
  })
})
