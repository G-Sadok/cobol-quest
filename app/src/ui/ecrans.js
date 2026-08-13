// Le registre des 6 ecrans : l'ordre est fige par le design (section 5 du
// DESIGN_SYSTEM) et sert a la fois a la barre laterale, au titre de la barre
// d'outils, aux raccourcis Cmd+1..Cmd+6 et au rendu du contenu.
//
// Module PUR : pas de React ici, pour que la navigation se teste sans DOM.
//   id        clef interne, aussi la valeur de l'etat de navigation
//   libelle   ce qui s'affiche dans la barre laterale
//   code      la puce mono a deux lettres de l'item de nav
//   titre     titre de la barre d'outils (casse de phrase, section 2)
//   precision complement gris a droite du titre
//   largeur   largeur de contenu centree (section 3) ; null = l'ecran se
//             debrouille (le lecteur a sa propre mise en page a deux volets)

/** Les 6 ecrans, dans l'ordre obligatoire de la barre laterale. */
export const ecrans = Object.freeze([
  {
    id: 'terminal',
    libelle: 'Le terminal',
    code: 'TR',
    titre: 'Le terminal',
    precision: 'Tableau de bord',
    largeur: 'var(--l-terminal)'
  },
  {
    id: 'carte',
    libelle: 'La carte',
    code: 'CA',
    titre: 'La carte',
    precision: 'Sous-sols de la CGBA',
    largeur: 'var(--l-carte-ecran)'
  },
  {
    id: 'lecteur',
    libelle: 'Le sujet',
    code: 'SU',
    titre: 'Le sujet',
    precision: 'Lecteur et feuille de route',
    largeur: null
  },
  {
    id: 'quiz',
    libelle: 'Le quiz',
    code: 'QZ',
    titre: 'Le quiz du soir',
    precision: '8 questions',
    largeur: 'var(--l-quiz)'
  },
  {
    id: 'livret',
    libelle: 'Le livret',
    code: 'LV',
    titre: 'Le livret',
    precision: 'Décorations et échelons',
    largeur: 'var(--l-carte-ecran)'
  },
  {
    id: 'reglages',
    libelle: 'Réglages',
    code: 'RG',
    titre: 'Réglages',
    precision: 'Progression, rythme et affichage',
    largeur: 'var(--l-reglages)'
  }
])

/** L'ecran ouvert au demarrage. */
export const ecranParDefaut = ecrans[0].id

/** Les identifiants des ecrans, dans l'ordre. */
export const idsEcrans = Object.freeze(ecrans.map((e) => e.id))

/** Un ecran par son identifiant, ou null. */
export function ecranParId(id) {
  return ecrans.find((e) => e.id === id) ?? null
}

/**
 * L'ecran vise par un raccourci clavier : Cmd+1 ouvre le premier, Cmd+6 le
 * dernier. Renvoie null pour tout le reste, y compris Cmd+0 et Cmd+7.
 */
export function ecranParRaccourci(touche) {
  const rang = Number(touche)
  if (!Number.isInteger(rang) || rang < 1 || rang > ecrans.length) return null
  return ecrans[rang - 1].id
}
