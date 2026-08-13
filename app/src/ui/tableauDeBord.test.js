import { describe, expect, it } from 'vitest'
import { epreuveParId, idsAvecQuiz, idsEpreuves } from '../data/programme.js'
import {
  definirBadge,
  definirExercice,
  enregistrerQuiz,
  etatInitial,
  ouvrirEpreuve
} from '../store/progression.js'
import {
  badgesDuProgramme,
  carriere,
  dernieresDecorations,
  epreuveDuBadge,
  epreuveDuMoment,
  lieuEpreuve,
  releveDeService,
  salles
} from './tableauDeBord.js'

// Coche les exercices d'une epreuve jusqu'a franchir son seuil de validation.
function valider(etat, idEpreuve) {
  const epreuve = epreuveParId(idEpreuve)
  return epreuve.exercices.reduce(
    (cumul, ex) => definirExercice(cumul, idEpreuve, ex.id, true),
    etat
  )
}

function ligne(releve, cle) {
  return releve.find((r) => r.cle === cle).valeur
}

describe('epreuveDuMoment', () => {
  it("ouvre sur J00 et sa commande BERTHA tant que rien n'est fait", () => {
    const moment = epreuveDuMoment(etatInitial())
    expect(moment.epreuve.id).toBe('J00')
    expect(moment.lieu).toBe('Couloir de la piscine')
    expect(moment.unite).toBe('XP')
    expect(moment.faits).toBe(0)
    expect(moment.total).toBe(epreuveParId('J00').seuilValidation)
    expect(moment.avancement).toBe(0)
    expect(moment.validee).toBe(false)
    expect(moment.commande).toBe('./bertha/bertha.sh J00/ex00')
  })

  it("jauge les XP d'exercices contre le seuil du jour", () => {
    let etat = valider(etatInitial(), 'J00')
    etat = ouvrirEpreuve(etat, 'J01')
    etat = definirExercice(etat, 'J01', 'ex00', true) // 10 XP sur un seuil de 70

    const moment = epreuveDuMoment(etat)
    expect(moment.epreuve.id).toBe('J01')
    expect(moment.faits).toBe(10)
    expect(moment.total).toBe(70)
    expect(moment.avancement).toBeCloseTo(10 / 70)
    expect(moment.prochainExercice.id).toBe('ex01')
    expect(moment.commande).toBe('./bertha/bertha.sh J01/ex01')
  })

  it("ne depasse jamais 1 quand les bonus poussent au-dela du seuil", () => {
    let etat = valider(etatInitial(), 'J00')
    etat = valider(etat, 'J01')
    etat = ouvrirEpreuve(etat, 'J01')

    const moment = epreuveDuMoment(etat)
    // L'epreuve ouverte est validee : le terminal passe a la suivante.
    expect(moment.epreuve.id).toBe('J02')
    expect(epreuveDuMoment(valider(etat, 'J02')).avancement).toBeLessThanOrEqual(1)
  })

  it('compte la phase 3 en jalons, sans moulinette', () => {
    const etat = idsEpreuves.reduce((cumul, id) => valider(cumul, id), etatInitial())
    const moment = epreuveDuMoment(etat)
    expect(moment.epreuve.id).toBe('PHASE3')
    expect(moment.unite).toBe('jalons')
    expect(moment.total).toBe(4)
    expect(moment.faits).toBe(4)
    expect(moment.validee).toBe(true)
    // Tout est coche : c'est le dernier jalon qui reste affiche, et la salle
    // machine IBM n'a pas de moulinette.
    expect(moment.prochainExercice.id).toBe('s4')
    expect(moment.commande).toBeNull()
  })
})

describe('dernieresDecorations', () => {
  it('ne renvoie rien tant que rien n’est decerne', () => {
    expect(dernieresDecorations(etatInitial())).toEqual([])
  })

  it('rend les trois dernieres, la plus avancee en tete', () => {
    let etat = definirBadge(etatInitial(), 'premiere-compile', true)
    etat = definirBadge(etat, 'colonne-7', true, 'honneur')
    etat = definirBadge(etat, 'les-quatre-saisons', true)
    etat = definirBadge(etat, 'survivant-y2k', true)

    const dernieres = dernieresDecorations(etat)
    expect(dernieres.map((d) => d.id)).toEqual([
      'survivant-y2k',
      'les-quatre-saisons',
      'colonne-7'
    ])
    expect(dernieres[0].libelle).toBe('SURVIVANT Y2K')
    expect(dernieres[0].glyphe).toBe('⌛')
    expect(dernieres[0].idEpreuve).toBe('J02')
    // La source vient du catalogue, pas de la progression : SURVIVANT Y2K se
    // mesure, COLONNE 7 se donne sur l'honneur.
    expect(dernieres[0].surLHonneur).toBe(false)
    expect(dernieres[2].surLHonneur).toBe(true)
  })

  it('en rend moins de trois quand il y en a moins', () => {
    const etat = definirBadge(etatInitial(), 'premiere-compile', true)
    expect(dernieresDecorations(etat)).toHaveLength(1)
  })
})

describe('epreuveDuBadge', () => {
  it('rattache a une epreuve tous les badges sauf celui de la piscine entiere', () => {
    expect(badgesDuProgramme).toHaveLength(26)
    for (const id of badgesDuProgramme) {
      if (id === 'dompteur-de-bertha') {
        expect(epreuveDuBadge(id)).toBeNull()
        continue
      }
      expect(epreuveParId(epreuveDuBadge(id))).not.toBeNull()
    }
  })

  it('ignore un badge inconnu', () => {
    expect(epreuveDuBadge('badge-de-nulle-part')).toBeNull()
  })
})

describe('lieuEpreuve', () => {
  it('nomme les trois lieux des sous-sols', () => {
    expect(lieuEpreuve(epreuveParId('J05'))).toBe('Couloir de la piscine')
    expect(lieuEpreuve(epreuveParId('M03'))).toBe('Bureaux des missions')
    expect(lieuEpreuve(epreuveParId('PHASE3'))).toBe('Salle machine IBM')
  })
})

describe('salles', () => {
  it('part de zero salle franchie', () => {
    expect(salles(etatInitial())).toEqual({
      validees: 0,
      restantes: idsEpreuves.length,
      total: idsEpreuves.length
    })
  })

  it('deplace une salle du reste vers les validees', () => {
    const etat = valider(etatInitial(), 'J00')
    expect(salles(etat).validees).toBe(1)
    expect(salles(etat).restantes).toBe(idsEpreuves.length - 1)
  })
})

describe('releveDeService', () => {
  it('compte a zero sur un etat neuf', () => {
    const releve = releveDeService(etatInitial())
    expect(ligne(releve, 'Salles validées')).toBe(`0 / ${idsEpreuves.length}`)
    expect(ligne(releve, 'Exercices cochés')).toBe('0')
    expect(ligne(releve, 'Quiz du soir réussis')).toBe(`0 / ${idsAvecQuiz.length}`)
    expect(ligne(releve, 'Décorations')).toBe(`0 / ${badgesDuProgramme.length}`)
  })

  it('suit les exercices, les quiz reussis et les decorations', () => {
    let etat = valider(etatInitial(), 'J00')
    etat = definirExercice(etat, 'J01', 'ex00', true)
    etat = enregistrerQuiz(etat, 'J01', 7)
    etat = enregistrerQuiz(etat, 'J02', 3) // rate : pas de credit
    etat = definirBadge(etat, 'premiere-compile', true)

    const releve = releveDeService(etat)
    expect(ligne(releve, 'Salles validées')).toBe(`1 / ${idsEpreuves.length}`)
    expect(ligne(releve, 'Exercices cochés')).toBe('2')
    expect(ligne(releve, 'Quiz du soir réussis')).toBe(`1 / ${idsAvecQuiz.length}`)
    expect(ligne(releve, 'Décorations')).toBe(`1 / ${badgesDuProgramme.length}`)
  })
})

describe('carriere', () => {
  it('demarre au premier echelon, sans XP', () => {
    const etat = carriere(etatInitial())
    expect(etat.echelon.niveau).toBe(0)
    expect(etat.xp).toBe(0)
    expect(etat.avancement).toBe(0)
    expect(etat.suivant.niveau).toBe(1)
    expect(etat.xpAvant).toBe(etat.suivant.xpRequis)
  })

  it('avance vers le barreau suivant a mesure que les XP tombent', () => {
    const etat = carriere(valider(etatInitial(), 'J00'))
    expect(etat.xp).toBe(30)
    expect(etat.avancement).toBeGreaterThan(0)
    expect(etat.xpAvant).toBe(etat.suivant.xpRequis - 30)
  })
})
