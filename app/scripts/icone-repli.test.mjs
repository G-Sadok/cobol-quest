import { describe, it, expect } from 'vitest'
import zlib from 'node:zlib'
import { dessineIcone } from './icone-repli.mjs'

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

// Relit le PNG produit : entete, donnees decompressees, et un pixel donne.
function relire (png) {
  const largeur = png.readUInt32BE(16)
  const hauteur = png.readUInt32BE(20)
  let position = 8
  const morceaux = {}
  while (position < png.length) {
    const longueur = png.readUInt32BE(position)
    const type = png.toString('ascii', position + 4, position + 8)
    morceaux[type] = png.subarray(position + 8, position + 8 + longueur)
    position += longueur + 12
  }
  const brut = zlib.inflateSync(morceaux.IDAT)
  const pixel = (x, y) => {
    const debut = y * (largeur * 4 + 1) + 1 + x * 4
    return [brut[debut], brut[debut + 1], brut[debut + 2], brut[debut + 3]]
  }
  return { largeur, hauteur, morceaux, brut, pixel }
}

describe('dessin de repli de l icone', () => {
  const png = dessineIcone(128)
  const image = relire(png)

  it('produit un PNG carre a la taille demandee', () => {
    expect(png.subarray(0, 8).equals(SIGNATURE)).toBe(true)
    expect(image.largeur).toBe(128)
    expect(image.hauteur).toBe(128)
    expect(png.toString('ascii', 12, 16)).toBe('IHDR')
    expect(png.toString('ascii', png.length - 8, png.length - 4)).toBe('IEND')
  })

  it('declare du RVBA 8 bits sans entrelacement', () => {
    const entete = image.morceaux.IHDR
    expect(entete[8]).toBe(8)
    expect(entete[9]).toBe(6)
    expect(entete[12]).toBe(0)
  })

  it('laisse les coins transparents (masque arrondi)', () => {
    expect(image.pixel(0, 0)[3]).toBe(0)
    expect(image.pixel(127, 0)[3]).toBe(0)
    expect(image.pixel(0, 127)[3]).toBe(0)
    expect(image.pixel(127, 127)[3]).toBe(0)
  })

  it('pose la carte de papier opaque au centre bas', () => {
    const [r, v, b, a] = image.pixel(64, 100)
    expect(a).toBe(255)
    expect([r, v, b]).toEqual([246, 242, 232])
  })

  it('creuse l ecran de console sombre derriere les lettres', () => {
    const [r, v, b, a] = image.pixel(30, 55)
    expect(a).toBe(255)
    expect([r, v, b]).toEqual([22, 22, 15])
  })

  it('allume du phosphore dans l ecran', () => {
    let verts = 0
    for (let y = 30; y < 79; y += 1) {
      for (let x = 24; x < 104; x += 1) {
        const [r, v, b] = image.pixel(x, y)
        if (r === 79 && v === 191 && b === 123) verts += 1
      }
    }
    expect(verts).toBeGreaterThan(100)
  })
})
