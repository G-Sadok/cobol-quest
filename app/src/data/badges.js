// Le catalogue des décorations de la CGBA : les 26 badges du livret.
//
// Source unique de vérité : la section 3 du livret « progression/XP_ET_BADGES.md »
// pour la liste, le nom et l'ordre ; le sujet de chaque épreuve pour la
// condition précise (« Badges : ... » en fin de barème). En cas d'écart, le
// livret fait foi (cahier des charges, §6).
//
// Forme d'un badge :
//   id          identifiant stable, celui qu'emploie `programme.js`
//   nom         le nom du livret, en capitales sans accents (règle 7 du design)
//   glyphe      le signe de la médaille (§6.4 du design)
//   idEpreuve   l'épreuve qui le met en jeu, ou null (DOMPTEUR DE BERTHA
//               couronne la piscine entière, aucune épreuve ne le porte)
//   condition   la phrase affichée sous la médaille, obtenue ou non
//   regle       ce que l'application sait mesurer, ou null quand elle ne sait
//               pas : le badge est alors « sur l'honneur » (§5.5)
//
// LA RÈGLE DE PARTAGE entre attribution automatique et parole d'apprenti :
// un badge est automatique quand sa condition s'exprime ENTIÈREMENT dans ce
// que l'application observe, c'est-à-dire des exercices cochés (donc validés
// par BERTHA) et des XP. Dès que le sujet ajoute un critère que seule
// l'apprenti peut constater (les prédictions justes, l'absence de GO TO, le
// premier coup, aucun littéral dans la PROCEDURE), la case reste à cocher à la
// main. Mieux vaut un badge que l'on s'accorde qu'un badge que l'on vole.
//
// Les quatre règles mesurables :
//   { type: 'exercices', exercices } tous ces exercices cochés
//   { type: 'obligatoires' }         tous les exercices non-bonus cochés
//   { type: 'validee' }              l'épreuve validée (son seuil atteint)
//   { type: 'xpExercices', minimum } au moins N XP d'exercices
// Leur évaluation vit dans le store (src/store/progression.js), qui seul
// connaît l'état de l'apprenti ; ce module ne décrit que la règle.

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

// Le catalogue brut, dans l'ordre du livret : piscine, missions, phase 3.
const CATALOGUE = [
  {
    id: 'premiere-compile',
    glyphe: '⌁',
    idEpreuve: 'J00',
    condition: 'Le binaire a parlé : le premier programme compile et BERTHA dit OK.',
    regle: { type: 'exercices', exercices: ['ex00'] }
  },
  {
    id: 'colonne-7',
    glyphe: '▥',
    idEpreuve: 'J01',
    condition: 'Première erreur de format fixe comprise et corrigée.',
    regle: null
  },
  {
    id: 'les-quatre-saisons',
    glyphe: '✦',
    idEpreuve: 'J01',
    condition: 'Les quatre divisions récitées de tête : tous les exercices non-bonus validés.',
    regle: { type: 'obligatoires' }
  },
  {
    id: 'chasseur-de-troncatures',
    glyphe: '⇥',
    idEpreuve: 'J02',
    condition: 'La machine à tronquer rendue avec au moins 3 prédictions de MOVE justes sur 4.',
    regle: null
  },
  {
    id: 'survivant-y2k',
    glyphe: '⌛',
    idEpreuve: 'J02',
    condition: "Le bug de l'an 2000 reproduit puis corrigé.",
    regle: { type: 'exercices', exercices: ['ex06'] }
  },
  {
    id: 's0c7',
    glyphe: '⊗',
    idEpreuve: 'J03',
    condition: 'Un plantage de donnée provoqué, compris et blindé : le vide-poche anti-S0C7.',
    regle: { type: 'exercices', exercices: ['ex03'] }
  },
  {
    id: 'la-voie-du-88',
    glyphe: '⊞',
    idEpreuve: 'J03',
    condition: 'Les états du compte écrits sans aucun littéral dans la PROCEDURE DIVISION.',
    regle: null
  },
  {
    id: 'tueur-de-go-to',
    glyphe: '⚑',
    idEpreuve: 'J04',
    condition: "Une journée entière sans un seul GO TO, et l'autopsie du code spaghetti rendue.",
    regle: null
  },
  {
    id: 'maitre-des-registres',
    glyphe: '▦',
    idEpreuve: 'J05',
    condition: "L'annuaire, l'annuaire express et le tri du stagiaire validés.",
    regle: { type: 'exercices', exercices: ['ex04', 'ex05', 'ex06'] }
  },
  {
    id: 'dompteur-de-bertha',
    glyphe: '⚙',
    idEpreuve: null,
    condition: 'Dix exercices de la piscine verts du premier coup.',
    regle: null
  },
  {
    id: 'le-chiffreur',
    glyphe: '⌘',
    idEpreuve: 'J06',
    condition: 'Le code de César, aller et retour.',
    regle: { type: 'exercices', exercices: ['ex06'] }
  },
  {
    id: 'ciseaux-d-or',
    glyphe: '✂',
    idEpreuve: 'J06',
    condition: 'Tous les exercices de chaînes non-bonus validés.',
    regle: { type: 'obligatoires' }
  },
  {
    id: 'maitre-des-fichiers',
    glyphe: '▤',
    idEpreuve: 'J07',
    condition: 'Le cycle OPEN, READ, WRITE, CLOSE maîtrisé : ex00 à ex04 validés.',
    regle: { type: 'exercices', exercices: ['ex00', 'ex01', 'ex02', 'ex03', 'ex04'] }
  },
  {
    id: 'gardien-des-cles',
    glyphe: '⌸',
    idEpreuve: 'J08',
    condition: "L'accès direct sans fausse note : ex00 à ex05 validés.",
    regle: { type: 'exercices', exercices: ['ex00', 'ex01', 'ex02', 'ex03', 'ex04', 'ex05'] }
  },
  {
    id: 'guichetier',
    glyphe: '⌂',
    idEpreuve: 'J08',
    condition: 'Le mini-guichet en boucle rendu.',
    regle: { type: 'exercices', exercices: ['ex06'] }
  },
  {
    id: 'maitre-des-ruptures',
    glyphe: '⇅',
    idEpreuve: 'J09',
    condition: "L'état par ville rendu, dernier sous-total compris.",
    regle: { type: 'exercices', exercices: ['ex06'] }
  },
  {
    id: 'l-architecte',
    glyphe: '❖',
    idEpreuve: 'J09',
    condition: 'Le découpage en sous-programme et le copybook validés.',
    regle: { type: 'exercices', exercices: ['ex04', 'ex05'] }
  },
  {
    id: 'diplome-de-la-piscine',
    glyphe: '★',
    idEpreuve: 'J10',
    condition: "L'examen final passé avec au moins 120 XP.",
    regle: { type: 'xpExercices', minimum: 120 }
  },
  {
    id: 'guichetier-d-or',
    glyphe: '◉',
    idEpreuve: 'M01',
    condition: "Josiane n'a pas réussi à le faire planter : mission validée.",
    regle: { type: 'validee' }
  },
  {
    id: 'architecte-de-la-paie',
    glyphe: '⊕',
    idEpreuve: 'M02',
    condition: 'Le centime de 1004 est tombé juste : mission validée.',
    regle: { type: 'validee' }
  },
  {
    id: 'seigneur-du-fifo',
    glyphe: '⇉',
    idEpreuve: 'M03',
    condition: "Les lots dans l'ordre, l'expert-comptable sourit : mission validée.",
    regle: { type: 'validee' }
  },
  {
    id: 'pontifex',
    glyphe: '⇄',
    idEpreuve: 'M04',
    condition: 'Le pont entre les deux mondes tient, le JSON a validé : mission validée.',
    regle: { type: 'validee' }
  },
  {
    id: 'necromancien',
    glyphe: '☠',
    idEpreuve: 'M05',
    condition: 'Gégé est vengé : le programme de 1979 revit, mission validée.',
    regle: { type: 'validee' }
  },
  {
    id: 'gardien-du-mainframe',
    glyphe: '⛨',
    idEpreuve: 'M06',
    condition: 'La balance carrée à quatre heures du matin : mission validée.',
    regle: { type: 'validee' }
  },
  {
    id: 'premier-jcl',
    glyphe: '▣',
    idEpreuve: 'PHASE3',
    condition: 'Premier job soumis sur un vrai z/OS : le jalon Z Xplore Fundamentals coché.',
    regle: { type: 'exercices', exercices: ['s1'] }
  },
  {
    id: 'dompteur-de-vsam',
    glyphe: '◈',
    idEpreuve: 'PHASE3',
    condition: 'Un KSDS défini et exploité : le jalon VSAM coché.',
    regle: { type: 'exercices', exercices: ['s3'] }
  }
]

/** Les 26 décorations, dans l'ordre du livret. */
export const badges = Object.freeze(
  CATALOGUE.map((badge) =>
    Object.freeze({
      ...badge,
      nom: libelleBadge(badge.id),
      regle: badge.regle ? Object.freeze({ ...badge.regle }) : null,
      surLHonneur: badge.regle === null
    })
  )
)

/** Les identifiants des décorations, dans l'ordre du livret. */
export const idsBadges = Object.freeze(badges.map((b) => b.id))

const PAR_ID = new Map(badges.map((b) => [b.id, b]))

/** Une décoration par son identifiant, ou null. */
export function badgeParId(id) {
  return PAR_ID.get(id) ?? null
}

/** Vrai quand l'application sait mesurer elle-même la condition. */
export function badgeAutomatique(id) {
  return badgeParId(id)?.regle != null
}

/** Les décorations que met en jeu une épreuve, dans l'ordre du livret. */
export function badgesDeLEpreuve(idEpreuve) {
  return badges.filter((b) => b.idEpreuve === idEpreuve)
}
