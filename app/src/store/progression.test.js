import { describe, expect, it } from 'vitest'
import { echelons } from '../data/echelons.js'
import { epreuveParId, exercicesObligatoires, idsEpreuves } from '../data/programme.js'
import {
  REGLAGES_PAR_DEFAUT,
  VERSION_PROGRESSION,
  XP_QUIZ,
  badgeObtenu,
  badgesObtenus,
  basculerBadge,
  basculerExercice,
  definirBadge,
  definirExercice,
  definirReglage,
  deserialiser,
  echelonCourant,
  enregistrerQuiz,
  epreuveCourante,
  epreuveDebloquee,
  epreuveValidee,
  epreuvesDebloquees,
  etatEpreuve,
  etatInitial,
  exerciceCoche,
  ouvrirEpreuve,
  quizEpreuve,
  quizReussi,
  remiseAZero,
  serialiser,
  xpExercices,
  xpParEpreuve,
  xpQuiz,
  xpTotal
} from './progression.js'

// Coche tous les exercices d'une epreuve, bonus compris ou non.
function toutCocher(etat, idEpreuve, { bonus = true } = {}) {
  return epreuveParId(idEpreuve).exercices.reduce(
    (cumul, ex) => (ex.estBonus && !bonus ? cumul : definirExercice(cumul, idEpreuve, ex.id, true)),
    etat
  )
}

// Valide d'un coup toutes les epreuves demandees, sans les bonus.
function valider(etat, ...ids) {
  return ids.reduce((cumul, id) => toutCocher(cumul, id, { bonus: false }), etat)
}

describe('le store de progression', () => {
  describe('etat initial', () => {
    it('part de zero, tout verrouille sauf le premier jour', () => {
      const etat = etatInitial()
      expect(etat.version).toBe(VERSION_PROGRESSION)
      expect(xpTotal(etat)).toBe(0)
      expect(badgesObtenus(etat)).toEqual([])
      expect(etat.reglages).toEqual(REGLAGES_PAR_DEFAUT)
      expect(epreuvesDebloquees(etat)).toEqual(['J00'])
      expect(etatEpreuve(etat, 'J00')).toBe('disponible')
      expect(etatEpreuve(etat, 'J01')).toBe('verrouillee')
      expect(epreuveCourante(etat).id).toBe('J00')
    })

    it('rend un etat neuf a chaque appel', () => {
      const premier = etatInitial()
      const second = etatInitial()
      expect(premier).not.toBe(second)
      expect(premier.epreuves).not.toBe(second.epreuves)
    })
  })

  describe('cumul et retrait des XP', () => {
    it('credite un exercice coche et le retire quand on le decoche', () => {
      const etat = etatInitial()
      const coche = definirExercice(etat, 'J01', 'ex03', true)
      expect(xpParEpreuve(coche, 'J01')).toBe(20)
      expect(xpTotal(coche)).toBe(20)
      expect(exerciceCoche(coche, 'J01', 'ex03')).toBe(true)

      const decoche = definirExercice(coche, 'J01', 'ex03', false)
      expect(xpTotal(decoche)).toBe(0)
      expect(exerciceCoche(decoche, 'J01', 'ex03')).toBe(false)
    })

    it('cumule les bonus par-dessus le bareme de base', () => {
      const etat = toutCocher(etatInitial(), 'J01')
      const epreuve = epreuveParId('J01')
      expect(xpExercices(etat, 'J01')).toBe(epreuve.xpBase + epreuve.xpBonusMax)
    })

    it('additionne les epreuves entre elles', () => {
      const etat = valider(etatInitial(), 'J00', 'J01', 'J02')
      expect(xpTotal(etat)).toBe(30 + 95 + 120)
    })

    it('ne modifie jamais l etat recu', () => {
      const etat = etatInitial()
      const copie = JSON.parse(JSON.stringify(etat))
      definirExercice(etat, 'J01', 'ex00', true)
      expect(etat).toEqual(copie)
    })

    it('renvoie l etat tel quel quand rien ne change', () => {
      const etat = definirExercice(etatInitial(), 'J01', 'ex00', true)
      expect(definirExercice(etat, 'J01', 'ex00', true)).toBe(etat)
      expect(definirExercice(etat, 'J01', 'ex42', true)).toBe(etat)
      expect(definirExercice(etat, 'ZZ99', 'ex00', true)).toBe(etat)
    })

    it('bascule une case d un clic', () => {
      const coche = basculerExercice(etatInitial(), 'J02', 'ex01')
      expect(xpTotal(coche)).toBe(20)
      expect(xpTotal(basculerExercice(coche, 'J02', 'ex01'))).toBe(0)
    })

    it('ne garde aucune fiche vide apres un aller-retour', () => {
      const etat = etatInitial()
      const apres = definirExercice(definirExercice(etat, 'J01', 'ex00', true), 'J01', 'ex00', false)
      expect(apres.epreuves).toEqual({})
    })
  })

  describe('seuils de validation', () => {
    it('valide au seuil du jour, pas avant', () => {
      // J01 : seuil 70 XP. ex00 + ex01 + ex02 = 40, il en manque.
      let etat = definirExercice(etatInitial(), 'J01', 'ex00', true)
      etat = definirExercice(etat, 'J01', 'ex01', true)
      etat = definirExercice(etat, 'J01', 'ex02', true)
      expect(xpExercices(etat, 'J01')).toBe(40)
      expect(epreuveValidee(etat, 'J01')).toBe(false)

      etat = definirExercice(etat, 'J01', 'ex03', true)
      etat = definirExercice(etat, 'J01', 'ex04', true)
      etat = definirExercice(etat, 'J01', 'ex05', true)
      expect(xpExercices(etat, 'J01')).toBe(95)
      expect(epreuveValidee(etat, 'J01')).toBe(true)
    })

    it('accepte un seuil atteint grace aux bonus', () => {
      // J01 : le bonus vaut 30, plus ex03 et ex04 (40) = 70, pile le seuil.
      let etat = definirExercice(etatInitial(), 'J01', 'bonus', true)
      etat = definirExercice(etat, 'J01', 'ex03', true)
      etat = definirExercice(etat, 'J01', 'ex04', true)
      expect(xpExercices(etat, 'J01')).toBe(70)
      expect(epreuveValidee(etat, 'J01')).toBe(true)
    })

    it('devalide l epreuve quand on repasse sous le seuil', () => {
      const validee = valider(etatInitial(), 'J00')
      expect(epreuveValidee(validee, 'J00')).toBe(true)
      const defaite = definirExercice(validee, 'J00', 'ex00', false)
      expect(epreuveValidee(defaite, 'J00')).toBe(false)
    })

    it('juge la phase 3 sur l honneur, sans XP', () => {
      let etat = etatInitial()
      expect(epreuveValidee(etat, 'PHASE3')).toBe(false)
      etat = toutCocher(etat, 'PHASE3')
      expect(epreuveValidee(etat, 'PHASE3')).toBe(true)
      expect(xpParEpreuve(etat, 'PHASE3')).toBe(0)
      etat = definirExercice(etat, 'PHASE3', 's4', false)
      expect(epreuveValidee(etat, 'PHASE3')).toBe(false)
    })

    it('ne valide pas une epreuve inconnue', () => {
      expect(epreuveValidee(etatInitial(), 'M42')).toBe(false)
      expect(xpExercices(etatInitial(), 'M42')).toBe(0)
    })
  })

  describe('deblocage sequentiel', () => {
    it('ouvre l epreuve suivante des que la precedente est validee', () => {
      const etat = valider(etatInitial(), 'J00')
      expect(epreuvesDebloquees(etat)).toEqual(['J00', 'J01'])
      expect(etatEpreuve(etat, 'J00')).toBe('validee')
      expect(etatEpreuve(etat, 'J01')).toBe('disponible')
      expect(epreuveCourante(etat).id).toBe('J01')
    })

    it('n ouvre rien au-dela du premier verrou', () => {
      const etat = valider(etatInitial(), 'J00', 'J01')
      expect(epreuveDebloquee(etat, 'J02')).toBe(true)
      expect(epreuveDebloquee(etat, 'J03')).toBe(false)
      expect(epreuveDebloquee(etat, 'M01')).toBe(false)
      expect(epreuveDebloquee(etat, 'PHASE3')).toBe(false)
    })

    it('referme ce qui suit quand une validation tombe', () => {
      const etat = valider(etatInitial(), 'J00', 'J01')
      const defaite = definirExercice(etat, 'J00', 'ex00', false)
      expect(epreuveDebloquee(defaite, 'J01')).toBe(false)
      // Les XP de J01 restent acquis : c'est l'acces au sujet qui se referme.
      expect(xpParEpreuve(defaite, 'J01')).toBe(95)
    })

    it('ouvre la piscine entiere puis les missions', () => {
      const piscine = valider(etatInitial(), ...idsEpreuves.slice(0, 13))
      expect(epreuvesDebloquees(piscine)).toHaveLength(14)
      expect(epreuveDebloquee(piscine, 'M01')).toBe(true)
      expect(epreuveDebloquee(piscine, 'M02')).toBe(false)
    })

    it('distingue les quatre etats de salle', () => {
      let etat = etatInitial()
      expect(etatEpreuve(etat, 'J01')).toBe('verrouillee')
      etat = valider(etat, 'J00')
      expect(etatEpreuve(etat, 'J01')).toBe('disponible')
      etat = definirExercice(etat, 'J01', 'ex00', true)
      expect(etatEpreuve(etat, 'J01')).toBe('en-cours')
      etat = valider(etat, 'J01')
      expect(etatEpreuve(etat, 'J01')).toBe('validee')
    })

    it('compte le sujet seulement ouvert comme une salle en cours', () => {
      const etat = ouvrirEpreuve(etatInitial(), 'J00')
      expect(etatEpreuve(etat, 'J00')).toBe('en-cours')
      expect(epreuveCourante(etat).id).toBe('J00')
    })

    it('reprend la derniere epreuve ouverte tant qu elle reste a faire', () => {
      let etat = valider(etatInitial(), 'J00', 'J01')
      etat = ouvrirEpreuve(etat, 'J02')
      expect(epreuveCourante(etat).id).toBe('J02')
      // Une fois J02 validee, le Terminal pousse vers la suivante.
      etat = valider(etat, 'J02')
      expect(epreuveCourante(etat).id).toBe('J03')
      // Une epreuve encore verrouillee ne prend pas la main.
      etat = ouvrirEpreuve(etat, 'M06')
      expect(epreuveCourante(etat).id).toBe('J03')
      expect(ouvrirEpreuve(etat, 'ZZ99').epreuveOuverte).toBeNull()
    })

    it('retombe sur la derniere epreuve quand tout est fini', () => {
      let etat = valider(etatInitial(), ...idsEpreuves.filter((id) => id !== 'PHASE3'))
      etat = toutCocher(etat, 'PHASE3')
      expect(epreuvesDebloquees(etat)).toEqual(idsEpreuves)
      expect(epreuveCourante(etat).id).toBe('PHASE3')
    })
  })

  describe('quiz du soir', () => {
    it('ne credite les 10 XP qu une seule fois, quel que soit le nombre d essais', () => {
      let etat = valider(etatInitial(), 'J00', 'J01')
      const xpSansQuiz = xpTotal(etat)

      etat = enregistrerQuiz(etat, 'J01', 5)
      expect(quizReussi(etat, 'J01')).toBe(false)
      expect(xpTotal(etat)).toBe(xpSansQuiz)

      etat = enregistrerQuiz(etat, 'J01', 6)
      expect(quizReussi(etat, 'J01')).toBe(true)
      expect(xpQuiz(etat, 'J01')).toBe(XP_QUIZ)
      expect(xpTotal(etat)).toBe(xpSansQuiz + XP_QUIZ)

      etat = enregistrerQuiz(etat, 'J01', 8)
      etat = enregistrerQuiz(etat, 'J01', 8)
      expect(xpTotal(etat)).toBe(xpSansQuiz + XP_QUIZ)
      expect(quizEpreuve(etat, 'J01')).toEqual({
        tentatives: 4,
        meilleurScore: 8,
        xpCredite: true
      })
    })

    it('garde le meilleur score et ne le reprend jamais', () => {
      let etat = enregistrerQuiz(etatInitial(), 'J02', 7)
      etat = enregistrerQuiz(etat, 'J02', 2)
      expect(quizEpreuve(etat, 'J02').meilleurScore).toBe(7)
      expect(quizReussi(etat, 'J02')).toBe(true)
    })

    it('borne le score entre 0 et 8', () => {
      expect(quizEpreuve(enregistrerQuiz(etatInitial(), 'J03', 99), 'J03').meilleurScore).toBe(8)
      expect(quizEpreuve(enregistrerQuiz(etatInitial(), 'J03', -4), 'J03').meilleurScore).toBe(0)
    })

    it('ne compte pas dans la validation de l epreuve', () => {
      const etat = enregistrerQuiz(etatInitial(), 'J01', 8)
      expect(xpParEpreuve(etat, 'J01')).toBe(XP_QUIZ)
      expect(xpExercices(etat, 'J01')).toBe(0)
      expect(epreuveValidee(etat, 'J01')).toBe(false)
    })

    it('refuse un quiz aux epreuves qui n en ont pas', () => {
      for (const id of ['J00', 'J10', 'M01', 'PHASE3', 'ZZ99']) {
        const etat = enregistrerQuiz(etatInitial(), id, 8)
        expect(etat.epreuves[id], `quiz de trop sur ${id}`).toBeUndefined()
        expect(xpQuiz(etat, id)).toBe(0)
      }
    })
  })

  describe('badges', () => {
    it('attribue, distingue la source et retire', () => {
      let etat = definirBadge(etatInitial(), 'colonne-7', true)
      expect(badgeObtenu(etat, 'colonne-7')).toBe(true)
      expect(etat.badges['colonne-7']).toBe('auto')

      etat = basculerBadge(etat, 'les-quatre-saisons')
      expect(etat.badges['les-quatre-saisons']).toBe('honneur')

      etat = definirBadge(etat, 'colonne-7', false)
      expect(badgeObtenu(etat, 'colonne-7')).toBe(false)
      expect(badgesObtenus(etat)).toEqual(['les-quatre-saisons'])
    })

    it('ignore les demandes sans effet', () => {
      const etat = definirBadge(etatInitial(), 'colonne-7', true)
      expect(definirBadge(etat, 'colonne-7', true)).toBe(etat)
      expect(definirBadge(etat, '', true)).toBe(etat)
      expect(definirBadge(etatInitial(), 'colonne-7', false)).toEqual(etatInitial())
    })
  })

  describe('echelons de carriere', () => {
    it('reste Candidat tant que rien n est fait', () => {
      expect(echelonCourant(etatInitial()).niveau).toBe(0)
    })

    it('exige les XP ET la condition de passage', () => {
      // J00 a J02 validees : 245 XP, au-dessus des 150 du barreau 1.
      const etat = valider(etatInitial(), 'J00', 'J01', 'J02')
      expect(xpTotal(etat)).toBe(245)
      expect(echelonCourant(etat).niveau).toBe(1)

      // Meme avec les XP de J03 a J05, il manque le RUSH01 pour le barreau 2.
      const sansRush = valider(etat, 'J03', 'J04', 'J05')
      expect(xpTotal(sansRush)).toBe(630)
      expect(echelonCourant(sansRush).niveau).toBe(1)

      const avecRush = valider(sansRush, 'RUSH01')
      expect(xpTotal(avecRush)).toBeGreaterThanOrEqual(400)
      expect(echelonCourant(avecRush).niveau).toBe(2)
    })

    it('ne monte pas sans les XP, meme condition tenue', () => {
      // J00 a J02 validees au seuil strict : 85 + 70 + 30 = 185 XP, mais le
      // barreau 1 demande 150 XP, donc on prend le barreau. On redescend en
      // decochant de quoi repasser sous la barre.
      let etat = valider(etatInitial(), 'J00', 'J01', 'J02')
      expect(echelonCourant(etat).niveau).toBe(1)
      etat = definirExercice(etat, 'J02', 'ex01', false)
      etat = definirExercice(etat, 'J02', 'ex03', false)
      etat = definirExercice(etat, 'J02', 'ex04', false)
      etat = definirExercice(etat, 'J02', 'ex05', false)
      // J02 garde 40 XP : sous son seuil de 85, donc plus validee du tout.
      expect(xpTotal(etat)).toBe(165)
      expect(epreuveValidee(etat, 'J02')).toBe(false)
      expect(echelonCourant(etat).niveau).toBe(0)
    })

    it('exige les bonus pour le barreau 7', () => {
      // Les baremes de base pesent 4 210 XP en tout : les 4 500 du barreau 7
      // ne s'atteignent qu'avec des bonus ou des quiz du soir.
      const auMinimum = valider(etatInitial(), ...idsEpreuves.filter((id) => id !== 'PHASE3'))
      expect(xpTotal(auMinimum)).toBe(4210)
      expect(epreuveValidee(auMinimum, 'M06')).toBe(true)
      expect(echelonCourant(auMinimum).niveau).toBe(6)
    })

    it('ne saute jamais un barreau', () => {
      // Toute la piscine et toutes les missions bouclees, bonus compris, sans
      // la phase 3 : le sommet reste hors de portee tant que les 2 badges
      // manquent.
      const etat = idsEpreuves
        .filter((id) => id !== 'PHASE3')
        .reduce((cumul, id) => toutCocher(cumul, id), etatInitial())
      expect(xpTotal(etat)).toBe(4810)
      expect(echelonCourant(etat).niveau).toBe(7)

      const unSeulBadge = definirBadge(etat, 'premier-jcl', true)
      expect(echelonCourant(unSeulBadge).niveau).toBe(7)

      const sommet = definirBadge(unSeulBadge, 'dompteur-de-vsam', true)
      expect(echelonCourant(sommet).niveau).toBe(8)
      expect(echelonCourant(sommet).titre).toBe('Successeur de Marcel')
    })

    it('ne couronne pas les badges seuls', () => {
      let etat = definirBadge(etatInitial(), 'premier-jcl', true)
      etat = definirBadge(etat, 'dompteur-de-vsam', true)
      expect(echelonCourant(etat).niveau).toBe(0)
    })

    it('rend un echelon du livret, jamais une copie', () => {
      expect(echelons).toContain(echelonCourant(etatInitial()))
    })
  })

  describe('reglages et remise a zero', () => {
    it('accepte les reglages prevus et refuse les autres', () => {
      let etat = definirReglage(etatInitial(), 'rythme', 'intensif')
      expect(etat.reglages.rythme).toBe('intensif')
      etat = definirReglage(etat, 'scanlines', false)
      expect(etat.reglages.scanlines).toBe(false)
      expect(definirReglage(etat, 'rythme', 'sieste')).toBe(etat)
      expect(definirReglage(etat, 'couleur', 'rouge')).toBe(etat)
      expect(definirReglage(etat, 'scanlines', false)).toBe(etat)
    })

    it('efface la carriere mais garde les reglages', () => {
      let etat = valider(etatInitial(), 'J00', 'J01')
      etat = enregistrerQuiz(etat, 'J01', 8)
      etat = definirBadge(etat, 'colonne-7', true)
      etat = definirReglage(etat, 'sombre', true)
      etat = ouvrirEpreuve(etat, 'J02')

      const neuf = remiseAZero(etat)
      expect(xpTotal(neuf)).toBe(0)
      expect(badgesObtenus(neuf)).toEqual([])
      expect(neuf.epreuveOuverte).toBeNull()
      expect(neuf.reglages.sombre).toBe(true)
      expect(epreuvesDebloquees(neuf)).toEqual(['J00'])
    })
  })

  describe('export puis import', () => {
    // Une carriere bien remplie, pour que la comparaison ait du contenu.
    function carriere() {
      let etat = valider(etatInitial(), 'J00', 'J01', 'J02', 'J03')
      etat = toutCocher(etat, 'J04')
      etat = enregistrerQuiz(etat, 'J01', 7)
      etat = enregistrerQuiz(etat, 'J02', 4)
      etat = definirBadge(etat, 'colonne-7', true)
      etat = basculerBadge(etat, 'survivant-y2k')
      etat = definirReglage(etat, 'rythme', 'tranquille')
      etat = definirReglage(etat, 'sombre', true)
      return ouvrirEpreuve(etat, 'J05')
    }

    it('rend exactement le meme etat', () => {
      const etat = carriere()
      expect(deserialiser(serialiser(etat))).toEqual(etat)
    })

    it('passe par le JSON sans rien perdre', () => {
      const etat = carriere()
      const relu = deserialiser(JSON.parse(JSON.stringify(serialiser(etat))))
      expect(relu).toEqual(etat)
      expect(xpTotal(relu)).toBe(xpTotal(etat))
      expect(echelonCourant(relu)).toBe(echelonCourant(etat))
      expect(epreuvesDebloquees(relu)).toEqual(epreuvesDebloquees(etat))
    })

    it('produit un JSON detache de l etat vivant', () => {
      const etat = carriere()
      const paquet = serialiser(etat)
      paquet.epreuves.J01.exercices.ex00 = false
      paquet.badges['colonne-7'] = 'honneur'
      expect(exerciceCoche(etat, 'J01', 'ex00')).toBe(true)
      expect(etat.badges['colonne-7']).toBe('auto')
    })

    it('porte le numero de version', () => {
      expect(serialiser(etatInitial()).version).toBe(VERSION_PROGRESSION)
    })

    it('repart de zero devant un fichier inexploitable', () => {
      for (const brut of [null, undefined, 42, 'progression', [], {}]) {
        expect(deserialiser(brut)).toEqual(etatInitial())
      }
    })

    it('ecarte ce que le manifeste ne connait pas', () => {
      const relu = deserialiser({
        version: 1,
        epreuves: {
          J01: { exercices: { ex00: true, ex99: true }, quiz: { tentatives: 1, meilleurScore: 3, xpCredite: false } },
          ZZ99: { exercices: { ex00: true } },
          J00: { exercices: {}, quiz: { tentatives: 0, meilleurScore: 0, xpCredite: false } }
        },
        badges: { 'colonne-7': 'honneur', '': 'auto' },
        reglages: { rythme: 'sieste', scanlines: 'oui', inconnu: 1 },
        epreuveOuverte: 'ZZ99'
      })
      expect(Object.keys(relu.epreuves)).toEqual(['J01'])
      expect(relu.epreuves.J01.exercices).toEqual({ ex00: true })
      expect(relu.badges).toEqual({ 'colonne-7': 'honneur' })
      expect(relu.reglages.rythme).toBe(REGLAGES_PAR_DEFAUT.rythme)
      expect(relu.reglages.scanlines).toBe(true)
      expect(relu.epreuveOuverte).toBeNull()
      expect(xpTotal(relu)).toBe(10)
    })

    it('accepte une liste de badges comme une table', () => {
      const relu = deserialiser({ version: 1, epreuves: {}, badges: ['premier-jcl', 42] })
      expect(relu.badges).toEqual({ 'premier-jcl': 'auto' })
    })

    it('remet d aplomb un quiz truque', () => {
      const relu = deserialiser({
        version: 1,
        epreuves: {
          J01: {
            exercices: { ex00: true },
            quiz: { tentatives: -3, meilleurScore: 99, xpCredite: 'oui' }
          },
          J10: { exercices: { a1: true }, quiz: { tentatives: 5, meilleurScore: 8, xpCredite: true } }
        }
      })
      expect(relu.epreuves.J01.quiz).toEqual({ tentatives: 0, meilleurScore: 8, xpCredite: false })
      // J10 n'a pas de quiz du soir : le sien est jete, ses exercices restent.
      expect(relu.epreuves.J10.quiz).toEqual({ tentatives: 0, meilleurScore: 0, xpCredite: false })
      expect(xpParEpreuve(relu, 'J10')).toBe(15)
    })
  })

  describe('coherence avec le manifeste', () => {
    it('rend chaque epreuve validable en cochant tout', () => {
      let etat = etatInitial()
      for (const id of idsEpreuves) {
        etat = toutCocher(etat, id, { bonus: false })
        expect(epreuveValidee(etat, id), `epreuve ${id}`).toBe(true)
      }
    })

    it('laisse toujours au moins un exercice obligatoire pour l honneur', () => {
      expect(exercicesObligatoires(epreuveParId('PHASE3')).length).toBeGreaterThan(0)
    })
  })
})
