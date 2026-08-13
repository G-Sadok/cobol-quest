import { describe, expect, it } from 'vitest'
import {
  idsQuizRediges,
  noterCopie,
  questionParRang,
  quiz,
  quizParEpreuve,
  quizRedige
} from './quiz.js'
import { aUnQuiz, epreuveParId, idsAvecQuiz } from './programme.js'
import { QUESTIONS_PAR_QUIZ, SCORE_QUIZ_REQUIS } from '../store/progression.js'

// Les épreuves dont le quiz est rédigé à ce jour. T15 y ajoutera J06 à J09 et
// les deux rushs ; la liste sert de garde-fou contre un fichier oublié.
const REDIGES = ['J01', 'J02', 'J03', 'J04', 'J05']

/** Tous les textes d'un quiz, pour les contrôles qui portent sur l'écriture. */
function textes(q) {
  return [
    q.titre,
    ...q.questions.flatMap((question) => [
      question.enonce,
      question.commentaire,
      ...question.choix
    ])
  ]
}

describe('les quiz du soir', () => {
  it('couvre les épreuves prévues, dans l ordre de progression', () => {
    expect(idsQuizRediges).toEqual(REDIGES)
    expect(quiz).toHaveLength(REDIGES.length)
  })

  it('ne quiz que des épreuves qui en portent un', () => {
    for (const q of quiz) {
      expect(aUnQuiz(q.epreuve), `${q.epreuve} sans quiz au programme`).toBe(true)
    }
    expect(REDIGES.every((id) => idsAvecQuiz.includes(id))).toBe(true)
  })

  it('reprend le titre du sujet', () => {
    for (const q of quiz) {
      expect(q.titre).toBe(epreuveParId(q.epreuve).titre)
    }
  })

  describe.each(REDIGES)('%s', (id) => {
    const q = quizParEpreuve(id)

    it('pose huit questions aux identifiants uniques', () => {
      expect(q.questions).toHaveLength(QUESTIONS_PAR_QUIZ)
      const ids = q.questions.map((question) => question.id)
      expect(new Set(ids).size).toBe(QUESTIONS_PAR_QUIZ)
    })

    it('offre quatre choix distincts et une seule bonne réponse', () => {
      for (const question of q.questions) {
        expect(question.choix, question.id).toHaveLength(4)
        expect(new Set(question.choix).size, question.id).toBe(4)
        expect(question.choix.every((c) => typeof c === 'string' && c.trim() !== '')).toBe(true)
        expect(Number.isInteger(question.bonne), question.id).toBe(true)
        expect(question.bonne, question.id).toBeGreaterThanOrEqual(0)
        expect(question.bonne, question.id).toBeLessThan(4)
      }
    })

    it('commente chaque correction', () => {
      for (const question of q.questions) {
        expect(question.enonce.trim(), question.id).not.toBe('')
        expect(question.commentaire.trim().length, question.id).toBeGreaterThan(40)
      }
    })

    it('porte au moins deux questions sur les sorties exactes ou les colonnes', () => {
      const categories = q.questions.map((question) => question.categorie)
      expect(categories.every((c) => c === 'sortie' || c === 'memo')).toBe(true)
      expect(categories.filter((c) => c === 'sortie').length).toBeGreaterThanOrEqual(2)
    })

    it('n emploie jamais le tiret cadratin', () => {
      // Le caractère est cité par son code : la règle typographique du projet
      // l'interdit jusque dans les fichiers de l'application.
      const cadratin = '\u2014'
      for (const texte of textes(q)) {
        expect(texte, texte).not.toContain(cadratin)
      }
    })
  })
})

describe('quizParEpreuve', () => {
  it('rend null pour une épreuve sans quiz rédigé', () => {
    expect(quizParEpreuve('J00')).toBeNull()
    expect(quizParEpreuve('J09')).toBeNull()
    expect(quizParEpreuve('inconnu')).toBeNull()
    expect(quizRedige('J01')).toBe(true)
    expect(quizRedige('M01')).toBe(false)
  })
})

describe('questionParRang', () => {
  it('rend la question demandée', () => {
    expect(questionParRang('J01', 0)).toBe(quizParEpreuve('J01').questions[0])
    expect(questionParRang('J01', 7)).toBe(quizParEpreuve('J01').questions[7])
  })

  it('rend null hors bornes ou sans quiz', () => {
    expect(questionParRang('J01', -1)).toBeNull()
    expect(questionParRang('J01', 8)).toBeNull()
    expect(questionParRang('J09', 0)).toBeNull()
  })
})

describe('noterCopie', () => {
  const bonnes = (id) => quizParEpreuve(id).questions.map((question) => question.bonne)

  it('compte les bonnes réponses', () => {
    for (const id of REDIGES) {
      expect(noterCopie(id, bonnes(id)), id).toBe(QUESTIONS_PAR_QUIZ)
    }
  })

  it('compte les cases vides comme des erreurs', () => {
    const copie = bonnes('J02')
    copie[0] = null
    copie[1] = undefined
    expect(noterCopie('J02', copie)).toBe(QUESTIONS_PAR_QUIZ - 2)
    expect(noterCopie('J02', [])).toBe(0)
  })

  it('laisse le seuil de réussite atteignable', () => {
    const copie = bonnes('J03').map((bonne, rang) => (rang < SCORE_QUIZ_REQUIS ? bonne : null))
    expect(noterCopie('J03', copie)).toBe(SCORE_QUIZ_REQUIS)
  })

  it('rend 0 sur une copie absente ou un quiz non rédigé', () => {
    expect(noterCopie('J01', null)).toBe(0)
    expect(noterCopie('J09', bonnes('J01'))).toBe(0)
  })
})
