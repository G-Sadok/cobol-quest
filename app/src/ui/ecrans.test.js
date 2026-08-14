// Le registre des ecrans est ce qui tient la navigation : son ordre est celui
// de la barre laterale ET celui des raccourcis Cmd+1..Cmd+6. On le verrouille.

import { describe, expect, it } from 'vitest'
import { ecranParDefaut, ecranParId, ecranParRaccourci, ecrans, idsEcrans } from './ecrans.js'

describe('le registre des ecrans', () => {
  it('compte les 6 ecrans du cahier des charges, dans l ordre fige du design', () => {
    expect(idsEcrans.slice(0, 6)).toEqual([
      'terminal',
      'carte',
      'lecteur',
      'quiz',
      'livret',
      'reglages'
    ])
  })

  it('range le guide en dernier, apres les six du cahier des charges', () => {
    expect(idsEcrans).toEqual([
      'terminal',
      'carte',
      'lecteur',
      'quiz',
      'livret',
      'reglages',
      'guide'
    ])
  })

  it('ouvre sur le terminal', () => {
    expect(ecranParDefaut).toBe('terminal')
  })

  it('donne a chaque ecran un libelle, une puce de deux lettres et un titre', () => {
    for (const ecran of ecrans) {
      expect(ecran.libelle).toBeTruthy()
      expect(ecran.code).toMatch(/^[A-Z]{2}$/)
      expect(ecran.titre).toBeTruthy()
    }
  })

  it('ne reutilise jamais deux fois la meme puce', () => {
    const codes = ecrans.map((e) => e.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('donne une largeur de contenu a tous les ecrans sauf le lecteur', () => {
    for (const ecran of ecrans) {
      if (ecran.id === 'lecteur') expect(ecran.largeur).toBeNull()
      else expect(ecran.largeur).toMatch(/^var\(--l-/)
    }
  })

  it('retrouve un ecran par son identifiant', () => {
    expect(ecranParId('livret').libelle).toBe('Le livret')
    expect(ecranParId('inconnu')).toBeNull()
    expect(ecranParId(null)).toBeNull()
  })
})

describe('les raccourcis clavier', () => {
  it('range Cmd+1 a Cmd+7 dans l ordre de la barre laterale', () => {
    expect(ecranParRaccourci('1')).toBe('terminal')
    expect(ecranParRaccourci('6')).toBe('reglages')
    expect(ecranParRaccourci('7')).toBe('guide')
    expect(ecrans.map((_, rang) => ecranParRaccourci(String(rang + 1)))).toEqual(idsEcrans)
  })

  it('ignore tout ce qui n est pas un rang d ecran', () => {
    expect(ecranParRaccourci('0')).toBeNull()
    expect(ecranParRaccourci('8')).toBeNull()
    expect(ecranParRaccourci('a')).toBeNull()
    expect(ecranParRaccourci('')).toBeNull()
    expect(ecranParRaccourci('1.5')).toBeNull()
    expect(ecranParRaccourci(undefined)).toBeNull()
  })
})
