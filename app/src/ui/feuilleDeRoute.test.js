import { describe, expect, it } from 'vitest'
import { epreuveParId, epreuves, exercicesObligatoires } from '../data/programme.js'
import { definirExercice, enregistrerQuiz, etatInitial } from '../store/progression.js'
import {
  accordValide,
  encartBertha,
  feuilleDeRoute,
  jaugeSeuil,
  ligneExercice,
  nomEpreuve,
  verdictBascule
} from './feuilleDeRoute.js'

// Coche une liste d'exercices d'une epreuve d'un seul geste.
function cocher(etat, idEpreuve, ...idsExercices) {
  return idsExercices.reduce((cumul, id) => definirExercice(cumul, idEpreuve, id, true), etat)
}

describe('le nom commun d’une epreuve', () => {
  it('distingue la journee, le rush, la mission et la phase 3', () => {
    expect(nomEpreuve(epreuveParId('J03'))).toBe('la journée')
    expect(nomEpreuve(epreuveParId('RUSH01'))).toBe('le rush')
    expect(nomEpreuve(epreuveParId('M02'))).toBe('la mission')
    expect(nomEpreuve(epreuveParId('PHASE3'))).toBe('la phase 3')
  })

  it('accorde le participe avec le genre du nom', () => {
    expect(accordValide(epreuveParId('J03'))).toBe('validée')
    expect(accordValide(epreuveParId('RUSH01'))).toBe('validé')
  })
})

describe('une ligne de la feuille de route', () => {
  const epreuve = epreuveParId('J01')

  it('porte le titre, les XP et la commande BERTHA de l’exercice', () => {
    const ligne = ligneExercice(etatInitial(), epreuve, epreuve.exercices[0])
    expect(ligne.id).toBe('ex00')
    expect(ligne.xpLibelle).toBe('+10 XP')
    expect(ligne.estBonus).toBe(false)
    expect(ligne.coche).toBe(false)
    expect(ligne.commande).toBe('./bertha/bertha.sh J01/ex00')
  })

  it('suit l’etat de la case', () => {
    const etat = cocher(etatInitial(), 'J01', 'ex00')
    expect(ligneExercice(etat, epreuve, epreuve.exercices[0]).coche).toBe(true)
  })

  it('annonce le bonus aux lecteurs d’ecran', () => {
    const bonus = epreuve.exercices.find((ex) => ex.estBonus)
    expect(ligneExercice(etatInitial(), epreuve, bonus).annonce).toContain('bonus')
  })
})

describe('la jauge du seuil', () => {
  it('part vide et pose son repere sur le seuil du jour', () => {
    const jauge = jaugeSeuil(etatInitial(), 'J01')
    expect(jauge.acquis).toBe(0)
    expect(jauge.remplissage).toBe(0)
    expect(jauge.seuil).toBe(70)
    // 70 XP de seuil sur les 95 XP du bareme obligatoire.
    expect(jauge.repere).toBeCloseTo((70 / 95) * 100, 6)
    expect(jauge.validee).toBe(false)
    expect(jauge.compteur).toBe('0 / 6')
  })

  it('monte avec les XP coches et retombe quand on decoche', () => {
    const coche = cocher(etatInitial(), 'J01', 'ex00', 'ex01')
    expect(jaugeSeuil(coche, 'J01').acquis).toBe(25)
    const decoche = definirExercice(coche, 'J01', 'ex01', false)
    expect(jaugeSeuil(decoche, 'J01').acquis).toBe(10)
  })

  it('passe VALIDE au seuil, sans attendre le dernier exercice', () => {
    const etat = cocher(etatInitial(), 'J01', 'ex01', 'ex02', 'ex03', 'ex04')
    expect(jaugeSeuil(etat, 'J01').acquis).toBe(70)
    expect(jaugeSeuil(etat, 'J01').validee).toBe(true)
  })

  it('ne laisse jamais les bonus deborder de la piste', () => {
    const epreuve = epreuveParId('J01')
    const etat = cocher(etatInitial(), 'J01', ...epreuve.exercices.map((ex) => ex.id))
    const jauge = jaugeSeuil(etat, 'J01')
    expect(jauge.acquis).toBe(125)
    expect(jauge.remplissage).toBe(100)
  })

  it('ignore les XP du quiz du soir, qui ne valident rien', () => {
    const etat = enregistrerQuiz(etatInitial(), 'J01', 8)
    expect(jaugeSeuil(etat, 'J01').acquis).toBe(0)
    expect(jaugeSeuil(etat, 'J01').validee).toBe(false)
  })

  it('compte la phase 3 en jalons, faute de moulinette', () => {
    const jauge = jaugeSeuil(etatInitial(), 'PHASE3')
    expect(jauge.surLHonneur).toBe(true)
    expect(jauge.total).toBe(exercicesObligatoires(epreuveParId('PHASE3')).length)
    expect(jauge.seuil).toBe(jauge.total)
    expect(jauge.repere).toBe(100)
    expect(jauge.legende).toContain('jalons')
  })

  it('remplit la phase 3 jalon par jalon', () => {
    const epreuve = epreuveParId('PHASE3')
    const obligatoires = exercicesObligatoires(epreuve)
    const etat = cocher(etatInitial(), 'PHASE3', ...obligatoires.map((ex) => ex.id))
    const jauge = jaugeSeuil(etat, 'PHASE3')
    expect(jauge.remplissage).toBe(100)
    expect(jauge.validee).toBe(true)
  })

  it('renvoie null pour une epreuve inconnue', () => {
    expect(jaugeSeuil(etatInitial(), 'J99')).toBe(null)
  })
})

describe('l’encart BERTHA', () => {
  it('donne la commande du prochain exercice a rendre', () => {
    const encart = encartBertha(etatInitial(), 'J01')
    expect(encart.exercice.id).toBe('ex00')
    expect(encart.commande).toBe('./bertha/bertha.sh J01/ex00')
    expect(encart.texte).toContain('RC=0000')
  })

  it('avance avec les cases cochees', () => {
    const etat = cocher(etatInitial(), 'J01', 'ex00', 'ex01')
    expect(encartBertha(etat, 'J01').commande).toBe('./bertha/bertha.sh J01/ex02')
  })

  it('propose de repasser derriere soi quand tout est coche', () => {
    const epreuve = epreuveParId('J01')
    const etat = cocher(etatInitial(), 'J01', ...epreuve.exercices.map((ex) => ex.id))
    const encart = encartBertha(etat, 'J01')
    expect(encart.exercice.id).toBe('bonus')
    expect(encart.texte).toContain('repasse')
  })

  it('dit que la phase 3 se coche sur l’honneur', () => {
    const encart = encartBertha(etatInitial(), 'PHASE3')
    expect(encart.commande).toBe(null)
    expect(encart.texte).toContain('l’honneur')
  })
})

describe('le verdict du toast', () => {
  it('credite en vert et retire en rouge', () => {
    const exercice = epreuveParId('J01').exercices[1]
    expect(verdictBascule(exercice, true)).toEqual({
      ton: 'oui',
      texte: 'BERTHA DIT OUI · EX01 · +15 XP'
    })
    expect(verdictBascule(exercice, false)).toEqual({
      ton: 'non',
      texte: 'BERTHA DIT NON · EX01 · -15 XP'
    })
  })
})

describe('la feuille de route entiere', () => {
  it('separe les exercices obligatoires des bonus', () => {
    const feuille = feuilleDeRoute(etatInitial(), 'J02')
    expect(feuille.obligatoires).toHaveLength(7)
    expect(feuille.bonus).toHaveLength(2)
    expect(feuille.bonus.every((ligne) => ligne.estBonus)).toBe(true)
  })

  it('compte le quiz du soir dans le total du jour, pas dans la jauge', () => {
    let etat = cocher(etatInitial(), 'J01', 'ex00')
    etat = enregistrerQuiz(etat, 'J01', 7)
    const feuille = feuilleDeRoute(etat, 'J01')
    expect(feuille.xpTotal).toBe(20)
    expect(feuille.xpQuiz).toBe(10)
    expect(feuille.jauge.acquis).toBe(10)
  })

  it('leve le tampon avec les XP reellement gagnes', () => {
    let etat = cocher(etatInitial(), 'J01', 'ex01', 'ex02', 'ex03', 'ex04')
    expect(feuilleDeRoute(etat, 'J01').tampon).toBe('VALIDE +70')
    etat = enregistrerQuiz(etat, 'J01', 8)
    expect(feuilleDeRoute(etat, 'J01').tampon).toBe('VALIDE +80')
  })

  it('donne un tampon sans chiffre a la phase 3, qui ne rapporte rien', () => {
    const obligatoires = exercicesObligatoires(epreuveParId('PHASE3'))
    const etat = cocher(etatInitial(), 'PHASE3', ...obligatoires.map((ex) => ex.id))
    expect(feuilleDeRoute(etat, 'PHASE3').tampon).toBe('VALIDE')
  })

  it('ne leve aucun tampon tant que le seuil n’est pas franchi', () => {
    expect(feuilleDeRoute(etatInitial(), 'J01').tampon).toBe(null)
  })

  it('tient debout pour les vingt epreuves du programme', () => {
    for (const epreuve of epreuves) {
      const feuille = feuilleDeRoute(etatInitial(), epreuve.id)
      expect(feuille.obligatoires.length).toBeGreaterThan(0)
      expect(feuille.jauge).not.toBe(null)
      expect(feuille.bertha).not.toBe(null)
    }
  })

  it('renvoie null pour une epreuve inconnue', () => {
    expect(feuilleDeRoute(etatInitial(), 'M99')).toBe(null)
  })
})
