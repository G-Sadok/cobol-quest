// Les donnees du TERMINAL, le tableau de bord de l'apprenti (cahier des
// charges, §5.1) : echelon et titre CGBA, avancement vers l'echelon suivant,
// epreuve en cours et sa commande BERTHA, dernieres decorations, releve de
// service.
//
// Module PUR (comme ui/ecrans.js) : il derive tout de l'etat sans toucher a
// React ni au DOM, pour que l'ecran ne soit plus que de la mise en page et que
// la regle d'affichage se teste sans monter de composant.

import { badgeParId, idsBadges } from '../data/badges.js'
import {
  echelons,
  echelonSuivant,
  progressionVersEchelonSuivant,
  xpAvantEchelonSuivant
} from '../data/echelons.js'
import {
  commandeBertha,
  epreuves,
  exercicesObligatoires,
  idsAvecQuiz,
  idsEpreuves
} from '../data/programme.js'
import {
  badgesObtenus,
  echelonCourant,
  epreuveCourante,
  epreuveValidee,
  exerciceCoche,
  quizReussi,
  xpExercices,
  xpTotal
} from '../store/progression.js'

/** Le lieu de chaque phase dans les sous-sols de la CGBA (§5.2). */
export const LIEUX = Object.freeze({
  piscine: 'Couloir de la piscine',
  missions: 'Bureaux des missions',
  phase3: 'Salle machine IBM'
})

/** Toutes les decorations du livret, dans son ordre (data/badges.js). */
export const badgesDuProgramme = idsBadges

/**
 * L'epreuve qui met un badge en jeu, ou null quand il vient d'ailleurs
 * (DOMPTEUR DE BERTHA couronne la piscine entiere, pas une journee).
 */
export function epreuveDuBadge(idBadge) {
  return badgeParId(idBadge)?.idEpreuve ?? null
}

/** Le lieu d'une epreuve, tel qu'il s'annonce sur La Carte. */
export function lieuEpreuve(epreuve) {
  return LIEUX[epreuve.phase] ?? ''
}

/**
 * L'epreuve du moment et son avancement, pour la carte « EPREUVE EN COURS ».
 *
 * La mesure change de nature avec l'epreuve : les journees et les missions se
 * jaugent en XP d'exercices contre le seuil du jour, la phase 3, que BERTHA ne
 * juge pas, se jauge en jalons coches. `prochainExercice` est le premier
 * exercice non coche, ou le dernier de la liste quand tout est fait : la
 * commande BERTHA reste ainsi toujours affichable.
 */
export function epreuveDuMoment(etat) {
  const epreuve = epreuveCourante(etat)
  const surLHonneur = epreuve.surLHonneur === true
  const obligatoires = exercicesObligatoires(epreuve)

  const faits = surLHonneur
    ? obligatoires.filter((ex) => exerciceCoche(etat, epreuve.id, ex.id)).length
    : xpExercices(etat, epreuve.id)
  const total = surLHonneur ? obligatoires.length : epreuve.seuilValidation

  const restant = epreuve.exercices.find((ex) => !exerciceCoche(etat, epreuve.id, ex.id))
  const prochainExercice = restant ?? epreuve.exercices[epreuve.exercices.length - 1] ?? null

  return {
    epreuve,
    lieu: lieuEpreuve(epreuve),
    unite: surLHonneur ? 'jalons' : 'XP',
    faits,
    total,
    avancement: total > 0 ? Math.min(1, faits / total) : 1,
    validee: epreuveValidee(etat, epreuve.id),
    prochainExercice,
    commande: commandeBertha(prochainExercice)
  }
}

/**
 * Les dernieres decorations obtenues, la plus avancee en tete. Un badge
 * mesurable ne s'ecrit plus dans la progression, il se deduit de l'etat : il
 * n'y a donc plus de chronologie a suivre. L'ordre du livret la remplace, et
 * il dit a peu pres la meme chose, le programme etant sequentiel.
 */
export function dernieresDecorations(etat, combien = 3) {
  const obtenus = badgesObtenus(etat)
  return obtenus
    .slice(Math.max(0, obtenus.length - combien))
    .reverse()
    .map((id) => {
      const badge = badgeParId(id)
      return {
        id,
        libelle: badge?.nom ?? '',
        glyphe: badge?.glyphe ?? '',
        surLHonneur: badge?.surLHonneur === true,
        idEpreuve: badge?.idEpreuve ?? null
      }
    })
}

/** Les salles franchies et celles qui restent, pour le chapo du terminal. */
export function salles(etat) {
  const validees = idsEpreuves.filter((id) => epreuveValidee(etat, id)).length
  return { validees, restantes: idsEpreuves.length - validees, total: idsEpreuves.length }
}

/** Le releve de service : quatre lignes chiffrees sur l'ensemble du parcours. */
export function releveDeService(etat) {
  const compte = salles(etat)
  const exercices = epreuves.reduce(
    (cumul, e) => cumul + e.exercices.filter((ex) => exerciceCoche(etat, e.id, ex.id)).length,
    0
  )
  const quiz = idsAvecQuiz.filter((id) => quizReussi(etat, id)).length
  const decorations = badgesObtenus(etat).length

  return [
    { cle: 'Salles validées', valeur: `${compte.validees} / ${compte.total}` },
    { cle: 'Exercices cochés', valeur: String(exercices) },
    { cle: 'Quiz du soir réussis', valeur: `${quiz} / ${idsAvecQuiz.length}` },
    { cle: 'Décorations', valeur: `${decorations} / ${badgesDuProgramme.length}` }
  ]
}

/**
 * L'etat de carriere : l'echelon tenu, son titre CGBA, les XP cumules et
 * l'avancement vers le barreau suivant (§5.1, la barre d'XP du terminal).
 */
export function carriere(etat) {
  const echelon = echelonCourant(etat)
  const xp = xpTotal(etat)
  return {
    echelon,
    suivant: echelonSuivant(echelon),
    dernier: echelons[echelons.length - 1],
    xp,
    avancement: progressionVersEchelonSuivant(echelon, xp),
    xpAvant: xpAvantEchelonSuivant(echelon, xp)
  }
}
