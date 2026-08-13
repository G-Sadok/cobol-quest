// Les badges : leur nom d'affichage.
//
// Le catalogue complet (conditions d'obtention, attribution automatique,
// « sur l'honneur », glyphes de médaille) arrive avec le livret en T13. Ce
// module ne porte pour l'instant que la règle de nommage, dont le tableau de
// bord a besoin dès maintenant pour ses trois dernières décorations.
//
// Les identifiants de `programme.js` sont la forme désaccentuée et en minuscules
// du nom que donne le livret « progression/XP_ET_BADGES.md ». Le chemin inverse
// est donc mécanique : majuscules (donc sans accents, règle 7 du design) et
// tirets rendus à l'espace, sauf après un article élidé qui reprend son
// apostrophe (`l-architecte` : « L'ARCHITECTE », `ciseaux-d-or` : « CISEAUX
// D'OR »).

const ELISIONS = new Set(['L', 'D'])

/** Le nom d'un badge tel que l'écrit le livret, en capitales sans accents. */
export function libelleBadge(idBadge) {
  if (typeof idBadge !== 'string' || idBadge === '') return ''
  const morceaux = idBadge.toUpperCase().split('-').filter((m) => m !== '')
  return morceaux.reduce((assemble, morceau, rang) => {
    if (rang === 0) return morceau
    const separateur = ELISIONS.has(morceaux[rang - 1]) ? "'" : ' '
    return assemble + separateur + morceau
  }, '')
}
