// LE QUIZ DU SOIR (cahier des charges, §5.4) : le deroule d'une seance, la
// correction commentee question par question, et le releve final.
//
// Module PUR (comme ui/carte.js, ui/lecteur.js, ui/feuilleDeRoute.js et
// ui/livret.js) : il derive tout de l'etat, du programme et des quiz rediges
// en T14/T15, sans toucher a React ni au DOM. L'ecran ne fait que poser le
// resultat, tenir la copie en cours et rendre la note au store.
//
// Deux regles du cahier des charges se lisent ici :
//   - il faut 6 bonnes reponses sur 8 pour gagner les 10 XP du soir ;
//   - ces 10 XP ne tombent qu'UNE fois par epreuve, alors que les tentatives
//     restent libres. C'est le store qui garde la memoire (xpCredite) ; ce
//     module se contente de dire ce que la seance en cours a rapporte.

import { epreuveParId } from '../data/programme.js'
import { idsQuizRediges, noterCopie, questionParRang, quizParEpreuve } from '../data/quiz.js'
import {
  SCORE_QUIZ_REQUIS,
  XP_QUIZ,
  epreuveDebloquee,
  quizEpreuve,
  quizReussi
} from '../store/progression.js'
import { epreuveLue } from './lecteur.js'

/** Les quatre choix d'une question, tels qu'ils s'annoncent a l'oral. */
export const LETTRES = Object.freeze(['A', 'B', 'C', 'D'])

/** L'etiquette d'une seance dans le sommaire, en casse de phrase. */
export const LIBELLES_SEANCE = Object.freeze({
  verrouillee: 'Verrouillé',
  'a-passer': 'À passer',
  'a-repasser': 'À repasser',
  reussie: 'Réussi'
})

function pourcent(part, tout) {
  if (!(tout > 0)) return 0
  return Math.max(0, Math.min(100, (part / tout) * 100))
}

/** Une copie vierge : une case vide par question, dans l'ordre du quiz. */
export function copieVierge(idEpreuve) {
  const questions = quizParEpreuve(idEpreuve)?.questions ?? []
  return questions.map(() => null)
}

/**
 * Repose une copie avec une reponse de plus. Une case deja remplie ne se
 * corrige pas : au quiz du soir, on repond une fois et on lit la correction.
 */
export function repondre(copie, rang, choix) {
  if (!Array.isArray(copie) || rang < 0 || rang >= copie.length) return copie
  if (copie[rang] !== null && copie[rang] !== undefined) return copie
  const suivante = [...copie]
  suivante[rang] = choix
  return suivante
}

/** Le nombre de cases remplies : ou en est la copie. */
export function repondues(copie) {
  if (!Array.isArray(copie)) return 0
  return copie.filter((c) => c !== null && c !== undefined).length
}

/**
 * Une seance dans le sommaire : l'epreuve, son etat et ce qu'elle a deja
 * rapporte. Une seance verrouillee reste annoncee mais ne s'ouvre pas, comme
 * une salle de La Carte.
 */
export function seance(etat, idEpreuve) {
  const epreuve = epreuveParId(idEpreuve)
  const quiz = quizParEpreuve(idEpreuve)
  if (!epreuve || !quiz) return null

  const ouverte = epreuveDebloquee(etat, idEpreuve)
  const fiche = quizEpreuve(etat, idEpreuve)
  const position = !ouverte
    ? 'verrouillee'
    : fiche.xpCredite
      ? 'reussie'
      : fiche.tentatives > 0
        ? 'a-repasser'
        : 'a-passer'
  const prerequis = epreuve.prerequis ? epreuveParId(epreuve.prerequis) : null

  return {
    id: epreuve.id,
    titre: quiz.titre,
    questions: quiz.questions.length,
    ouverte,
    position,
    libelle: LIBELLES_SEANCE[position],
    tentatives: fiche.tentatives,
    meilleurScore: fiche.meilleurScore,
    xpCredite: fiche.xpCredite,
    annonce: ouverte
      ? `${epreuve.id} ${quiz.titre} : ${LIBELLES_SEANCE[position].toLowerCase()}.`
      : `${epreuve.id} ${quiz.titre} : verrouillé, validez d’abord ${prerequis.id} (${prerequis.titre}).`
  }
}

/** Les onze seances du soir, dans l'ordre du programme. */
export function sommaireDesSeances(etat) {
  return idsQuizRediges.map((id) => seance(etat, id))
}

/**
 * Le quiz propose en arrivant sur l'ecran : celui du sujet pose sur le pupitre
 * quand il en a un, sinon la premiere seance ouverte qui n'a pas encore
 * rapporte ses XP, sinon la derniere ouverte. Le soir, on revise la journee
 * qu'on vient de lire : c'est la meme epreuve que dans le lecteur.
 */
export function epreuveDeLaSeance(etat) {
  const lue = epreuveLue(etat)
  const ouvertes = idsQuizRediges.filter((id) => epreuveDebloquee(etat, id))
  if (ouvertes.includes(lue.id)) return lue.id
  const aPasser = ouvertes.find((id) => !quizReussi(etat, id))
  return aPasser ?? ouvertes[ouvertes.length - 1] ?? idsQuizRediges[0]
}

/**
 * L'en-tete de la seance : de quelle epreuve on revise le memo, si elle est
 * ouverte, et le releve des tentatives passees.
 */
export function enteteSeance(etat, idEpreuve) {
  const fiche = seance(etat, idEpreuve)
  if (!fiche) return null
  const epreuve = epreuveParId(idEpreuve)
  const prerequis = epreuve.prerequis ? epreuveParId(epreuve.prerequis) : null

  return {
    ...fiche,
    adresse: `LE MEMO DU SOIR · ${epreuve.id}`,
    exigence: `${SCORE_QUIZ_REQUIS} bonnes réponses sur ${fiche.questions} pour ${XP_QUIZ} XP`,
    releve:
      fiche.tentatives === 0
        ? 'Aucune tentative pour l’instant. Les re-tentatives sont libres.'
        : `${fiche.tentatives} tentative${fiche.tentatives > 1 ? 's' : ''}, meilleur score ${
            fiche.meilleurScore
          } / ${fiche.questions}${fiche.xpCredite ? `, ${XP_QUIZ} XP déjà crédités` : ''}.`,
    verrou: fiche.ouverte
      ? null
      : `Le quiz de ${epreuve.id} s’ouvre quand ${prerequis.id} (${prerequis.titre}) est validé.`
  }
}

/**
 * La question a l'ecran, avec ses quatre choix et, une fois la reponse posee,
 * la correction commentee. Les quatre etats d'un choix : ouvert tant qu'on n'a
 * pas repondu, puis bonne, mauvaise (celle qu'on a prise) ou eteinte.
 */
export function ficheQuestion(idEpreuve, rang, copie) {
  const quiz = quizParEpreuve(idEpreuve)
  const question = questionParRang(idEpreuve, rang)
  if (!quiz || !question) return null

  const total = quiz.questions.length
  const pris = Array.isArray(copie) ? copie[rang] : null
  const repondu = pris !== null && pris !== undefined
  const juste = repondu && pris === question.bonne

  return {
    id: question.id,
    rang,
    numero: rang + 1,
    total,
    compteur: `QUESTION ${rang + 1} / ${total}`,
    enonce: question.enonce,
    categorie: question.categorie,
    repondu,
    juste,
    derniere: rang === total - 1,
    progres: pourcent(rang + (repondu ? 1 : 0), total),
    note: noterCopie(idEpreuve, copie),
    choix: question.choix.map((texte, i) => ({
      rang: i,
      lettre: LETTRES[i],
      texte,
      etat: !repondu ? 'ouvert' : i === question.bonne ? 'bonne' : i === pris ? 'mauvaise' : 'eteinte',
      marque: repondu ? (i === question.bonne ? '✓' : i === pris ? '✗' : '') : '',
      annonce: `Réponse ${LETTRES[i]} : ${texte}`
    })),
    correction: repondu
      ? {
          ton: juste ? 'oui' : 'non',
          titre: juste ? 'BERTHA DIT OUI' : 'BERTHA DIT NON',
          texte: question.commentaire
        }
      : null,
    suite: rang === total - 1 ? 'Voir le résultat' : 'Question suivante'
  }
}

/**
 * Le releve de fin de seance.
 *
 * `dejaCredite` est l'etat du dossier AVANT la copie : c'est lui qui dit si les
 * 10 XP tombent ce soir ou s'ils sont deja au dossier. Le store, lui, ne les
 * compte qu'une fois de toute facon (progression.js, enregistrerQuiz).
 */
export function resultatSeance(idEpreuve, copie, dejaCredite = false) {
  const quiz = quizParEpreuve(idEpreuve)
  if (!quiz) return null

  const total = quiz.questions.length
  const note = noterCopie(idEpreuve, copie)
  const reussi = note >= SCORE_QUIZ_REQUIS
  const xpAccorde = reussi && !dejaCredite ? XP_QUIZ : 0

  return {
    note,
    total,
    score: `${note}/${total}`,
    reussi,
    xpAccorde,
    tampon: reussi ? (xpAccorde > 0 ? `VALIDE +${XP_QUIZ} XP` : 'VALIDE') : null,
    phrase: !reussi
      ? `Il faut ${SCORE_QUIZ_REQUIS} bonnes réponses sur ${total}. Relisez le mémo du jour, puis repassez : les tentatives sont libres.`
      : xpAccorde > 0
        ? `Seuil atteint : ${XP_QUIZ} XP portés au dossier. Marcel hoche la tête, ce qui chez lui vaut une ovation.`
        : `Seuil atteint de nouveau. Les ${XP_QUIZ} XP du soir sont déjà au dossier : ils ne se gagnent qu’une fois, mais on repasse autant qu’on veut.`
  }
}

/** Le toast d'une reponse (design 6.6). MAJUSCULES sans accents. */
export function verdictReponse(juste) {
  return {
    ton: juste ? 'oui' : 'non',
    texte: juste ? 'BERTHA DIT OUI' : 'BERTHA DIT NON'
  }
}

/** Le toast de fin de seance : la note, et les XP quand ils tombent. */
export function verdictSeance(resultat) {
  return {
    ton: resultat.reussi ? 'oui' : 'non',
    texte: `QUIZ ${resultat.score}${resultat.xpAccorde > 0 ? ` · +${resultat.xpAccorde} XP` : ''}`
  }
}
