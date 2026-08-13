// REGLAGES (cahier des charges, §5.6) : le rythme de formation, l'affichage,
// l'export et l'import de la progression, et la remise a zero.
//
// Module PUR (comme ui/carte.js, ui/lecteur.js, ui/feuilleDeRoute.js,
// ui/livret.js et ui/quiz.js) : il derive tout de l'etat et des rapports que
// rend la persistance, sans toucher a React, a Electron ni au DOM. L'ecran ne
// fait que poser le resultat et rendre les gestes au store.
//
// Deux regles s'y lisent :
//   - la remise a zero se confirme DEUX fois (§5.6) : la premiere boite annonce
//     ce qui part, la seconde demande le dernier mot ; a chaque etape, la
//     sortie est le bouton de repli, jamais l'action destructrice (design 6.7) ;
//   - les reglages sont de l'ergonomie, pas de la carriere : ils survivent a
//     l'effacement (voir remiseAZero dans store/progression.js).

import { idsEpreuves } from '../data/programme.js'
import { badgesObtenus, epreuveValidee, xpTotal } from '../store/progression.js'
import { espacerMilliers } from './format.js'

/**
 * Les trois rythmes, dans l'ordre de la maquette (du plus calme au plus dur)
 * et sous les noms qu'elle leur donne. Les identifiants, eux, sont ceux du
 * cahier des charges : c'est ce qui part dans le fichier de progression.
 */
export const RYTHMES_AFFICHES = Object.freeze([
  Object.freeze({ id: 'tranquille', nom: 'Tranquille', detail: '1 salle tous les deux jours' }),
  Object.freeze({ id: 'soutenu', nom: 'Soutenu', detail: '1 salle par jour' }),
  Object.freeze({
    id: 'intensif',
    nom: 'Marcel en 1987',
    detail: '1 salle par jour + rush le samedi'
  })
])

/** Les lignes du bloc « rythme de formation », avec celle qui est tenue. */
export function lignesRythme(etat) {
  return RYTHMES_AFFICHES.map((rythme) => ({
    ...rythme,
    actif: etat.reglages.rythme === rythme.id
  }))
}

/**
 * Les deux interrupteurs du bloc « affichage » (design 6.9). La maquette en
 * montre trois, mais ses deux dernieres lignes (phosphore et curseur) sont un
 * seul reglage cote application : l'interrupteur « scanlines » du cahier des
 * charges, qui gouverne tous les effets des objets sombres.
 */
export function lignesInterrupteur(etat) {
  const sombre = Boolean(etat.reglages.sombre)
  return [
    {
      clef: 'sombre',
      nom: 'Thème sombre',
      detail: `Salle machine de nuit. Actuellement : ${sombre ? 'sombre' : 'clair'}.`,
      actif: sombre
    },
    {
      clef: 'scanlines',
      nom: 'Effets de phosphore',
      detail: 'Curseur clignotant, pastille BERTHA et fin balayage des consoles.',
      actif: Boolean(etat.reglages.scanlines)
    }
  ]
}

function accorder(nombre, singulier, pluriel) {
  return `${espacerMilliers(nombre)} ${nombre > 1 ? pluriel : singulier}`
}

/** Ce que pese la carriere : c'est ce que la remise a zero emporte. */
export function resumeCarriere(etat) {
  return {
    xp: xpTotal(etat),
    badges: badgesObtenus(etat).length,
    salles: idsEpreuves.filter((id) => epreuveValidee(etat, id)).length
  }
}

/** Vrai quand le dossier ne contient encore rien a effacer. */
export function dossierVierge(resume) {
  return resume.xp === 0 && resume.badges === 0 && resume.salles === 0
}

/** Ce que pese la carriere, en toutes lettres : « 1 240 XP, 3 decorations et... ». */
export function listeCarriere(resume) {
  return (
    `${espacerMilliers(resume.xp)} XP, ` +
    `${accorder(resume.badges, 'décoration', 'décorations')} et ` +
    `${accorder(resume.salles, 'salle validée', 'salles validées')}`
  )
}

/** La phrase qui nomme ce qui part au broyeur (design : boite de confirmation). */
export function phraseEffacement(resume) {
  if (dossierVierge(resume)) return 'Ce dossier est déjà vierge : il n’y a rien à broyer.'
  return `${listeCarriere(resume)} partent au broyeur.`
}

/**
 * Les deux etapes de la remise a zero (§5.6 : double confirmation). L'etape 0
 * est la boite fermee ; passe la derniere, l'effacement a lieu.
 */
export const ETAPES_EFFACEMENT = 2

/** Le contenu de la boite de confirmation a l'etape demandee, ou null. */
export function etapeEffacement(rang, resume) {
  if (rang === 1) {
    return {
      rang: 1,
      titre: 'Effacer toute la progression ?',
      corps: `${phraseEffacement(resume)} Vos réglages, eux, restent en place.`,
      confirmer: 'Effacer…',
      annuler: 'Annuler'
    }
  }
  if (rang === 2) {
    return {
      rang: 2,
      titre: 'Dernier mot avant le broyeur',
      corps:
        'Cette opération est définitive : ni BERTHA ni Marcel ne savent recoller ' +
        'un dossier broyé. Un export en garde une copie sur votre disque.',
      confirmer: 'Effacer définitivement',
      annuler: 'Annuler'
    }
  }
  return null
}

/** Le nom d'un fichier tire de son chemin, pour les toasts et les releves. */
export function nomFichier(chemin) {
  if (typeof chemin !== 'string' || chemin === '') return 'progression.json'
  return chemin.split('/').filter(Boolean).pop() ?? 'progression.json'
}

/**
 * Ce que dit l'ecran par defaut sous les deux boutons, selon que le fichier
 * reel est accessible (application) ou non (navigateur de developpement).
 */
export function ligneProgression(fichierPresent) {
  return fichierPresent
    ? 'La progression vit dans un fichier de votre dossier utilisateur.'
    : 'L’export et l’import demandent l’application, pas le navigateur.'
}

/**
 * Le compte rendu d'un export : le toast (mono, court) et la ligne qui reste
 * affichee sous les boutons, ou la raison d'un echec se lit en entier.
 */
export function mouvementExport(rapport) {
  if (rapport?.ok) {
    const nom = nomFichier(rapport.chemin)
    return { ton: 'oui', toast: `PROGRESSION EXPORTEE · ${nom}`, ligne: `Dernier export : ${nom}` }
  }
  if (rapport?.annule) {
    return { ton: 'non', toast: 'EXPORT ANNULE', ligne: 'Export annulé : rien n’a été écrit.' }
  }
  return {
    ton: 'non',
    toast: 'EXPORT IMPOSSIBLE',
    ligne: rapport?.erreur ?? 'Export impossible.'
  }
}

/** Le compte rendu d'un import, sur le meme modele. */
export function mouvementImport(rapport) {
  if (rapport?.ok) {
    const nom = nomFichier(rapport.chemin)
    return {
      ton: 'oui',
      toast: `PROGRESSION IMPORTEE · ${nom}`,
      ligne: `Progression reprise depuis ${nom}.`
    }
  }
  if (rapport?.annule) {
    return {
      ton: 'non',
      toast: 'AUCUN FICHIER SELECTIONNE',
      ligne: 'Import annulé : la progression n’a pas bougé.'
    }
  }
  return {
    ton: 'non',
    toast: 'IMPORT IMPOSSIBLE',
    ligne: rapport?.erreur ?? 'Import impossible.'
  }
}

/** Le compte rendu d'une remise a zero, une fois les deux boites passees. */
export function mouvementRemiseAZero(resume) {
  return {
    ton: 'non',
    toast: 'PROGRESSION EFFACEE',
    ligne: dossierVierge(resume)
      ? 'Dossier remis à zéro : il était déjà vide.'
      : `Dossier remis à zéro : ${listeCarriere(resume)} sont partis au broyeur.`
  }
}

/** Le toast d'un rythme choisi : il est indicatif, il ne bloque rien. */
export function verdictRythme(ligne) {
  return { ton: 'oui', texte: `RYTHME · ${ligne.nom.toUpperCase()}` }
}

/** Le toast d'un interrupteur bascule. */
export function verdictInterrupteur(ligne, actif) {
  return {
    ton: actif ? 'oui' : 'non',
    texte: `${ligne.clef === 'sombre' ? 'THEME SOMBRE' : 'EFFETS'} · ${actif ? 'ON' : 'OFF'}`
  }
}

/** Tout l'ecran en un objet : les trois blocs et le poids de la carriere. */
export function reglages(etat, fichierPresent) {
  const resume = resumeCarriere(etat)
  return {
    rythmes: lignesRythme(etat),
    interrupteurs: lignesInterrupteur(etat),
    resume,
    vierge: dossierVierge(resume),
    ligneProgression: ligneProgression(fichierPresent)
  }
}
