// Le store de progression : l'etat de l'apprenti, ses selecteurs, ses actions.
//
// Module PUR (cahier des charges, §8) : aucune dependance a React, a Electron
// ni au DOM. Une action prend l'etat et en renvoie un NOUVEL etat sans jamais
// toucher celui qu'on lui donne ; quand elle ne change rien, elle renvoie
// l'etat recu tel quel (la persistance s'en sert pour ne pas ecrire pour rien).
// Le branchement au fichier reel vit dans src/store/persistance.js.
//
// Forme de l'etat (c'est aussi, mot pour mot, le JSON sauvegarde) :
//   version         numero de schema, pour les migrations futures
//   epreuves        { [idEpreuve]: { exercices: { [idExercice]: true },
//                                    quiz: { tentatives, meilleurScore,
//                                            xpCredite } } }
//   badges          { [idBadge]: 'auto' | 'honneur' }
//   reglages        { rythme, scanlines, sombre }
//   epreuveOuverte  la derniere epreuve ouverte dans le lecteur, ou null
//
// Une fiche d'epreuve vide n'est jamais conservee : l'etat reste canonique, et
// un aller-retour export/import rend exactement le meme objet.
//
// Regle des XP (livret « progression/XP_ET_BADGES.md ») :
//   - les exercices coches donnent leurs XP, retires des qu'on les decoche ;
//   - le quiz du soir ajoute +10 XP, credites UNE seule fois par epreuve ;
//   - la VALIDATION d'une epreuve ne compte que les XP d'exercices : le quiz
//     est un bonus de revision, il ne fait pas franchir le seuil du jour.

import { echelons } from '../data/echelons.js'
import {
  aUnQuiz,
  epreuveParId,
  epreuves,
  exerciceParId,
  exercicesObligatoires,
  idsEpreuves
} from '../data/programme.js'

/** Schema de la progression sauvegardee. */
export const VERSION_PROGRESSION = 1

/** XP accordes par un quiz du soir reussi (une seule fois par epreuve). */
export const XP_QUIZ = 10

/** Bonnes reponses exigees sur les 8 questions d'un quiz du soir. */
export const SCORE_QUIZ_REQUIS = 6

/** Nombre de questions d'un quiz du soir. */
export const QUESTIONS_PAR_QUIZ = 8

/** Les trois rythmes du livret (indicatifs : ils ne bloquent rien). */
export const RYTHMES = Object.freeze(['intensif', 'soutenu', 'tranquille'])

/** Les reglages d'origine (§5.6 du cahier des charges). */
export const REGLAGES_PAR_DEFAUT = Object.freeze({
  rythme: 'soutenu',
  scanlines: true,
  sombre: false
})

/** Les quatre etats d'une salle de La Carte (§5.2). */
export const ETATS_EPREUVE = Object.freeze(['verrouillee', 'disponible', 'en-cours', 'validee'])

const QUIZ_VIERGE = Object.freeze({ tentatives: 0, meilleurScore: 0, xpCredite: false })

/** L'etat d'un apprenti qui ouvre l'application pour la premiere fois. */
export function etatInitial() {
  return {
    version: VERSION_PROGRESSION,
    epreuves: {},
    badges: {},
    reglages: { ...REGLAGES_PAR_DEFAUT },
    epreuveOuverte: null
  }
}

function ficheVierge() {
  return { exercices: {}, quiz: { ...QUIZ_VIERGE } }
}

function ficheVide(fiche) {
  return (
    Object.keys(fiche.exercices).length === 0 &&
    fiche.quiz.tentatives === 0 &&
    !fiche.quiz.xpCredite
  )
}

function fiche(etat, idEpreuve) {
  return etat.epreuves[idEpreuve] ?? null
}

// Repose une fiche dans l'etat, ou la retire quand elle ne dit plus rien.
function poserFiche(etat, idEpreuve, suivante) {
  const epreuvesSuivantes = { ...etat.epreuves }
  if (ficheVide(suivante)) delete epreuvesSuivantes[idEpreuve]
  else epreuvesSuivantes[idEpreuve] = suivante
  return { ...etat, epreuves: epreuvesSuivantes }
}

/* ------------------------------------------------------------------ actions */

/** Coche ou decoche un exercice. Les identifiants inconnus sont ignores. */
export function definirExercice(etat, idEpreuve, idExercice, coche) {
  if (!exerciceParId(idEpreuve, idExercice)) return etat
  const actuelle = fiche(etat, idEpreuve)
  const voulu = Boolean(coche)
  if (Boolean(actuelle?.exercices[idExercice]) === voulu) return etat

  const exercicesSuivants = { ...(actuelle?.exercices ?? {}) }
  if (voulu) exercicesSuivants[idExercice] = true
  else delete exercicesSuivants[idExercice]

  const base = actuelle ?? ficheVierge()
  return poserFiche(etat, idEpreuve, { ...base, exercices: exercicesSuivants })
}

/** Bascule un exercice d'un clic sur sa case. */
export function basculerExercice(etat, idEpreuve, idExercice) {
  return definirExercice(etat, idEpreuve, idExercice, !exerciceCoche(etat, idEpreuve, idExercice))
}

/**
 * Enregistre une tentative de quiz du soir. Les re-tentatives sont libres :
 * seul le meilleur score est retenu, et les +10 XP ne tombent qu'une fois.
 */
export function enregistrerQuiz(etat, idEpreuve, score) {
  if (!aUnQuiz(idEpreuve)) return etat
  const note = Math.min(QUESTIONS_PAR_QUIZ, Math.max(0, Math.trunc(Number(score) || 0)))
  const base = fiche(etat, idEpreuve) ?? ficheVierge()
  const quiz = {
    tentatives: base.quiz.tentatives + 1,
    meilleurScore: Math.max(base.quiz.meilleurScore, note),
    xpCredite: base.quiz.xpCredite || note >= SCORE_QUIZ_REQUIS
  }
  return poserFiche(etat, idEpreuve, { ...base, quiz })
}

/**
 * Attribue ou retire un badge. La source dit qui a tranche : 'auto' quand la
 * condition est mesurable, 'honneur' quand l'apprenti se juge lui-meme (§5.5).
 */
export function definirBadge(etat, idBadge, obtenu, source = 'auto') {
  if (typeof idBadge !== 'string' || idBadge === '') return etat
  const actuelle = etat.badges[idBadge] ?? null
  const voulue = obtenu ? (source === 'honneur' ? 'honneur' : 'auto') : null
  if (actuelle === voulue) return etat

  const badges = { ...etat.badges }
  if (voulue) badges[idBadge] = voulue
  else delete badges[idBadge]
  return { ...etat, badges }
}

/** Bascule un badge « sur l'honneur » depuis la grille du livret. */
export function basculerBadge(etat, idBadge) {
  return definirBadge(etat, idBadge, !badgeObtenu(etat, idBadge), 'honneur')
}

/** Retient l'epreuve ouverte dans le lecteur, pour le bouton « reprendre ». */
export function ouvrirEpreuve(etat, idEpreuve) {
  const id = epreuveParId(idEpreuve) ? idEpreuve : null
  if (etat.epreuveOuverte === id) return etat
  return { ...etat, epreuveOuverte: id }
}

/** Change un reglage. Les clefs et les valeurs hors norme sont ignorees. */
export function definirReglage(etat, clef, valeur) {
  if (!(clef in REGLAGES_PAR_DEFAUT)) return etat
  const propre = clef === 'rythme' ? (RYTHMES.includes(valeur) ? valeur : null) : Boolean(valeur)
  if (propre === null || etat.reglages[clef] === propre) return etat
  return { ...etat, reglages: { ...etat.reglages, [clef]: propre } }
}

/**
 * Remise a zero (§5.6). Les reglages sont de l'ergonomie, pas de la
 * progression : ils survivent a l'effacement de la carriere.
 */
export function remiseAZero(etat) {
  return { ...etatInitial(), reglages: { ...etat.reglages } }
}

/* -------------------------------------------------------------- selecteurs */

/** Vrai quand l'exercice est coche. */
export function exerciceCoche(etat, idEpreuve, idExercice) {
  return Boolean(fiche(etat, idEpreuve)?.exercices[idExercice])
}

/** L'etat du quiz du soir d'une epreuve (toujours un objet, jamais null). */
export function quizEpreuve(etat, idEpreuve) {
  return fiche(etat, idEpreuve)?.quiz ?? { ...QUIZ_VIERGE }
}

/** Vrai quand le quiz du soir a deja rapporte ses +10 XP. */
export function quizReussi(etat, idEpreuve) {
  return quizEpreuve(etat, idEpreuve).xpCredite
}

/** Les XP gagnes sur les exercices d'une epreuve : ce sont eux qui valident. */
export function xpExercices(etat, idEpreuve) {
  const epreuve = epreuveParId(idEpreuve)
  if (!epreuve) return 0
  const coches = fiche(etat, idEpreuve)?.exercices ?? {}
  return epreuve.exercices.reduce((cumul, ex) => (coches[ex.id] ? cumul + ex.xp : cumul), 0)
}

/** Les XP du quiz du soir d'une epreuve : 10 une fois, 0 sinon. */
export function xpQuiz(etat, idEpreuve) {
  return quizReussi(etat, idEpreuve) ? XP_QUIZ : 0
}

/** Tous les XP d'une epreuve, quiz du soir compris. */
export function xpParEpreuve(etat, idEpreuve) {
  return xpExercices(etat, idEpreuve) + xpQuiz(etat, idEpreuve)
}

/** Les XP cumules de la carriere. */
export function xpTotal(etat) {
  return idsEpreuves.reduce((cumul, id) => cumul + xpParEpreuve(etat, id), 0)
}

/**
 * Vrai quand l'epreuve est validee : le seuil du jour atteint sur les
 * exercices, ou, pour la phase 3 que BERTHA ne juge pas, tous les jalons
 * obligatoires coches sur l'honneur.
 */
export function epreuveValidee(etat, idEpreuve) {
  const epreuve = epreuveParId(idEpreuve)
  if (!epreuve) return false
  if (epreuve.surLHonneur) {
    const obligatoires = exercicesObligatoires(epreuve)
    return obligatoires.every((ex) => exerciceCoche(etat, idEpreuve, ex.id))
  }
  return xpExercices(etat, idEpreuve) >= epreuve.seuilValidation
}

/** Vrai quand l'apprenti a deja pose quelque chose sur cette epreuve. */
export function epreuveCommencee(etat, idEpreuve) {
  const actuelle = fiche(etat, idEpreuve)
  if (!actuelle) return etat.epreuveOuverte === idEpreuve
  return true
}

/** Vrai quand l'epreuve precedente est validee (deblocage sequentiel, §6). */
export function epreuveDebloquee(etat, idEpreuve) {
  const epreuve = epreuveParId(idEpreuve)
  if (!epreuve) return false
  return epreuve.prerequis === null || epreuveValidee(etat, epreuve.prerequis)
}

/** Les identifiants des epreuves ouvertes, dans l'ordre du programme. */
export function epreuvesDebloquees(etat) {
  return idsEpreuves.filter((id) => epreuveDebloquee(etat, id))
}

/** L'un des quatre etats de salle de La Carte. */
export function etatEpreuve(etat, idEpreuve) {
  if (!epreuveDebloquee(etat, idEpreuve)) return 'verrouillee'
  if (epreuveValidee(etat, idEpreuve)) return 'validee'
  return epreuveCommencee(etat, idEpreuve) ? 'en-cours' : 'disponible'
}

/**
 * L'epreuve du moment, celle du bouton « reprendre » du Terminal : la derniere
 * ouverte tant qu'elle a du sens, sinon la premiere epreuve ouverte et non
 * validee, sinon la derniere du programme (tout est fini).
 */
export function epreuveCourante(etat) {
  const ouverte = epreuveParId(etat.epreuveOuverte)
  if (ouverte && epreuveDebloquee(etat, ouverte.id) && !epreuveValidee(etat, ouverte.id)) {
    return ouverte
  }
  const aFaire = epreuves.find((e) => epreuveDebloquee(etat, e.id) && !epreuveValidee(etat, e.id))
  return aFaire ?? epreuves[epreuves.length - 1]
}

/** Vrai quand le badge est obtenu, quelle qu'en soit la source. */
export function badgeObtenu(etat, idBadge) {
  return idBadge in etat.badges
}

/** Les identifiants des badges obtenus. */
export function badgesObtenus(etat) {
  return Object.keys(etat.badges)
}

/**
 * L'echelon courant : le plus haut barreau dont les conditions du livret sont
 * tenues, en montant SANS EN SAUTER AUCUN (XP cumules et condition de passage).
 */
export function echelonCourant(etat) {
  const total = xpTotal(etat)
  let courant = echelons[0]
  for (const echelon of echelons.slice(1)) {
    if (echelon.xpRequis !== null && total < echelon.xpRequis) break
    if (!echelon.epreuvesRequises.every((id) => epreuveValidee(etat, id))) break
    if (!echelon.badgesRequis.every((id) => badgeObtenu(etat, id))) break
    courant = echelon
  }
  return courant
}

/* ---------------------------------------------------------- serialisation */

/**
 * L'etat pret a ecrire sur le disque. La forme est deja celle du JSON : on se
 * contente d'une copie profonde, pour que la sauvegarde ne partage plus rien
 * avec l'etat vivant.
 */
export function serialiser(etat) {
  const epreuvesSerialisees = {}
  for (const id of idsEpreuves) {
    const actuelle = fiche(etat, id)
    if (!actuelle) continue
    epreuvesSerialisees[id] = {
      exercices: { ...actuelle.exercices },
      quiz: { ...actuelle.quiz }
    }
  }
  return {
    version: VERSION_PROGRESSION,
    epreuves: epreuvesSerialisees,
    badges: { ...etat.badges },
    reglages: { ...etat.reglages },
    epreuveOuverte: etat.epreuveOuverte
  }
}

function lireQuiz(brut, avecQuiz) {
  if (!avecQuiz || !brut || typeof brut !== 'object') return { ...QUIZ_VIERGE }
  const tentatives = Math.max(0, Math.trunc(Number(brut.tentatives) || 0))
  const meilleurScore = Math.min(
    QUESTIONS_PAR_QUIZ,
    Math.max(0, Math.trunc(Number(brut.meilleurScore) || 0))
  )
  return { tentatives, meilleurScore, xpCredite: brut.xpCredite === true }
}

/**
 * Relit une progression venue du disque ou d'un fichier importe. Tolerante par
 * construction : tout ce qui n'est pas reconnu (epreuve disparue, exercice
 * renumerote, reglage exotique) est ecarte, jamais recopie a l'aveugle.
 */
export function deserialiser(brut) {
  const etat = etatInitial()
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) return etat

  const fiches = brut.epreuves && typeof brut.epreuves === 'object' ? brut.epreuves : {}
  for (const id of idsEpreuves) {
    const ficheBrute = fiches[id]
    if (!ficheBrute || typeof ficheBrute !== 'object') continue
    const exercices = {}
    const coches = ficheBrute.exercices ?? {}
    for (const exercice of epreuveParId(id).exercices) {
      if (coches[exercice.id] === true) exercices[exercice.id] = true
    }
    const relue = { exercices, quiz: lireQuiz(ficheBrute.quiz, aUnQuiz(id)) }
    if (!ficheVide(relue)) etat.epreuves[id] = relue
  }

  // Les badges sont acceptes sous forme de liste comme de table : le catalogue
  // complet arrive en T13, on ne prejuge pas ici des identifiants connus.
  const badges = brut.badges
  if (Array.isArray(badges)) {
    for (const id of badges) if (typeof id === 'string' && id) etat.badges[id] = 'auto'
  } else if (badges && typeof badges === 'object') {
    for (const [id, source] of Object.entries(badges)) {
      if (typeof id === 'string' && id) etat.badges[id] = source === 'honneur' ? 'honneur' : 'auto'
    }
  }

  const reglages = brut.reglages && typeof brut.reglages === 'object' ? brut.reglages : {}
  for (const clef of Object.keys(REGLAGES_PAR_DEFAUT)) {
    if (!(clef in reglages)) continue
    etat.reglages[clef] =
      clef === 'rythme'
        ? RYTHMES.includes(reglages.rythme)
          ? reglages.rythme
          : REGLAGES_PAR_DEFAUT.rythme
        : Boolean(reglages[clef])
  }

  if (epreuveParId(brut.epreuveOuverte)) etat.epreuveOuverte = brut.epreuveOuverte
  return etat
}
