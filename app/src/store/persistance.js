// Le branchement de la progression sur le fichier reel.
//
// Cote Electron, tout passe par le pont `window.cgba` du preload : le rendu
// n'ecrit jamais lui-meme sur le disque (cahier des charges, §4). Cote
// navigateur de developpement, le pont n'existe pas : on garde la progression
// en memoire pour que l'application reste jouable, en sachant qu'un
// rechargement de la page la perd. C'est le repli, pas le regime normal.
//
// L'ecriture est amortie : une sauvegarde au plus toutes les 500 ms, plus un
// vidage immediat quand le processus principal annonce la fermeture.

import { deserialiser, etatInitial, serialiser } from './progression.js'

/** Delai d'amortissement des ecritures (§4 du cahier des charges). */
export const DELAI_SAUVEGARDE = 500

function pontParDefaut() {
  if (typeof window === 'undefined') return null
  return window.cgba?.present ? window.cgba : null
}

/**
 * Cree la persistance de la session.
 *
 * options.pont   pont a utiliser (par defaut `window.cgba`, null en repli)
 * options.delai  amortissement des ecritures, en millisecondes
 *
 * Rend :
 *   presente()          vrai quand le fichier reel est accessible
 *   charger()           { ok, etat, erreur }
 *   planifier(etat)     programme une sauvegarde amortie
 *   vider()             ecrit tout de suite ce qui attend
 *   exporter(etat)      boite « Enregistrer sous » (T17)
 *   importer()          boite « Ouvrir » + relecture (T17)
 *   arreter()           annule l'attente et debranche la fermeture
 */
export function creerPersistance(options = {}) {
  const pont = options.pont === undefined ? pontParDefaut() : options.pont
  const delai = options.delai ?? DELAI_SAUVEGARDE

  let minuteur = null
  let enAttente = null
  let memoire = null

  // Le repli memoire garde la meme forme que le fichier : ce qui se relit en
  // developpement se relit a l'identique dans l'application empaquetee.
  async function ecrire(etat) {
    const paquet = serialiser(etat)
    if (!pont) {
      memoire = paquet
      return { ok: true, memoire: true }
    }
    try {
      return await pont.sauver(paquet)
    } catch (erreur) {
      return { ok: false, erreur: `Sauvegarde impossible : ${erreur.message}` }
    }
  }

  function annulerAttente() {
    if (minuteur === null) return
    clearTimeout(minuteur)
    minuteur = null
  }

  async function vider() {
    annulerAttente()
    if (enAttente === null) return { ok: true, rienAEcrire: true }
    const etat = enAttente
    enAttente = null
    return ecrire(etat)
  }

  function planifier(etat) {
    enAttente = etat
    if (minuteur !== null) return
    minuteur = setTimeout(() => {
      minuteur = null
      vider()
    }, delai)
  }

  // La fermeture de l'application : le principal previent, on vide le tampon
  // puis on accuse reception pour le laisser partir.
  let debrancherFermeture = null
  if (pont?.surAvantFermeture) {
    debrancherFermeture = pont.surAvantFermeture(() => {
      vider().finally(() => pont.tamponVide?.())
    })
  }

  async function charger() {
    if (!pont) {
      return { ok: true, etat: memoire ? deserialiser(memoire) : etatInitial(), memoire: true }
    }
    try {
      const rapport = await pont.charger()
      if (!rapport?.ok) {
        return { ok: false, etat: etatInitial(), erreur: rapport?.erreur ?? 'Progression illisible.' }
      }
      return { ok: true, etat: deserialiser(rapport.progression) }
    } catch (erreur) {
      return { ok: false, etat: etatInitial(), erreur: `Lecture impossible : ${erreur.message}` }
    }
  }

  async function exporter(etat) {
    if (!pont) return { ok: false, erreur: "L'export demande l'application, pas le navigateur." }
    await vider()
    try {
      return await pont.exporter(serialiser(etat))
    } catch (erreur) {
      return { ok: false, erreur: `Export impossible : ${erreur.message}` }
    }
  }

  async function importer() {
    if (!pont) return { ok: false, erreur: "L'import demande l'application, pas le navigateur." }
    annulerAttente()
    enAttente = null
    try {
      const rapport = await pont.importer()
      if (!rapport?.ok) return rapport ?? { ok: false, erreur: 'Import impossible.' }
      return { ok: true, etat: deserialiser(rapport.progression), chemin: rapport.chemin }
    } catch (erreur) {
      return { ok: false, erreur: `Import impossible : ${erreur.message}` }
    }
  }

  function arreter() {
    annulerAttente()
    enAttente = null
    if (debrancherFermeture) {
      debrancherFermeture()
      debrancherFermeture = null
    }
  }

  return {
    presente: () => Boolean(pont),
    charger,
    planifier,
    vider,
    exporter,
    importer,
    arreter
  }
}
