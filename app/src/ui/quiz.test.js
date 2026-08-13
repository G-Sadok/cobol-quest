import { describe, expect, it } from 'vitest'
import { epreuveParId } from '../data/programme.js'
import { idsQuizRediges, quizParEpreuve } from '../data/quiz.js'
import {
  SCORE_QUIZ_REQUIS,
  XP_QUIZ,
  definirExercice,
  enregistrerQuiz,
  etatInitial,
  ouvrirEpreuve,
  xpParEpreuve
} from '../store/progression.js'
import {
  LETTRES,
  copieVierge,
  enteteSeance,
  epreuveDeLaSeance,
  ficheQuestion,
  repondre,
  repondues,
  resultatSeance,
  seance,
  sommaireDesSeances,
  verdictReponse,
  verdictSeance
} from './quiz.js'

// Coche tous les exercices non-bonus des epreuves demandees : de quoi ouvrir
// les seances suivantes, le deblocage etant sequentiel.
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

// Une copie sans faute, lue dans le quiz lui-meme.
function copieParfaite(id) {
  return quizParEpreuve(id).questions.map((q) => q.bonne)
}

// Une copie a `bonnes` bonnes reponses, les autres decalees d'un cran.
function copieNotee(id, bonnes) {
  return quizParEpreuve(id).questions.map((q, rang) =>
    rang < bonnes ? q.bonne : (q.bonne + 1) % LETTRES.length
  )
}

describe('la copie', () => {
  it('part vierge, avec une case par question', () => {
    const copie = copieVierge('J01')
    expect(copie).toHaveLength(quizParEpreuve('J01').questions.length)
    expect(copie.every((c) => c === null)).toBe(true)
    expect(repondues(copie)).toBe(0)
  })

  it('se remplit case par case, et ne se corrige pas', () => {
    const copie = repondre(copieVierge('J01'), 0, 2)
    expect(copie[0]).toBe(2)
    expect(repondues(copie)).toBe(1)
    expect(repondre(copie, 0, 3)[0]).toBe(2)
  })

  it('ignore un rang hors bornes', () => {
    const copie = copieVierge('J01')
    expect(repondre(copie, -1, 0)).toBe(copie)
    expect(repondre(copie, 8, 0)).toBe(copie)
  })

  it('reste vide pour une epreuve sans quiz', () => {
    expect(copieVierge('J00')).toEqual([])
    expect(copieVierge('PHASE3')).toEqual([])
  })
})

describe('le sommaire des seances', () => {
  it('porte les onze quiz rediges, dans l ordre du programme', () => {
    const sommaire = sommaireDesSeances(etatInitial())
    expect(sommaire.map((s) => s.id)).toEqual([...idsQuizRediges])
    expect(sommaire.every((s) => s.questions === 8)).toBe(true)
  })

  it('n ouvre que les seances dont l epreuve est debloquee', () => {
    const etat = valider(etatInitial(), 'J00')
    const sommaire = sommaireDesSeances(etat)
    expect(sommaire.find((s) => s.id === 'J01').ouverte).toBe(true)
    expect(sommaire.find((s) => s.id === 'J01').position).toBe('a-passer')
    const fermee = sommaire.find((s) => s.id === 'J02')
    expect(fermee.ouverte).toBe(false)
    expect(fermee.position).toBe('verrouillee')
    expect(fermee.annonce).toContain('J01')
  })

  it('distingue une seance a repasser d une seance reussie', () => {
    const ouvert = valider(etatInitial(), 'J00')
    const rate = enregistrerQuiz(ouvert, 'J01', SCORE_QUIZ_REQUIS - 1)
    expect(seance(rate, 'J01').position).toBe('a-repasser')
    expect(seance(rate, 'J01').meilleurScore).toBe(SCORE_QUIZ_REQUIS - 1)
    const reussi = enregistrerQuiz(rate, 'J01', 8)
    expect(seance(reussi, 'J01').position).toBe('reussie')
    expect(seance(reussi, 'J01').tentatives).toBe(2)
  })

  it('ne connait pas les epreuves sans quiz', () => {
    expect(seance(etatInitial(), 'J00')).toBeNull()
    expect(seance(etatInitial(), 'M01')).toBeNull()
    expect(seance(etatInitial(), 'epreuve-fantome')).toBeNull()
  })
})

describe('la seance proposee en arrivant', () => {
  it('suit le sujet pose sur le pupitre quand il a un quiz', () => {
    const etat = ouvrirEpreuve(valider(etatInitial(), 'J00', 'J01'), 'J02')
    expect(epreuveDeLaSeance(etat)).toBe('J02')
  })

  it('retombe sur la premiere seance ouverte quand le sujet n en a pas', () => {
    const etat = ouvrirEpreuve(valider(etatInitial(), 'J00'), 'J00')
    expect(epreuveDeLaSeance(etat)).toBe('J01')
  })

  it('saute les seances deja reussies', () => {
    const ouvert = valider(etatInitial(), 'J00', 'J01')
    const etat = ouvrirEpreuve(enregistrerQuiz(ouvert, 'J01', 8), 'J00')
    expect(epreuveDeLaSeance(etat)).toBe('J02')
  })

  it('propose la premiere seance a un apprenti qui n a rien fait', () => {
    expect(epreuveDeLaSeance(etatInitial())).toBe('J01')
  })
})

describe('l en-tete de la seance', () => {
  it('annonce l exigence et le releve des tentatives', () => {
    const etat = valider(etatInitial(), 'J00')
    const entete = enteteSeance(etat, 'J01')
    expect(entete.adresse).toBe('LE MEMO DU SOIR · J01')
    expect(entete.exigence).toContain(String(SCORE_QUIZ_REQUIS))
    expect(entete.exigence).toContain(String(XP_QUIZ))
    expect(entete.releve).toContain('Aucune tentative')
    expect(entete.verrou).toBeNull()
  })

  it('compte les tentatives et signale les XP deja credites', () => {
    const ouvert = valider(etatInitial(), 'J00')
    const entete = enteteSeance(enregistrerQuiz(ouvert, 'J01', 7), 'J01')
    expect(entete.releve).toContain('1 tentative,')
    expect(entete.releve).toContain('meilleur score 7 / 8')
    expect(entete.releve).toContain('XP déjà crédités')
  })

  it('dit ce qui ouvre une seance verrouillee', () => {
    const entete = enteteSeance(etatInitial(), 'J02')
    expect(entete.ouverte).toBe(false)
    expect(entete.verrou).toContain('J01')
  })
})

describe('la question a l ecran', () => {
  it('pose quatre choix ouverts tant qu on n a pas repondu', () => {
    const fiche = ficheQuestion('J01', 0, copieVierge('J01'))
    expect(fiche.compteur).toBe('QUESTION 1 / 8')
    expect(fiche.choix.map((c) => c.lettre)).toEqual([...LETTRES])
    expect(fiche.choix.every((c) => c.etat === 'ouvert' && c.marque === '')).toBe(true)
    expect(fiche.repondu).toBe(false)
    expect(fiche.correction).toBeNull()
    expect(fiche.derniere).toBe(false)
    expect(fiche.suite).toBe('Question suivante')
  })

  it('marque la bonne reponse et commente une bonne copie', () => {
    const question = quizParEpreuve('J01').questions[0]
    const copie = repondre(copieVierge('J01'), 0, question.bonne)
    const fiche = ficheQuestion('J01', 0, copie)
    expect(fiche.juste).toBe(true)
    expect(fiche.correction.titre).toBe('BERTHA DIT OUI')
    expect(fiche.correction.ton).toBe('oui')
    expect(fiche.correction.texte).toBe(question.commentaire)
    expect(fiche.choix[question.bonne].etat).toBe('bonne')
    expect(fiche.choix[question.bonne].marque).toBe('✓')
    expect(fiche.note).toBe(1)
  })

  it('montre la bonne reponse a cote de la mauvaise', () => {
    const question = quizParEpreuve('J01').questions[0]
    const pris = (question.bonne + 1) % LETTRES.length
    const fiche = ficheQuestion('J01', 0, repondre(copieVierge('J01'), 0, pris))
    expect(fiche.juste).toBe(false)
    expect(fiche.correction.titre).toBe('BERTHA DIT NON')
    expect(fiche.choix[pris].etat).toBe('mauvaise')
    expect(fiche.choix[pris].marque).toBe('✗')
    expect(fiche.choix[question.bonne].etat).toBe('bonne')
    expect(fiche.choix.filter((c) => c.etat === 'eteinte')).toHaveLength(2)
    expect(fiche.note).toBe(0)
  })

  it('avance la jauge d une question a chaque reponse', () => {
    const vierge = ficheQuestion('J01', 0, copieVierge('J01'))
    expect(vierge.progres).toBe(0)
    const repondue = ficheQuestion('J01', 0, repondre(copieVierge('J01'), 0, 0))
    expect(repondue.progres).toBe(12.5)
    expect(ficheQuestion('J01', 7, copieParfaite('J01')).progres).toBe(100)
  })

  it('annonce le resultat sur la derniere question', () => {
    const fiche = ficheQuestion('J01', 7, copieVierge('J01'))
    expect(fiche.derniere).toBe(true)
    expect(fiche.suite).toBe('Voir le résultat')
  })

  it('ne rend rien hors bornes ni sans quiz', () => {
    expect(ficheQuestion('J01', 8, copieVierge('J01'))).toBeNull()
    expect(ficheQuestion('J00', 0, [])).toBeNull()
  })
})

describe('le releve de fin de seance', () => {
  it('accorde les XP au seuil, une seule fois', () => {
    const gagne = resultatSeance('J01', copieNotee('J01', SCORE_QUIZ_REQUIS), false)
    expect(gagne.note).toBe(SCORE_QUIZ_REQUIS)
    expect(gagne.score).toBe(`${SCORE_QUIZ_REQUIS}/8`)
    expect(gagne.reussi).toBe(true)
    expect(gagne.xpAccorde).toBe(XP_QUIZ)
    expect(gagne.tampon).toBe(`VALIDE +${XP_QUIZ} XP`)

    const rejoue = resultatSeance('J01', copieParfaite('J01'), true)
    expect(rejoue.reussi).toBe(true)
    expect(rejoue.xpAccorde).toBe(0)
    expect(rejoue.tampon).toBe('VALIDE')
    expect(rejoue.phrase).toContain('déjà au dossier')
  })

  it('refuse le tampon sous le seuil', () => {
    const rate = resultatSeance('J01', copieNotee('J01', SCORE_QUIZ_REQUIS - 1), false)
    expect(rate.reussi).toBe(false)
    expect(rate.xpAccorde).toBe(0)
    expect(rate.tampon).toBeNull()
    expect(rate.phrase).toContain('tentatives sont libres')
  })

  it('compte une case laissee vide comme une erreur', () => {
    const copie = copieParfaite('J01')
    copie[0] = null
    copie[1] = null
    copie[2] = null
    expect(resultatSeance('J01', copie, false).note).toBe(5)
    expect(resultatSeance('J01', copie, false).reussi).toBe(false)
  })

  it('ne rend rien pour une epreuve sans quiz', () => {
    expect(resultatSeance('J00', [], false)).toBeNull()
  })
})

describe('les verdicts annonces par le toast', () => {
  it('reprend les deux phrases de BERTHA, sans accents', () => {
    expect(verdictReponse(true)).toEqual({ ton: 'oui', texte: 'BERTHA DIT OUI' })
    expect(verdictReponse(false)).toEqual({ ton: 'non', texte: 'BERTHA DIT NON' })
  })

  it('annonce la note, et les XP le soir ou ils tombent', () => {
    const gagne = resultatSeance('J01', copieParfaite('J01'), false)
    expect(verdictSeance(gagne)).toEqual({ ton: 'oui', texte: `QUIZ 8/8 · +${XP_QUIZ} XP` })
    const rejoue = resultatSeance('J01', copieParfaite('J01'), true)
    expect(verdictSeance(rejoue).texte).toBe('QUIZ 8/8')
    const rate = resultatSeance('J01', copieNotee('J01', 2), false)
    expect(verdictSeance(rate)).toEqual({ ton: 'non', texte: 'QUIZ 2/8' })
  })
})

describe('la seance et le dossier', () => {
  it('porte les XP du soir une seule fois, quelles que soient les tentatives', () => {
    const ouvert = valider(etatInitial(), 'J00')
    const exercices = xpParEpreuve(ouvert, 'J01')
    const note = resultatSeance('J01', copieParfaite('J01'), false).note

    const apres = enregistrerQuiz(ouvert, 'J01', note)
    expect(xpParEpreuve(apres, 'J01')).toBe(exercices + XP_QUIZ)
    expect(seance(apres, 'J01').xpCredite).toBe(true)

    const encore = enregistrerQuiz(apres, 'J01', note)
    expect(xpParEpreuve(encore, 'J01')).toBe(exercices + XP_QUIZ)
    expect(seance(encore, 'J01').tentatives).toBe(2)
    expect(resultatSeance('J01', copieParfaite('J01'), true).xpAccorde).toBe(0)
  })
})
