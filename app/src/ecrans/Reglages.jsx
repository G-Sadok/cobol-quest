// REGLAGES (cahier des charges, §5.6) : le rythme de formation, l'affichage,
// l'export et l'import de la progression par les boites natives de macOS, et
// la remise a zero a double confirmation.
//
// Tout ce qui s'affiche sort du module pur ui/reglages.js ; cet ecran tient
// deux choses seulement : le rang de la boite de confirmation ouverte, et le
// releve du dernier mouvement de fichier (il ne part pas dans la progression,
// il ne vaut que pour la session en cours).

import { useCallback, useState } from 'react'
import { definirReglage, remiseAZero } from '../store/progression.js'
import Ecran, { EnteteEcran } from '../ui/Ecran.jsx'
import Modale from '../ui/Modale.jsx'
import { useApp } from '../ui/contexte.js'
import { ecranParId } from '../ui/ecrans.js'
import {
  ETAPES_EFFACEMENT,
  etapeEffacement,
  mouvementExport,
  mouvementImport,
  mouvementRemiseAZero,
  reglages,
  verdictInterrupteur,
  verdictRythme
} from '../ui/reglages.js'

export default function Reglages() {
  const { etat, appliquer, remplacer, persistance, annoncer } = useApp()
  const [rang, setRang] = useState(0)
  const [releve, setReleve] = useState(null)

  const fichierPresent = persistance.presente()
  const vue = reglages(etat, fichierPresent)
  const etape = etapeEffacement(rang, vue.resume)

  const fermerBoite = useCallback(() => setRang(0), [])

  function rendreCompte(mouvement) {
    setReleve(mouvement)
    annoncer(mouvement.toast, mouvement.ton)
  }

  function choisirRythme(ligne) {
    if (ligne.actif) return
    appliquer(definirReglage, 'rythme', ligne.id)
    const verdict = verdictRythme(ligne)
    annoncer(verdict.texte, verdict.ton)
  }

  function basculer(ligne) {
    const actif = !ligne.actif
    appliquer(definirReglage, ligne.clef, actif)
    const verdict = verdictInterrupteur(ligne, actif)
    annoncer(verdict.texte, verdict.ton)
  }

  async function exporter() {
    rendreCompte(mouvementExport(await persistance.exporter(etat)))
  }

  async function importer() {
    const rapport = await persistance.importer()
    if (rapport?.ok) remplacer(rapport.etat)
    rendreCompte(mouvementImport(rapport))
  }

  // La derniere marche : le dossier part, les reglages restent.
  function avancerEffacement() {
    if (rang < ETAPES_EFFACEMENT) {
      setRang(rang + 1)
      return
    }
    const emporte = vue.resume
    appliquer(remiseAZero)
    setRang(0)
    rendreCompte(mouvementRemiseAZero(emporte))
  }

  return (
    <Ecran largeur={ecranParId('reglages').largeur}>
      <EnteteEcran
        label="POSTE DE TRAVAIL"
        titre="Réglages"
        chapo="Votre progression, votre rythme et l'affichage de l'application."
      />

      <section className="reglages-bloc" aria-labelledby="reglages-rythme">
        <div className="etiquette-mono" id="reglages-rythme">
          RYTHME DE FORMATION
        </div>
        <div className="carte" role="radiogroup" aria-labelledby="reglages-rythme">
          {vue.rythmes.map((ligne) => (
            <button
              key={ligne.id}
              type="button"
              role="radio"
              aria-checked={ligne.actif}
              className="reglage-ligne rythme-ligne"
              onClick={() => choisirRythme(ligne)}
            >
              <span className="rythme-puce" aria-hidden="true">
                <span className="rythme-point" />
              </span>
              <span className="reglage-corps">
                <span className="reglage-nom">{ligne.nom}</span>
              </span>
              <span className="rythme-cadence">{ligne.detail}</span>
            </button>
          ))}
        </div>
        <p className="reglages-note">
          Le rythme n’ouvre ni ne ferme aucune salle : il dit seulement la cadence que vous visez.
        </p>
      </section>

      <section className="reglages-bloc" aria-labelledby="reglages-affichage">
        <div className="etiquette-mono" id="reglages-affichage">
          AFFICHAGE
        </div>
        <div className="carte">
          {vue.interrupteurs.map((ligne) => (
            <div key={ligne.clef} className="reglage-ligne">
              <span className="reglage-corps">
                <span className="reglage-nom">{ligne.nom}</span>
                <span className="reglage-detail">{ligne.detail}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={ligne.actif}
                aria-label={ligne.nom}
                className="interrupteur"
                onClick={() => basculer(ligne)}
              >
                <span className="interrupteur-pastille" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="reglages-bloc" aria-labelledby="reglages-progression">
        <div className="etiquette-mono" id="reglages-progression">
          PROGRESSION
        </div>
        <div className="carte reglages-progression">
          <button
            type="button"
            className="bouton-secondaire"
            disabled={!fichierPresent}
            onClick={exporter}
          >
            Exporter…
          </button>
          <button
            type="button"
            className="bouton-secondaire"
            disabled={!fichierPresent}
            onClick={importer}
          >
            Importer…
          </button>
          <p className="reglages-releve" data-ton={releve?.ton ?? 'oui'} role="status">
            {releve?.ligne ?? vue.ligneProgression}
          </p>
        </div>
      </section>

      <div className="reglages-danger">
        <div className="reglages-danger-corps">
          <div className="reglages-danger-titre">Remise à zéro</div>
          <div className="reglages-danger-texte">
            XP, décorations, salles et quiz. Marcel ne le dira à personne, mais il sera déçu.
          </div>
        </div>
        <button type="button" className="bouton-danger" onClick={() => setRang(1)}>
          Tout effacer…
        </button>
      </div>

      {etape ? (
        <Modale
          titre={etape.titre}
          corps={etape.corps}
          confirmer={etape.confirmer}
          annuler={etape.annuler}
          onConfirmer={avancerEffacement}
          onAnnuler={fermerBoite}
        />
      ) : null}
    </Ecran>
  )
}
