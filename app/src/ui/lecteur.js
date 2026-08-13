// LE LECTEUR DE SUJET (cahier des charges, §5.3) : ce qui s'affiche en tete de
// la colonne de lecture, le texte du sujet, et les deux epreuves voisines.
//
// Module PUR (comme ui/carte.js et ui/tableauDeBord.js) : il derive tout de
// l'etat et du corpus sans toucher a React ni au DOM. L'ecran ne fait que poser
// le resultat ; le rendu markdown, lui, vit dans ui/Markdown.jsx.

import { lireSujet } from '../data/corpus.js'
import {
  epreuveParId,
  epreuves,
  exercicesBonus,
  exercicesObligatoires,
  idsEpreuves
} from '../data/programme.js'
import { epreuveCourante, epreuveDebloquee, etatEpreuve } from '../store/progression.js'
import { LIBELLES_ETAT } from './carte.js'

/**
 * L'adresse d'une epreuve dans les sous-sols, telle qu'elle s'ecrit en tete du
 * sujet. MAJUSCULES sans accents : c'est un label mono (design, section 2).
 */
export function adresseEpreuve(epreuve) {
  if (epreuve.phase === 'missions') return `LES MISSIONS · BUREAU ${epreuve.id}`
  if (epreuve.phase === 'phase3') return 'LA SALLE MACHINE · PHASE 3'
  return `LA PISCINE · SALLE ${epreuve.id}`
}

/**
 * Detache l'en-tete du markdown d'un sujet du reste du texte.
 *
 * Tous les sujets du corpus commencent par la meme paire : un titre de niveau 1
 * puis une ligne de niveau 3 qui annonce la duree et les XP. Le lecteur pose
 * lui-meme ces deux lignes dans sa propre typographie ; les laisser dans le
 * corps les afficherait deux fois. Le sous-titre n'est retire que si le titre
 * l'a ete : un texte qui commencerait par une section garde sa section.
 */
export function decouperSujet(markdown) {
  if (typeof markdown !== 'string' || markdown.trim() === '') {
    return { titre: null, sousTitre: null, corps: '' }
  }

  const lignes = markdown.split('\n')
  let debut = 0
  while (debut < lignes.length && lignes[debut].trim() === '') debut += 1

  const titre = /^#\s+(.+)$/.exec(lignes[debut] ?? '')
  if (!titre) return { titre: null, sousTitre: null, corps: markdown.trim() }

  let apres = debut + 1
  let saut = apres
  while (saut < lignes.length && lignes[saut].trim() === '') saut += 1
  const sousTitre = /^###\s+(.+)$/.exec(lignes[saut] ?? '')
  if (sousTitre) apres = saut + 1

  return {
    titre: titre[1].trim(),
    sousTitre: sousTitre ? sousTitre[1].trim() : null,
    corps: lignes.slice(apres).join('\n').trim()
  }
}

/**
 * La ligne grise sous le titre : ce que le manifeste sait de l'epreuve, pas ce
 * que le sujet en raconte. Les journees et les missions se valident aux XP
 * d'exercices, la phase 3 se valide sur l'honneur (elle n'a pas de moulinette).
 */
export function reperesEpreuve(epreuve) {
  const obligatoires = exercicesObligatoires(epreuve).length
  const bonus = exercicesBonus(epreuve).length
  const reperes = [`${obligatoires} exercice${obligatoires > 1 ? 's' : ''}`]
  if (bonus > 0) reperes.push(`${bonus} bonus`)
  reperes.push(
    epreuve.surLHonneur ? 'validation sur l’honneur' : `seuil ${epreuve.seuilValidation} XP`
  )
  return reperes
}

/**
 * Le sujet a lire : l'epreuve retenue, son en-tete et son texte.
 *
 * `absent` vaut true quand le corpus n'a pas ete synchronise avant la
 * compilation : l'ecran le dit alors au lieu d'afficher une page blanche.
 */
export function ficheLecture(etat) {
  const epreuve = epreuveCourante(etat)
  const source = lireSujet(epreuve.chemin)
  const decoupe = decouperSujet(source)
  const etatSalle = etatEpreuve(etat, epreuve.id)

  return {
    epreuve,
    adresse: adresseEpreuve(epreuve),
    titre: epreuve.titre,
    sousTitre: decoupe.sousTitre,
    reperes: reperesEpreuve(epreuve),
    etat: etatSalle,
    libelleEtat: LIBELLES_ETAT[etatSalle],
    corps: decoupe.corps,
    absent: source === null,
    chemin: epreuve.chemin
  }
}

/** Le voisinage d'une epreuve dans l'ordre du programme, ou null au bout. */
function voisine(etat, decalage, rang) {
  const cible = epreuves[rang + decalage]
  if (!cible) return null
  const accessible = epreuveDebloquee(etat, cible.id)
  const prerequis = cible.prerequis ? epreuveParId(cible.prerequis) : null

  return {
    id: cible.id,
    titre: cible.titre,
    accessible,
    annonce: accessible
      ? `${cible.id} ${cible.titre}`
      : `${cible.id} ${cible.titre} : verrouillée, validez d’abord ${prerequis.id} (${prerequis.titre}).`
  }
}

/**
 * Les deux epreuves qui encadrent celle-ci dans l'ordre du programme, pour les
 * boutons precedent / suivant du bas de page. Une epreuve verrouillee reste
 * annoncee mais ne s'ouvre pas, comme sur La Carte.
 */
export function voisines(etat, idEpreuve) {
  const rang = idsEpreuves.indexOf(idEpreuve)
  if (rang < 0) return { precedente: null, suivante: null }
  return {
    precedente: voisine(etat, -1, rang),
    suivante: voisine(etat, 1, rang)
  }
}
