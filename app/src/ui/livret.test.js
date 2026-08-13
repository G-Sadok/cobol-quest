import { describe, expect, it } from 'vitest'
import { badgeParId, badges } from '../data/badges.js'
import { echelons } from '../data/echelons.js'
import { epreuveParId } from '../data/programme.js'
import { basculerBadge, definirExercice, etatInitial } from '../store/progression.js'
import {
  compteDecorations,
  grilleDesBadges,
  grilleDesEchelons,
  ligneEchelon,
  livret,
  origineBadge,
  tuileParId,
  verdictBadge
} from './livret.js'

// Coche tous les exercices non-bonus des epreuves demandees.
function valider(etat, ...ids) {
  return ids.reduce(
    (cumul, id) =>
      epreuveParId(id).exercices.reduce(
        (interne, ex) => (ex.estBonus ? interne : definirExercice(interne, id, ex.id, true)),
        cumul
      ),
    etat
  )
}

describe('la grille des decorations', () => {
  it('pose les 26 tuiles du catalogue, dans l ordre du livret', () => {
    const grille = grilleDesBadges(etatInitial())
    expect(grille).toHaveLength(badges.length)
    expect(grille.map((t) => t.id)).toEqual(badges.map((b) => b.id))
    for (const tuile of grille) {
      expect(tuile.obtenu).toBe(false)
      expect(tuile.condition).toBe(badgeParId(tuile.id).condition)
    }
  })

  it('allume la tuile des que le travail est rendu', () => {
    const etat = valider(etatInitial(), 'J00')
    expect(tuileParId(etat, 'premiere-compile').obtenu).toBe(true)
    expect(tuileParId(etat, 'colonne-7').obtenu).toBe(false)
    expect(tuileParId(etat, 'badge-fantome')).toBeNull()
  })

  it('ne rend cliquables que les decorations sur l honneur', () => {
    const grille = grilleDesBadges(etatInitial())
    const cliquables = grille.filter((t) => t.basculable).map((t) => t.id)
    expect(cliquables).toEqual([
      'colonne-7',
      'chasseur-de-troncatures',
      'la-voie-du-88',
      'tueur-de-go-to',
      'dompteur-de-bertha'
    ])
    expect(grille.find((t) => t.id === 'premiere-compile').mention).toBe('BERTHA la donnera')
    expect(grille.find((t) => t.id === 'colonne-7').mention).toBe("À cocher sur l'honneur")
  })

  it('change la mention une fois la decoration accordee', () => {
    const etat = basculerBadge(etatInitial(), 'colonne-7')
    expect(tuileParId(etat, 'colonne-7').mention).toBe("Accordée sur l'honneur")
    expect(tuileParId(valider(etatInitial(), 'J00'), 'premiere-compile').mention).toBe(
      'Accordée par BERTHA'
    )
  })

  it('dit d ou vient chaque decoration', () => {
    expect(origineBadge(badgeParId('premiere-compile'))).toBe("J00 · L'embauche")
    expect(origineBadge(badgeParId('dompteur-de-bertha'))).toBe('Toute la piscine')
    expect(origineBadge(badgeParId('premier-jcl'))).toBe('Phase 3')
  })

  it('compte les decorations obtenues', () => {
    expect(compteDecorations(etatInitial())).toEqual({
      obtenues: 0,
      total: 26,
      libelle: 'DECORATIONS · 0 SUR 26'
    })
    const etat = basculerBadge(valider(etatInitial(), 'J00'), 'colonne-7')
    expect(compteDecorations(etat).obtenues).toBe(2)
    expect(compteDecorations(etat).libelle).toBe('DECORATIONS · 2 SUR 26')
  })

  it('annonce l octroi et la reprise sur l honneur', () => {
    const badge = badgeParId('tueur-de-go-to')
    expect(verdictBadge(badge, true)).toEqual({
      ton: 'oui',
      texte: "TUEUR DE GO TO · SUR L'HONNEUR"
    })
    expect(verdictBadge(badge, false)).toEqual({ ton: 'non', texte: 'TUEUR DE GO TO · REPRISE' })
  })
})

describe('la grille des echelons', () => {
  it('pose les neuf barreaux du livret', () => {
    const grille = grilleDesEchelons(etatInitial())
    expect(grille).toHaveLength(echelons.length)
    expect(grille[0]).toMatchObject({ rang: '00', titre: 'Candidat', position: 'actuel' })
    expect(grille[1].position).toBe('a-venir')
    expect(grille.map((l) => l.marque)).toEqual(['VOUS', '', '', '', '', '', '', '', ''])
  })

  it('espace les milliers et laisse le dernier seuil vide', () => {
    const grille = grilleDesEchelons(etatInitial())
    expect(grille[1].seuil).toBe('150 XP')
    // L'espace des milliers est fine et insecable (ui/format.js).
    expect(grille[4].seuil).toBe('1 500 XP')
    expect(grille[8].seuil).toBe('')
  })

  it('marque le barreau tenu et ceux qui sont derriere', () => {
    const etat = valider(etatInitial(), 'J00', 'J01', 'J02')
    const grille = grilleDesEchelons(etat)
    expect(grille[0].position).toBe('passe')
    expect(grille[0].marque).toBe('✓')
    expect(grille[1].position).toBe('actuel')
    expect(grille[1].marque).toBe('VOUS')
    expect(grille[2].position).toBe('a-venir')
  })

  it('distingue les XP tenus de la condition de passage', () => {
    // 245 XP apres J00 a J02 : le plancher du barreau 2 (400 XP) n'y est pas,
    // mais la ligne dit deja si les XP suivent.
    const etat = valider(etatInitial(), 'J00', 'J01', 'J02')
    const grille = grilleDesEchelons(etat)
    expect(grille[1].xpTenus).toBe(true)
    expect(grille[2].xpTenus).toBe(false)
    expect(grille[8].xpTenus).toBe(false)
    expect(ligneEchelon(echelons[3], echelons[0], 999).xpTenus).toBe(true)
  })
})

describe('le livret entier', () => {
  it('rassemble le compte, les deux grilles et l echelon tenu', () => {
    const etat = valider(etatInitial(), 'J00')
    const tout = livret(etat)
    expect(tout.compte.obtenues).toBe(1)
    expect(tout.decorations).toHaveLength(26)
    expect(tout.echelons).toHaveLength(9)
    expect(tout.echelon.niveau).toBe(0)
    expect(tout.xp).toBe(30)
  })
})
