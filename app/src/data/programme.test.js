import { describe, expect, it } from 'vitest'
import { sujets } from './corpus.js'
import {
  commandeBertha,
  epreuveParId,
  epreuves,
  epreuvesPiscine,
  exerciceParId,
  exercicesBonus,
  exercicesObligatoires,
  idsEpreuves,
  xpMaximum
} from './programme.js'

// Le livret « progression/XP_ET_BADGES.md » fait foi (cahier des charges, §6).
// Recopie fidèle de son tableau 1, partie piscine : le manifeste doit s'y
// conformer exercice par exercice.
const LIVRET = {
  J00: { xpBase: 30, xpBonusMax: 0 },
  J01: { xpBase: 95, xpBonusMax: 30 },
  J02: { xpBase: 120, xpBonusMax: 40 },
  J03: { xpBase: 120, xpBonusMax: 30 },
  J04: { xpBase: 130, xpBonusMax: 30 },
  J05: { xpBase: 135, xpBonusMax: 30 },
  RUSH01: { xpBase: 120, xpBonusMax: 30 },
  J06: { xpBase: 130, xpBonusMax: 25 },
  J07: { xpBase: 120, xpBonusMax: 20 },
  J08: { xpBase: 130, xpBonusMax: 20 },
  J09: { xpBase: 130, xpBonusMax: 20 },
  RUSH02: { xpBase: 150, xpBonusMax: 30 },
  J10: { xpBase: 200, xpBonusMax: 0 }
}

// L'ordre obligatoire de la piscine (les rushs tombent après J05 et après J09).
const ORDRE = ['J00', 'J01', 'J02', 'J03', 'J04', 'J05', 'RUSH01', 'J06', 'J07', 'J08', 'J09', 'RUSH02', 'J10']

const somme = (liste) => liste.reduce((total, ex) => total + ex.xp, 0)

describe('manifeste de la piscine', () => {
  it('couvre les 13 épreuves, dans l’ordre du livret', () => {
    expect(idsEpreuves).toEqual(ORDRE)
    expect(epreuvesPiscine).toHaveLength(13)
    expect(epreuves).toHaveLength(epreuvesPiscine.length)
  })

  it('déclare les XP du livret pour chaque épreuve', () => {
    for (const epreuve of epreuvesPiscine) {
      expect(LIVRET[epreuve.id], `épreuve inconnue du livret : ${epreuve.id}`).toBeDefined()
      expect({ xpBase: epreuve.xpBase, xpBonusMax: epreuve.xpBonusMax }).toEqual(LIVRET[epreuve.id])
    }
  })

  it('fait tomber la somme des barèmes sur les XP annoncés', () => {
    for (const epreuve of epreuvesPiscine) {
      expect(somme(exercicesObligatoires(epreuve)), `base ${epreuve.id}`).toBe(epreuve.xpBase)
      expect(somme(exercicesBonus(epreuve)), `bonus ${epreuve.id}`).toBe(epreuve.xpBonusMax)
      expect(xpMaximum(epreuve)).toBe(epreuve.xpBase + epreuve.xpBonusMax)
    }
  })

  it('totalise les 1 900 XP de piscine annoncés par le livret', () => {
    const total = epreuvesPiscine.reduce((cumul, e) => cumul + xpMaximum(e), 0)
    // 1 610 XP de base + 305 XP de bonus : le « ≈ 1 900 » du livret.
    expect(total).toBe(1915)
  })

  it('pose un seuil de validation atteignable sans les bonus', () => {
    for (const epreuve of epreuvesPiscine) {
      expect(epreuve.seuilValidation, `seuil ${epreuve.id}`).toBeGreaterThan(0)
      expect(epreuve.seuilValidation).toBeLessThanOrEqual(epreuve.xpBase)
    }
    // Les seuils repris mot pour mot des sujets.
    expect(epreuveParId('J01').seuilValidation).toBe(70)
    expect(epreuveParId('J05').seuilValidation).toBe(95)
    expect(epreuveParId('J10').seuilValidation).toBe(120)
  })

  it('chaîne le déblocage séquentiel sans trou', () => {
    expect(epreuveParId('J00').prerequis).toBeNull()
    for (let i = 1; i < epreuvesPiscine.length; i += 1) {
      expect(epreuvesPiscine[i].prerequis).toBe(epreuvesPiscine[i - 1].id)
    }
  })

  it('pointe vers un sujet réellement embarqué', () => {
    for (const epreuve of epreuvesPiscine) {
      expect(Object.keys(sujets), `sujet ${epreuve.id}`).toContain(epreuve.chemin)
    }
  })

  it('garde des identifiants uniques', () => {
    expect(new Set(idsEpreuves).size).toBe(idsEpreuves.length)
    for (const epreuve of epreuvesPiscine) {
      const ids = epreuve.exercices.map((ex) => ex.id)
      expect(new Set(ids).size, `doublon dans ${epreuve.id}`).toBe(ids.length)
    }
  })

  it('donne à chaque exercice un titre, des XP positifs et une cible BERTHA', () => {
    for (const epreuve of epreuvesPiscine) {
      for (const exercice of epreuve.exercices) {
        expect(exercice.titre.length, `titre ${epreuve.id}/${exercice.id}`).toBeGreaterThan(2)
        expect(exercice.xp).toBeGreaterThan(0)
        expect(exercice.bertha).toMatch(/^(J\d\d|RUSH\d\d)(\/[a-z0-9]+)?$/)
        expect(exerciceParId(epreuve.id, exercice.id)).toBe(exercice)
      }
    }
  })

  it('respecte la règle typographique : aucun tiret cadratin', () => {
    expect(JSON.stringify(epreuvesPiscine)).not.toContain('—')
  })

  it('formate la commande BERTHA de la feuille de route', () => {
    expect(commandeBertha(exerciceParId('J03', 'ex05'))).toBe('./bertha/bertha.sh J03/ex05')
    expect(commandeBertha(exerciceParId('RUSH01', 'c1'))).toBe('./bertha/bertha.sh RUSH01')
  })

  it('ne connaît pas les épreuves absentes', () => {
    expect(epreuveParId('M01')).toBeNull()
    expect(exerciceParId('J01', 'ex42')).toBeNull()
  })
})
