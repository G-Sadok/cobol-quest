// LA FEUILLE DE ROUTE (cahier des charges, §5.3) : le volet de droite du
// lecteur. Les cases des exercices et des bonus, les XP credites ou retires,
// la jauge du seuil du jour et l'encart de la commande BERTHA.
//
// Module PUR (comme ui/carte.js et ui/lecteur.js) : il derive tout de l'etat
// et du manifeste sans toucher a React ni au DOM. Le volet ne fait que poser
// des lignes ; c'est ici que se decide ce qu'elles disent.
//
// Deux regles du store se retrouvent ici telles quelles : la validation ne
// compte QUE les XP d'exercices (le quiz du soir est un bonus de revision),
// et la phase 3, que BERTHA ne juge pas, se compte en jalons coches.

import {
  commandeBertha,
  epreuveParId,
  exercicesBonus,
  exercicesObligatoires
} from '../data/programme.js'
import {
  XP_QUIZ,
  epreuveValidee,
  exerciceCoche,
  quizReussi,
  xpExercices,
  xpParEpreuve
} from '../store/progression.js'

/** Le nom commun d'une epreuve, pour les phrases de la feuille de route. */
export function nomEpreuve(epreuve) {
  if (epreuve.phase === 'missions') return 'la mission'
  if (epreuve.phase === 'phase3') return 'la phase 3'
  return epreuve.id.startsWith('RUSH') ? 'le rush' : 'la journée'
}

/** Le participe accorde qui va avec ce nom commun. */
export function accordValide(epreuve) {
  return nomEpreuve(epreuve).startsWith('le ') ? 'validé' : 'validée'
}

function pourcent(part, tout) {
  if (!(tout > 0)) return 0
  return Math.max(0, Math.min(100, (part / tout) * 100))
}

/**
 * Une ligne de la feuille de route : une case a cocher, un intitule, des XP.
 *
 * `annonce` est ce qu'entend un lecteur d'ecran : la case seule ne dit pas ce
 * qu'elle rapporte, et l'XP en ambre est un chiffre nu a cote du titre.
 */
export function ligneExercice(etat, epreuve, exercice) {
  const coche = exerciceCoche(etat, epreuve.id, exercice.id)
  return {
    id: exercice.id,
    titre: exercice.titre,
    xp: exercice.xp,
    xpLibelle: `+${exercice.xp} XP`,
    estBonus: exercice.estBonus,
    coche,
    commande: commandeBertha(exercice),
    annonce: `${exercice.titre}, ${exercice.xp} XP${exercice.estBonus ? ', bonus' : ''}`
  }
}

/**
 * La jauge du seuil et son repere ambre.
 *
 * La piste vaut le bareme des exercices obligatoires : cocher tous les bonus
 * ne fait donc jamais deborder la barre, mais leurs XP comptent bien dans le
 * remplissage comme dans le total du jour. La phase 3, sans bareme, se jauge
 * en jalons.
 */
export function jaugeSeuil(etat, idEpreuve) {
  const epreuve = epreuveParId(idEpreuve)
  if (!epreuve) return null

  const obligatoires = exercicesObligatoires(epreuve)
  const faits = obligatoires.filter((ex) => exerciceCoche(etat, epreuve.id, ex.id)).length
  const validee = epreuveValidee(etat, epreuve.id)
  const surLHonneur = Boolean(epreuve.surLHonneur)

  const acquis = surLHonneur ? faits : xpExercices(etat, epreuve.id)
  const base = surLHonneur ? obligatoires.length : epreuve.xpBase

  return {
    surLHonneur,
    faits,
    total: obligatoires.length,
    compteur: `${faits} / ${obligatoires.length}`,
    acquis,
    seuil: surLHonneur ? obligatoires.length : epreuve.seuilValidation,
    remplissage: pourcent(acquis, base),
    repere: pourcent(surLHonneur ? obligatoires.length : epreuve.seuilValidation, base),
    validee,
    legende: surLHonneur
      ? `Sans moulinette, ${nomEpreuve(epreuve)} se valide en cochant ses ${obligatoires.length} jalons.`
      : `Repère ambre : ${epreuve.seuilValidation} XP, ${nomEpreuve(epreuve)} est ${accordValide(epreuve)}.`
  }
}

/**
 * L'encart BERTHA : la moulinette fait foi, une case ne se coche qu'apres
 * elle. On affiche la commande du prochain exercice a rendre ; quand tout est
 * coche, celle du dernier, pour pouvoir repasser derriere soi.
 */
export function encartBertha(etat, idEpreuve) {
  const epreuve = epreuveParId(idEpreuve)
  if (!epreuve) return null

  if (epreuve.surLHonneur) {
    return {
      exercice: null,
      commande: null,
      texte: 'BERTHA ne juge pas la phase 3 : ses jalons se cochent sur l’honneur.'
    }
  }

  const restants = epreuve.exercices.filter((ex) => !exerciceCoche(etat, epreuve.id, ex.id))
  const vise = restants[0] ?? epreuve.exercices[epreuve.exercices.length - 1]

  return {
    exercice: { id: vise.id, titre: vise.titre },
    commande: commandeBertha(vise),
    texte:
      restants.length > 0
        ? 'BERTHA fait foi : une case ne se coche qu’après un RC=0000.'
        : 'Tout est passé sous BERTHA. Cette commande repasse derrière vous.'
  }
}

/**
 * Le verdict annonce par le toast a chaque bascule (design 6.2 et 6.6) : les
 * XP credites ou retires. MAJUSCULES sans accents, comme les sorties COBOL.
 */
export function verdictBascule(exercice, coche) {
  return {
    ton: coche ? 'oui' : 'non',
    texte: `BERTHA DIT ${coche ? 'OUI' : 'NON'} · ${exercice.id.toUpperCase()} · ${
      coche ? '+' : '-'
    }${exercice.xp} XP`
  }
}

/**
 * Tout le volet de droite en un objet : les deux blocs de lignes, la jauge,
 * le total du jour et l'encart de la moulinette.
 */
export function feuilleDeRoute(etat, idEpreuve) {
  const epreuve = epreuveParId(idEpreuve)
  if (!epreuve) return null

  const jauge = jaugeSeuil(etat, epreuve.id)
  const xp = xpParEpreuve(etat, epreuve.id)

  return {
    epreuve,
    obligatoires: exercicesObligatoires(epreuve).map((ex) => ligneExercice(etat, epreuve, ex)),
    bonus: exercicesBonus(epreuve).map((ex) => ligneExercice(etat, epreuve, ex)),
    jauge,
    xpTotal: xp,
    xpQuiz: quizReussi(etat, epreuve.id) ? XP_QUIZ : 0,
    tampon: jauge.validee ? (xp > 0 ? `VALIDE +${xp}` : 'VALIDE') : null,
    bertha: encartBertha(etat, epreuve.id)
  }
}
