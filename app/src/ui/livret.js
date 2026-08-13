// LE LIVRET (cahier des charges, §5.5) : la grille des decorations et le
// tableau des neuf echelons avec l'etat courant.
//
// Module PUR (comme ui/carte.js, ui/lecteur.js et ui/feuilleDeRoute.js) : il
// derive tout de l'etat, du catalogue et du livret sans toucher a React ni au
// DOM. L'ecran ne fait que poser des tuiles et des lignes.
//
// Deux regles y sont rendues visibles :
//   - une decoration mesurable s'affiche telle que le travail rendu la donne,
//     et sa tuile ne se clique pas : c'est BERTHA qui tranche, pas la souris ;
//   - une decoration « sur l'honneur » se coche et se decoche librement, avec
//     un toast a chaque fois (design 6.6, regle 8 du §7 : action reversible).

import { badgeParId, badges } from '../data/badges.js'
import { echelons } from '../data/echelons.js'
import { epreuveParId } from '../data/programme.js'
import { badgeObtenu, echelonCourant, xpTotal } from '../store/progression.js'
import { espacerMilliers } from './format.js'

/** D'ou vient une decoration : son epreuve, ou la piscine entiere. */
export function origineBadge(badge) {
  const epreuve = epreuveParId(badge.idEpreuve)
  if (!epreuve) return 'Toute la piscine'
  if (epreuve.phase === 'phase3') return 'Phase 3'
  return `${epreuve.id} · ${epreuve.titre}`
}

/** Une tuile de la grille des decorations (design 6.4). */
export function tuileBadge(etat, badge) {
  const obtenu = badgeObtenu(etat, badge.id)
  return {
    id: badge.id,
    nom: badge.nom,
    glyphe: badge.glyphe,
    condition: badge.condition,
    origine: origineBadge(badge),
    obtenu,
    surLHonneur: badge.surLHonneur,
    // Seule une decoration que l'application ne sait pas mesurer se clique.
    basculable: badge.surLHonneur,
    mention: badge.surLHonneur
      ? obtenu
        ? "Accordée sur l'honneur"
        : "À cocher sur l'honneur"
      : obtenu
        ? 'Accordée par BERTHA'
        : 'BERTHA la donnera'
  }
}

/** Les 26 decorations dans l'ordre du livret, obtenues ou non. */
export function grilleDesBadges(etat) {
  return badges.map((badge) => tuileBadge(etat, badge))
}

/** Le compte des decorations, pour le label de la grille. */
export function compteDecorations(etat) {
  const obtenues = badges.filter((badge) => badgeObtenu(etat, badge.id)).length
  return {
    obtenues,
    total: badges.length,
    libelle: `DECORATIONS · ${obtenues} SUR ${badges.length}`
  }
}

/** Le toast d'une decoration accordee ou reprise sur l'honneur. */
export function verdictBadge(badge, accordee) {
  return {
    ton: accordee ? 'oui' : 'non',
    texte: `${badge.nom} · ${accordee ? "SUR L'HONNEUR" : 'REPRISE'}`
  }
}

/** La ligne d'un echelon dans la grille de droite. */
export function ligneEchelon(echelon, courant, xp) {
  const passe = echelon.niveau < courant.niveau
  const actuel = echelon.niveau === courant.niveau
  return {
    niveau: echelon.niveau,
    rang: String(echelon.niveau).padStart(2, '0'),
    titre: echelon.titre,
    condition: echelon.condition,
    // Le dernier barreau n'a pas de plancher d'XP : le livret laisse la case
    // vide, la grille aussi.
    seuil: echelon.xpRequis === null ? '' : `${espacerMilliers(echelon.xpRequis)} XP`,
    xpTenus: echelon.xpRequis !== null && xp >= echelon.xpRequis,
    position: actuel ? 'actuel' : passe ? 'passe' : 'a-venir',
    marque: actuel ? 'VOUS' : passe ? '✓' : ''
  }
}

/** Les neuf echelons, du candidat au successeur de Marcel. */
export function grilleDesEchelons(etat) {
  const courant = echelonCourant(etat)
  const xp = xpTotal(etat)
  return echelons.map((echelon) => ligneEchelon(echelon, courant, xp))
}

/**
 * Tout le livret en un objet : le compte, la grille des decorations, celle des
 * echelons et l'echelon tenu (le chapo de l'ecran l'annonce).
 */
export function livret(etat) {
  return {
    compte: compteDecorations(etat),
    decorations: grilleDesBadges(etat),
    echelons: grilleDesEchelons(etat),
    echelon: echelonCourant(etat),
    xp: xpTotal(etat)
  }
}

/** La tuile d'une decoration par son identifiant, ou null. */
export function tuileParId(etat, idBadge) {
  const badge = badgeParId(idBadge)
  return badge ? tuileBadge(etat, badge) : null
}
