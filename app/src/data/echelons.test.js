import { describe, expect, it } from 'vitest'
import {
  echelonInitial,
  echelonParNiveau,
  echelonSuivant,
  echelons,
  progressionVersEchelonSuivant,
  xpAvantEchelonSuivant
} from './echelons.js'
import { idsEpreuves } from './programme.js'

// Le livret « progression/XP_ET_BADGES.md » fait foi (cahier des charges, §6).
// Recopie fidèle de son tableau 2 : niveau, titre CGBA, XP requis.
const LIVRET = [
  [0, 'Candidat', 0],
  [1, 'Stagiaire', 150],
  [2, 'Apprenti opérateur', 400],
  [3, 'Pupitreur', 800],
  [4, 'Programmeur junior', 1500],
  [5, 'Programmeur', 2400],
  [6, 'Analyste-programmeur', 3200],
  [7, 'Gardien du mainframe', 4500],
  [8, 'Successeur de Marcel', null]
]

describe('les échelons de la CGBA', () => {
  it('reprend les 9 barreaux du livret, titres et XP compris', () => {
    expect(echelons).toHaveLength(9)
    expect(echelons.map((e) => [e.niveau, e.titre, e.xpRequis])).toEqual(LIVRET)
  })

  it('monte en XP sans jamais redescendre', () => {
    const plafonnes = echelons.filter((e) => e.xpRequis !== null)
    for (let i = 1; i < plafonnes.length; i += 1) {
      expect(plafonnes[i].xpRequis).toBeGreaterThan(plafonnes[i - 1].xpRequis)
    }
  })

  it('ne cite que des épreuves du manifeste', () => {
    for (const echelon of echelons) {
      for (const id of echelon.epreuvesRequises) {
        expect(idsEpreuves, `échelon ${echelon.niveau}`).toContain(id)
      }
    }
  })

  it('couvre toutes les épreuves notées, sans doublon', () => {
    const cites = echelons.flatMap((e) => e.epreuvesRequises)
    expect(new Set(cites).size).toBe(cites.length)
    // Toutes sauf la phase 3, qui se juge à ses badges et non à sa validation.
    expect([...cites].sort()).toEqual(idsEpreuves.filter((id) => id !== 'PHASE3').slice().sort())
  })

  it('réserve le dernier barreau aux deux badges Z Xplore', () => {
    const sommet = echelons[echelons.length - 1]
    expect(sommet.xpRequis).toBeNull()
    expect(sommet.badgesRequis).toEqual(['premier-jcl', 'dompteur-de-vsam'])
    for (const echelon of echelons.slice(0, -1)) {
      expect(echelon.badgesRequis, `échelon ${echelon.niveau}`).toEqual([])
    }
  })

  it('donne à chaque barreau une condition lisible, sans tiret cadratin', () => {
    for (const echelon of echelons) {
      expect(echelon.condition.length, `condition ${echelon.niveau}`).toBeGreaterThan(2)
    }
    expect(JSON.stringify(echelons)).not.toContain('—')
  })

  it('part du Candidat et se parcourt de barreau en barreau', () => {
    expect(echelonInitial).toBe(echelons[0])
    expect(echelonParNiveau(4).titre).toBe('Programmeur junior')
    expect(echelonParNiveau(9)).toBeNull()
    expect(echelonSuivant(echelons[0])).toBe(echelons[1])
    expect(echelonSuivant(echelons[8])).toBeNull()
  })

  it('compte les XP qui restent avant le barreau suivant', () => {
    expect(xpAvantEchelonSuivant(echelonParNiveau(0), 0)).toBe(150)
    expect(xpAvantEchelonSuivant(echelonParNiveau(0), 120)).toBe(30)
    // Le plancher franchi, il ne manque plus d'XP (la condition, si.)
    expect(xpAvantEchelonSuivant(echelonParNiveau(0), 900)).toBe(0)
    // Le sommet n'a pas de plancher d'XP, et rien ne le suit.
    expect(xpAvantEchelonSuivant(echelonParNiveau(7), 4500)).toBe(0)
    expect(xpAvantEchelonSuivant(echelonParNiveau(8), 9999)).toBe(0)
  })

  it('mesure la barre d’avancement entre deux barreaux', () => {
    expect(progressionVersEchelonSuivant(echelonParNiveau(1), 150)).toBe(0)
    expect(progressionVersEchelonSuivant(echelonParNiveau(1), 275)).toBe(0.5)
    expect(progressionVersEchelonSuivant(echelonParNiveau(1), 400)).toBe(1)
    // Bornée des deux côtés : ni négative, ni au-delà de 1.
    expect(progressionVersEchelonSuivant(echelonParNiveau(1), 0)).toBe(0)
    expect(progressionVersEchelonSuivant(echelonParNiveau(1), 5000)).toBe(1)
    expect(progressionVersEchelonSuivant(echelonParNiveau(8), 0)).toBe(1)
  })
})
