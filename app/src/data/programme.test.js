import { describe, expect, it } from 'vitest'
import { sujets } from './corpus.js'
import {
  aUnQuiz,
  commandeBertha,
  epreuveParId,
  epreuvePhase3,
  epreuves,
  epreuvesDeLaPhase,
  epreuvesMissions,
  epreuvesPiscine,
  exerciceParId,
  exercicesBonus,
  exercicesObligatoires,
  idsAvecQuiz,
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
  J10: { xpBase: 200, xpBonusMax: 0 },
  M01: { xpBase: 300, xpBonusMax: 55 },
  M02: { xpBase: 400, xpBonusMax: 40 },
  M03: { xpBase: 350, xpBonusMax: 40 },
  M04: { xpBase: 350, xpBonusMax: 40 },
  M05: { xpBase: 400, xpBonusMax: 40 },
  M06: { xpBase: 800, xpBonusMax: 80 }
}

// L'ordre obligatoire de la piscine (les rushs tombent après J05 et après J09).
const ORDRE_PISCINE = ['J00', 'J01', 'J02', 'J03', 'J04', 'J05', 'RUSH01', 'J06', 'J07', 'J08', 'J09', 'RUSH02', 'J10']

// Puis les six missions de la phase 2, puis la phase 3.
const ORDRE_MISSIONS = ['M01', 'M02', 'M03', 'M04', 'M05', 'M06']
const ORDRE = [...ORDRE_PISCINE, ...ORDRE_MISSIONS, 'PHASE3']

const somme = (liste) => liste.reduce((total, ex) => total + ex.xp, 0)

describe('manifeste de la piscine', () => {
  it('couvre les 13 épreuves, dans l’ordre du livret', () => {
    expect(epreuvesPiscine.map((e) => e.id)).toEqual(ORDRE_PISCINE)
    expect(epreuvesDeLaPhase('piscine')).toEqual(epreuvesPiscine)
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

  it('donne à chaque exercice de piscine des XP positifs', () => {
    for (const epreuve of epreuvesPiscine) {
      for (const exercice of epreuve.exercices) {
        expect(exercice.xp, `xp ${epreuve.id}/${exercice.id}`).toBeGreaterThan(0)
        expect(exercice.bertha).toMatch(/^(J\d\d|RUSH\d\d)(\/[a-z0-9]+)?$/)
      }
    }
  })
})

describe('manifeste des missions', () => {
  it('couvre les 6 missions, dans l’ordre du livret', () => {
    expect(epreuvesMissions.map((e) => e.id)).toEqual(ORDRE_MISSIONS)
    expect(epreuvesDeLaPhase('missions')).toEqual(epreuvesMissions)
  })

  it('déclare les XP du livret pour chaque mission', () => {
    for (const epreuve of epreuvesMissions) {
      expect(LIVRET[epreuve.id], `mission inconnue du livret : ${epreuve.id}`).toBeDefined()
      expect({ xpBase: epreuve.xpBase, xpBonusMax: epreuve.xpBonusMax }).toEqual(LIVRET[epreuve.id])
    }
  })

  it('fait tomber la somme des critères de barème sur les XP annoncés', () => {
    for (const epreuve of epreuvesMissions) {
      expect(somme(exercicesObligatoires(epreuve)), `base ${epreuve.id}`).toBe(epreuve.xpBase)
      expect(somme(exercicesBonus(epreuve)), `bonus ${epreuve.id}`).toBe(epreuve.xpBonusMax)
    }
  })

  it('totalise les 2 900 XP de missions annoncés par le livret', () => {
    const total = epreuvesMissions.reduce((cumul, e) => cumul + xpMaximum(e), 0)
    // 2 600 XP de base + 295 XP de bonus : le « ≈ 2 900 » du livret.
    expect(total).toBe(2895)
  })

  it('applique la règle des 70 % du barème, faute de ligne de validation', () => {
    for (const epreuve of epreuvesMissions) {
      // En entiers : 0,7 sur des flottants tombe à côté pour 350 XP.
      expect(epreuve.seuilValidation, `seuil ${epreuve.id}`).toBe((epreuve.xpBase * 7) / 10)
    }
    expect(epreuveParId('M06').seuilValidation).toBe(560)
  })

  it('confie chaque mission à sa propre cible BERTHA', () => {
    for (const epreuve of epreuvesMissions) {
      for (const exercice of epreuve.exercices) {
        expect(exercice.xp, `xp ${epreuve.id}/${exercice.id}`).toBeGreaterThan(0)
        expect(exercice.bertha).toBe(epreuve.id)
      }
    }
    expect(commandeBertha(exerciceParId('M03', 'c1'))).toBe('./bertha/bertha.sh M03')
  })
})

describe('manifeste de la phase 3', () => {
  it('ferme la marche, sans XP et sans moulinette', () => {
    expect(epreuvesDeLaPhase('phase3')).toEqual([epreuvePhase3])
    expect(epreuves[epreuves.length - 1]).toBe(epreuvePhase3)
    expect(epreuvePhase3.xpBase).toBe(0)
    expect(epreuvePhase3.xpBonusMax).toBe(0)
    expect(epreuvePhase3.seuilValidation).toBe(0)
    expect(epreuvePhase3.surLHonneur).toBe(true)
    for (const exercice of epreuvePhase3.exercices) {
      expect(exercice.xp).toBe(0)
      expect(commandeBertha(exercice)).toBeNull()
    }
  })

  it('porte les deux badges qui ouvrent le neuvième échelon', () => {
    expect(epreuvePhase3.badges).toEqual(['premier-jcl', 'dompteur-de-vsam'])
  })
})

describe('manifeste complet', () => {
  it('enchaîne les 20 épreuves dans l’ordre, sans trou de déblocage', () => {
    expect(idsEpreuves).toEqual(ORDRE)
    expect(epreuves).toHaveLength(20)
    expect(epreuves[0].prerequis).toBeNull()
    for (let i = 1; i < epreuves.length; i += 1) {
      expect(epreuves[i].prerequis, `prérequis ${epreuves[i].id}`).toBe(epreuves[i - 1].id)
    }
  })

  it('garde des identifiants uniques', () => {
    expect(new Set(idsEpreuves).size).toBe(idsEpreuves.length)
    for (const epreuve of epreuves) {
      const ids = epreuve.exercices.map((ex) => ex.id)
      expect(new Set(ids).size, `doublon dans ${epreuve.id}`).toBe(ids.length)
    }
  })

  it('donne à chaque exercice un titre et un accès par identifiant', () => {
    for (const epreuve of epreuves) {
      expect(epreuve.titre.length, `titre ${epreuve.id}`).toBeGreaterThan(2)
      for (const exercice of epreuve.exercices) {
        expect(exercice.titre.length, `titre ${epreuve.id}/${exercice.id}`).toBeGreaterThan(2)
        expect(exerciceParId(epreuve.id, exercice.id)).toBe(exercice)
      }
    }
  })

  it('pointe vers un sujet réellement embarqué', () => {
    for (const epreuve of epreuves) {
      expect(Object.keys(sujets), `sujet ${epreuve.id}`).toContain(epreuve.chemin)
    }
  })

  it('respecte la règle typographique : aucun tiret cadratin', () => {
    expect(JSON.stringify(epreuves)).not.toContain('—')
  })

  it('formate la commande BERTHA de la feuille de route', () => {
    expect(commandeBertha(exerciceParId('J03', 'ex05'))).toBe('./bertha/bertha.sh J03/ex05')
    expect(commandeBertha(exerciceParId('RUSH01', 'c1'))).toBe('./bertha/bertha.sh RUSH01')
  })

  it('ne connaît pas les épreuves absentes', () => {
    expect(epreuveParId('M07')).toBeNull()
    expect(exerciceParId('J01', 'ex42')).toBeNull()
  })

  it('réserve le quiz du soir à J01-J09 et aux deux rushs', () => {
    expect(idsAvecQuiz).toHaveLength(11)
    for (const id of idsAvecQuiz) expect(idsEpreuves).toContain(id)
    for (const id of ['J01', 'J05', 'J09', 'RUSH01', 'RUSH02']) expect(aUnQuiz(id)).toBe(true)
    for (const id of ['J00', 'J10', 'M01', 'M06', 'PHASE3', 'inconnue']) {
      expect(aUnQuiz(id), `quiz de trop sur ${id}`).toBe(false)
    }
  })
})
