// Les 9 échelons de carrière de la CGBA.
//
// Source unique de vérité : le tableau 2 du livret « progression/XP_ET_BADGES.md ».
// Un échelon se prend à DEUX conditions cumulées (le livret dit « XP cumulés
// ET condition de passage ») :
//   xpRequis          XP cumulés à atteindre (null pour le dernier : le livret
//                     ne fixe aucun montant, seuls les badges comptent)
//   epreuvesRequises  identifiants d'épreuves à avoir validées
//   badgesRequis      identifiants de badges à avoir obtenus
//
// L'échelon courant est le plus haut dont les deux conditions sont tenues, en
// remontant la liste sans sauter de barreau : le calcul vit dans le store
// (src/store/progression.js, T07), pas ici. Ce module ne décrit que la règle.

/** Les échelons, du plus bas au plus haut. */
export const echelons = Object.freeze([
  {
    niveau: 0,
    titre: 'Candidat',
    xpRequis: 0,
    epreuvesRequises: [],
    badgesRequis: [],
    condition: 'Se présenter à la CGBA'
  },
  {
    niveau: 1,
    titre: 'Stagiaire',
    xpRequis: 150,
    epreuvesRequises: ['J00', 'J01', 'J02'],
    badgesRequis: [],
    condition: 'J00 à J02 validés'
  },
  {
    niveau: 2,
    titre: 'Apprenti opérateur',
    xpRequis: 400,
    epreuvesRequises: ['J03', 'J04', 'J05', 'RUSH01'],
    badgesRequis: [],
    condition: 'J03 à J05 et le RUSH01 validés'
  },
  {
    niveau: 3,
    titre: 'Pupitreur',
    xpRequis: 800,
    epreuvesRequises: ['J06', 'J07', 'J08', 'J09', 'RUSH02'],
    badgesRequis: [],
    condition: 'J06 à J09 et le RUSH02 validés'
  },
  {
    niveau: 4,
    titre: 'Programmeur junior',
    xpRequis: 1500,
    epreuvesRequises: ['J10'],
    badgesRequis: [],
    condition: "L'examen J10 réussi (au moins 120 XP)"
  },
  {
    niveau: 5,
    titre: 'Programmeur',
    xpRequis: 2400,
    epreuvesRequises: ['M01', 'M02'],
    badgesRequis: [],
    condition: 'M01 et M02 validées'
  },
  {
    niveau: 6,
    titre: 'Analyste-programmeur',
    xpRequis: 3200,
    epreuvesRequises: ['M03', 'M04', 'M05'],
    badgesRequis: [],
    condition: 'M03, M04 et M05 validées'
  },
  {
    niveau: 7,
    titre: 'Gardien du mainframe',
    xpRequis: 4500,
    epreuvesRequises: ['M06'],
    badgesRequis: [],
    condition: 'M06 validée'
  },
  {
    niveau: 8,
    titre: 'Successeur de Marcel',
    // Le livret laisse la case vide : aucun plancher d'XP à ce dernier barreau.
    xpRequis: null,
    epreuvesRequises: [],
    badgesRequis: ['premier-jcl', 'dompteur-de-vsam'],
    condition: 'Phase 3 : les 2 badges Z Xplore obtenus'
  }
])

/** Le premier échelon, celui de l'apprenti qui vient d'ouvrir l'application. */
export const echelonInitial = echelons[0]

/** Un échelon par son niveau, ou null. */
export function echelonParNiveau(niveau) {
  return echelons.find((e) => e.niveau === niveau) ?? null
}

/** L'échelon suivant, ou null quand le sommet est atteint. */
export function echelonSuivant(echelon) {
  return echelonParNiveau(echelon.niveau + 1)
}

/**
 * Les XP qui manquent pour espérer l'échelon suivant.
 * Zéro quand le plancher d'XP est déjà franchi (la condition d'épreuves peut,
 * elle, rester à tenir) ou quand plus aucun échelon ne suit.
 */
export function xpAvantEchelonSuivant(echelon, xpTotal) {
  const suivant = echelonSuivant(echelon)
  if (!suivant || suivant.xpRequis === null) return 0
  return Math.max(0, suivant.xpRequis - xpTotal)
}

/**
 * L'avancement (0 à 1) vers l'échelon suivant, pour la barre d'XP du terminal.
 * Vaut 1 quand il n'y a plus d'échelon à viser ou plus d'XP à gagner pour lui.
 */
export function progressionVersEchelonSuivant(echelon, xpTotal) {
  const suivant = echelonSuivant(echelon)
  if (!suivant || suivant.xpRequis === null) return 1
  const plancher = echelon.xpRequis ?? 0
  const palier = suivant.xpRequis - plancher
  if (palier <= 0) return 1
  return Math.min(1, Math.max(0, (xpTotal - plancher) / palier))
}
