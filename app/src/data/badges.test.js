import { describe, expect, it } from 'vitest'
import {
  badgeAutomatique,
  badgeParId,
  badges,
  badgesDeLEpreuve,
  idsBadges,
  libelleBadge
} from './badges.js'
import { epreuveParId, epreuves, exerciceParId } from './programme.js'

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

// Le seul badge que le livret ne rattache à aucune épreuve : il couronne la
// piscine entière, aucune ligne du manifeste ne le porte.
const HORS_EPREUVE = { 'dompteur-de-bertha': 'DOMPTEUR DE BERTHA' }

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

describe('catalogue des badges', () => {
  it('porte les 26 décorations du livret, dans son ordre', () => {
    const attendus = { ...LIVRET, ...HORS_EPREUVE }
    expect(badges).toHaveLength(Object.keys(attendus).length)
    for (const badge of badges) {
      expect(attendus[badge.id], `badge ${badge.id} absent du livret`).toBeDefined()
      expect(badge.nom).toBe(attendus[badge.id])
    }
    // L'ordre du livret : la piscine, les missions, puis la phase 3.
    expect(idsBadges[0]).toBe('premiere-compile')
    expect(idsBadges[idsBadges.length - 1]).toBe('dompteur-de-vsam')
    expect(idsBadges.indexOf('dompteur-de-bertha')).toBeGreaterThan(
      idsBadges.indexOf('maitre-des-registres')
    )
    expect(idsBadges.indexOf('dompteur-de-bertha')).toBeLessThan(idsBadges.indexOf('le-chiffreur'))
  })

  it('accorde le catalogue et le manifeste du programme', () => {
    for (const epreuve of epreuves) {
      expect(badgesDeLEpreuve(epreuve.id).map((b) => b.id)).toEqual(epreuve.badges)
    }
    for (const badge of badges) {
      if (badge.idEpreuve === null) continue
      const epreuve = epreuveParId(badge.idEpreuve)
      expect(epreuve, `épreuve inconnue pour ${badge.id}`).not.toBeNull()
      expect(epreuve.badges).toContain(badge.id)
    }
  })

  it('ne mesure que des exercices qui existent', () => {
    for (const badge of badges) {
      if (badge.regle?.type !== 'exercices') continue
      for (const idExercice of badge.regle.exercices) {
        expect(
          exerciceParId(badge.idEpreuve, idExercice),
          `${badge.id} vise ${badge.idEpreuve}/${idExercice}`
        ).not.toBeNull()
      }
    }
  })

  it('laisse sur l’honneur ce que BERTHA ne peut pas juger', () => {
    const surLHonneur = badges.filter((b) => b.surLHonneur).map((b) => b.id)
    expect(surLHonneur).toEqual([
      'colonne-7',
      'chasseur-de-troncatures',
      'la-voie-du-88',
      'tueur-de-go-to',
      'dompteur-de-bertha'
    ])
    for (const id of surLHonneur) expect(badgeAutomatique(id)).toBe(false)
    expect(badgeAutomatique('premiere-compile')).toBe(true)
    expect(badgeAutomatique('inconnu')).toBe(false)
  })

  it('donne à chacun sa médaille, sa condition et son identité', () => {
    const glyphes = new Set()
    for (const badge of badges) {
      expect(badge.glyphe).toHaveLength(1)
      expect(glyphes.has(badge.glyphe), `glyphe en double : ${badge.glyphe}`).toBe(false)
      glyphes.add(badge.glyphe)
      expect(badge.condition.length).toBeGreaterThan(10)
      expect(badgeParId(badge.id)).toBe(badge)
    }
    expect(badgeParId('inconnu')).toBeNull()
  })
})
