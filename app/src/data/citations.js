// Les citations du tableau de bord, PIOCHEES DANS LES SUJETS (cahier des
// charges, §5.1) : rien n'est réécrit ici, tout est extrait du corpus à la
// compilation.
//
// Chaque sujet s'ouvre sur la même figure : un bloc de citation en tête de
// fichier, une ligne d'attribution puis la parole entre guillemets.
//
//   > *Mémo de Marcel, café n°1 :*
//   > *« Un programme COBOL, c'est comme la banque : quatre étages... »*
//
// L'attribution change de bouche en bouche (Marcel, Mme KERBRAT à la DRH, une
// convocation officielle). Le Terminal ne montre que Marcel : `citationDeMarcel`
// remonte le programme jusqu'à trouver un mémo signé de sa main.

import { epreuves, idsEpreuves } from './programme.js'
import { lireSujet } from './corpus.js'

// Retire le gras et l'italique markdown qui enveloppent chaque ligne du bloc.
function sansEmphase(ligne) {
  return ligne.replace(/^\*+/, '').replace(/\*+$/, '').trim()
}

// Le premier bloc de citation du fichier, ligne à ligne et sans le chevron.
function blocDeTete(markdown) {
  const bloc = []
  for (const ligne of markdown.split('\n')) {
    if (ligne.startsWith('>')) {
      bloc.push(sansEmphase(ligne.replace(/^>\s?/, '')))
      continue
    }
    if (bloc.length > 0) break
  }
  return bloc
}

/**
 * Découpe le bloc de tête d'un sujet en { auteur, texte }.
 * L'attribution est la première ligne quand elle n'ouvre pas les guillemets ;
 * le reste est la parole, recollée en un seul paragraphe.
 */
export function lireCitation(markdown) {
  const bloc = blocDeTete(markdown ?? '')
  if (bloc.length === 0) return null

  const ouvreLaParole = bloc[0].startsWith('«')
  const auteur = ouvreLaParole ? '' : bloc[0].replace(/\s*:$/, '').trim()
  const lignes = ouvreLaParole ? bloc : bloc.slice(1)

  const texte = lignes
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/^«\s*/, '')
    .replace(/\s*»$/, '')
    .trim()

  return texte === '' ? null : { auteur, texte }
}

function citationDuSujet(epreuve) {
  const lue = lireCitation(lireSujet(epreuve.chemin))
  if (!lue) return null
  return {
    idEpreuve: epreuve.id,
    titreEpreuve: epreuve.titre,
    auteur: lue.auteur,
    texte: lue.texte,
    deMarcel: /marcel/i.test(lue.auteur)
  }
}

/** Une citation par épreuve qui en porte une, dans l'ordre du programme. */
export const citations = Object.freeze(epreuves.map(citationDuSujet).filter(Boolean))

/** La citation d'une épreuve, ou null quand son sujet n'en ouvre aucune. */
export function citationParEpreuve(idEpreuve) {
  return citations.find((c) => c.idEpreuve === idEpreuve) ?? null
}

/**
 * La citation de Marcel à afficher pour une épreuve : la sienne quand c'est
 * lui qui l'ouvre, sinon le dernier mémo qu'il a laissé avant elle, sinon le
 * tout premier du programme. Toujours une parole, jamais un écran vide.
 */
export function citationDeMarcel(idEpreuve) {
  const deMarcel = citations.filter((c) => c.deMarcel)
  if (deMarcel.length === 0) return null

  const rang = idsEpreuves.indexOf(idEpreuve)
  if (rang < 0) return deMarcel[0]

  const enAmont = deMarcel.filter((c) => idsEpreuves.indexOf(c.idEpreuve) <= rang)
  return enAmont.length > 0 ? enAmont[enAmont.length - 1] : deMarcel[0]
}
