// LA CARTE, le plan des sous-sols de la CGBA (cahier des charges, §5.2) : le
// couloir de la piscine, ses deux salles de rush en retrait, les bureaux des
// missions et la salle machine du fond.
//
// Module PUR (comme ui/ecrans.js et ui/tableauDeBord.js) : il derive tout de
// l'etat sans toucher a React ni au DOM. L'ecran ne fait que poser des tuiles ;
// c'est ici que se decide l'etat d'une salle, ce qu'elle annonce et si on peut
// y entrer.

import { epreuveParId, epreuvesDeLaPhase } from '../data/programme.js'
import { ETATS_EPREUVE, epreuveValidee, etatEpreuve, xpParEpreuve } from '../store/progression.js'

/** L'etiquette d'une salle, dans la casse de phrase du design. */
export const LIBELLES_ETAT = Object.freeze({
  verrouillee: 'Verrouillée',
  disponible: 'Disponible',
  'en-cours': 'En cours',
  validee: 'Validée'
})

/**
 * Les memes etats en capitales, pour le bandeau mono de la salle machine.
 * Regle de typographie du design (section 2) : les MAJUSCULES perdent leurs
 * accents, comme les sorties COBOL.
 */
export const LIBELLES_ETAT_MAJUSCULE = Object.freeze({
  verrouillee: 'VERROUILLEE',
  disponible: 'DISPONIBLE',
  'en-cours': 'EN COURS',
  validee: 'VALIDEE'
})

/** La legende de l'ecran : les quatre etats de salle, dans l'ordre du design. */
export const LEGENDE = Object.freeze(
  ETATS_EPREUVE.map((etat) => Object.freeze({ etat, libelle: LIBELLES_ETAT[etat] }))
)

/** Les deux rushs : des salles laterales du couloir, pas des journees. */
export const IDS_RUSH = Object.freeze(['RUSH01', 'RUSH02'])

/** La salle du fond : la phase 3, que BERTHA ne juge pas. */
export const ID_SALLE_MACHINE = 'PHASE3'

/**
 * Une salle du plan : son etat, son etiquette, son tampon et ce qu'elle
 * annonce au survol comme au lecteur d'ecran.
 *
 * Le tampon porte les XP REELLEMENT gagnes sur l'epreuve, quiz du soir
 * compris : c'est ce qui rend la progression tangible (note d'integration 6).
 * La phase 3 ne rapporte aucun XP, son tampon se contente de « VALIDE ».
 */
export function salle(etat, idEpreuve) {
  const epreuve = epreuveParId(idEpreuve)
  if (!epreuve) return null

  const etatSalle = etatEpreuve(etat, idEpreuve)
  const verrouillee = etatSalle === 'verrouillee'
  const xp = xpParEpreuve(etat, idEpreuve)
  const prerequis = epreuve.prerequis ? epreuveParId(epreuve.prerequis) : null

  return {
    id: epreuve.id,
    titre: epreuve.titre,
    phase: epreuve.phase,
    etat: etatSalle,
    libelle: LIBELLES_ETAT[etatSalle],
    xp,
    tampon: etatSalle === 'validee' ? (xp > 0 ? `VALIDE +${xp}` : 'VALIDE') : null,
    ouvrable: !verrouillee,
    annonce: verrouillee
      ? `${epreuve.id} ${epreuve.titre} : verrouillée, validez d’abord ${prerequis.id} (${prerequis.titre}).`
      : etatSalle === 'validee'
        ? `${epreuve.id} ${epreuve.titre} : validée, ${xp} XP. Revoir le sujet.`
        : `${epreuve.id} ${epreuve.titre} : ${LIBELLES_ETAT[etatSalle].toLowerCase()}. Ouvrir le sujet.`
  }
}

/** Le couloir de la piscine : les onze journees J00 a J10, dans l'ordre. */
export function couloirPiscine(etat) {
  return epreuvesDeLaPhase('piscine')
    .filter((epreuve) => !IDS_RUSH.includes(epreuve.id))
    .map((epreuve) => salle(etat, epreuve.id))
}

/** Les deux salles de rush, en retrait du couloir. */
export function sallesRush(etat) {
  return IDS_RUSH.map((id) => salle(etat, id))
}

/** Les six bureaux des missions, au niveau du dessous. */
export function bureauxMissions(etat) {
  return epreuvesDeLaPhase('missions').map((epreuve) => salle(etat, epreuve.id))
}

/** La salle machine IBM : la phase 3, seule et au fond du plan. */
export function salleMachine(etat) {
  return salle(etat, ID_SALLE_MACHINE)
}

/** Les salles franchies d'une phase, pour le compteur des en-tetes de niveau. */
export function comptePhase(etat, phase) {
  const concernees = epreuvesDeLaPhase(phase)
  const validees = concernees.filter((epreuve) => epreuveValidee(etat, epreuve.id)).length
  return { validees, total: concernees.length }
}
