// Les quiz du soir, embarqués à la compilation.
//
// Le cahier des charges (§5.4) fixe le contenu : 8 QCM par épreuve, 4 choix,
// une correction commentée, et au moins 2 questions par quiz portant sur les
// sorties exactes ou les colonnes. Le texte est rédigé d'après « LE MÉMO DU
// JOUR » et les sorties attendues du sujet de l'épreuve, jamais d'après une
// connaissance générale du COBOL : ce que le quiz demande, le sujet l'a dit.
//
// Un fichier JSON par épreuve dans data/quiz/, nommé par l'identifiant de
// l'épreuve (J01.json). Le glob eager les inline dans le bundle, comme le
// corpus : aucune lecture disque à l'exécution, donc un comportement identique
// en dev et dans le .app empaqueté.
//
// Forme d'un quiz :
//   epreuve     l'identifiant de l'épreuve (programme.js, aUnQuiz)
//   titre       l'intitulé du sujet, pour l'en-tête de la séance
//   questions[] { id, categorie, enonce, choix[4], bonne, commentaire }
//
// « categorie » vaut 'sortie' pour les questions sur une sortie exacte ou sur
// les colonnes (le quota du cahier des charges), 'memo' pour les autres.
// « bonne » est le rang du bon choix dans « choix », de 0 à 3.

import { idsAvecQuiz } from './programme.js'

const modules = import.meta.glob('./quiz/*.json', { eager: true, import: 'default' })

const parEpreuve = new Map(
  Object.values(modules).map((quiz) => [quiz.epreuve, Object.freeze(quiz)])
)

/** Les quiz rédigés, dans l'ordre de progression des épreuves. */
export const quiz = Object.freeze(
  idsAvecQuiz.filter((id) => parEpreuve.has(id)).map((id) => parEpreuve.get(id))
)

/** Les épreuves dont le quiz est rédigé, dans l'ordre de progression. */
export const idsQuizRediges = Object.freeze(quiz.map((q) => q.epreuve))

/** Le quiz d'une épreuve, ou null tant qu'il n'est pas rédigé. */
export function quizParEpreuve(id) {
  return parEpreuve.get(id) ?? null
}

/** Vrai quand l'épreuve a un quiz du soir prêt à passer. */
export function quizRedige(id) {
  return parEpreuve.has(id)
}

/** La question d'un quiz par son rang, ou null hors bornes. */
export function questionParRang(id, rang) {
  const questions = quizParEpreuve(id)?.questions
  if (!questions || rang < 0 || rang >= questions.length) return null
  return questions[rang]
}

/**
 * La note d'une copie : le nombre de bonnes réponses. « copie » est un tableau
 * de rangs choisis, dans l'ordre des questions ; toute case laissée vide (null,
 * undefined) compte comme une erreur.
 */
export function noterCopie(id, copie) {
  const questions = quizParEpreuve(id)?.questions
  if (!questions || !Array.isArray(copie)) return 0
  return questions.reduce(
    (note, question, rang) => (copie[rang] === question.bonne ? note + 1 : note),
    0
  )
}
