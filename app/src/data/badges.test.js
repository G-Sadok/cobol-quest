import { describe, expect, it } from 'vitest'
import { libelleBadge } from './badges.js'
import { epreuves } from './programme.js'

// Le livret « progression/XP_ET_BADGES.md » fait foi (cahier des charges, §6).
// Recopie de sa section 3, aux accents près : les majuscules les perdent
// (design, règle 7 du §7).
const LIVRET = {
  'premiere-compile': 'PREMIERE COMPILE',
  'colonne-7': 'COLONNE 7',
  'les-quatre-saisons': 'LES QUATRE SAISONS',
  'chasseur-de-troncatures': 'CHASSEUR DE TRONCATURES',
  'survivant-y2k': 'SURVIVANT Y2K',
  s0c7: 'S0C7',
  'la-voie-du-88': 'LA VOIE DU 88',
  'tueur-de-go-to': 'TUEUR DE GO TO',
  'maitre-des-registres': 'MAITRE DES REGISTRES',
  'le-chiffreur': 'LE CHIFFREUR',
  'ciseaux-d-or': "CISEAUX D'OR",
  'maitre-des-fichiers': 'MAITRE DES FICHIERS',
  'gardien-des-cles': 'GARDIEN DES CLES',
  guichetier: 'GUICHETIER',
  'maitre-des-ruptures': 'MAITRE DES RUPTURES',
  'l-architecte': "L'ARCHITECTE",
  'diplome-de-la-piscine': 'DIPLOME DE LA PISCINE',
  'guichetier-d-or': "GUICHETIER D'OR",
  'architecte-de-la-paie': 'ARCHITECTE DE LA PAIE',
  'seigneur-du-fifo': 'SEIGNEUR DU FIFO',
  pontifex: 'PONTIFEX',
  necromancien: 'NECROMANCIEN',
  'gardien-du-mainframe': 'GARDIEN DU MAINFRAME',
  'premier-jcl': 'PREMIER JCL',
  'dompteur-de-vsam': 'DOMPTEUR DE VSAM'
}

describe('libelleBadge', () => {
  it('rend à chaque badge du manifeste son nom du livret', () => {
    const duManifeste = epreuves.flatMap((e) => e.badges)
    expect(duManifeste.length).toBeGreaterThan(0)
    for (const id of duManifeste) {
      expect(LIVRET[id], `badge ${id} absent du livret`).toBeDefined()
      expect(libelleBadge(id)).toBe(LIVRET[id])
    }
  })

  it('rend l’apostrophe aux articles élidés', () => {
    expect(libelleBadge('l-architecte')).toBe("L'ARCHITECTE")
    expect(libelleBadge('ciseaux-d-or')).toBe("CISEAUX D'OR")
  })

  it('ne bronche pas sur un identifiant vide ou biscornu', () => {
    expect(libelleBadge('')).toBe('')
    expect(libelleBadge(null)).toBe('')
    expect(libelleBadge(42)).toBe('')
    expect(libelleBadge('--badge--')).toBe('BADGE')
  })
})
