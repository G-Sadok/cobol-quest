// LE TERMINAL, le tableau de bord de l'apprenti (cahier des charges, §5.1).
//
// Toutes les donnees affichees sortent du module pur ui/tableauDeBord.js : cet
// ecran ne fait que les mettre en page, dans la grille du design (colonne de
// travail a gauche, colonne de service a droite).

import { useEffect, useState } from 'react'
import { citationDeMarcel } from '../data/citations.js'
import Console from '../ui/Console.jsx'
import Ecran, { EnteteEcran } from '../ui/Ecran.jsx'
import EtatVide from '../ui/EtatVide.jsx'
import { useApp } from '../ui/contexte.js'
import { ecranParId } from '../ui/ecrans.js'
import { espacerMilliers } from '../ui/format.js'
import {
  carriere,
  dernieresDecorations,
  epreuveDuMoment,
  releveDeService,
  salles
} from '../ui/tableauDeBord.js'

// Le temps pendant lequel le bouton de la console dit « COPIE ».
const DUREE_COPIE = 2000

function accorder(nombre, mot) {
  return `${nombre} ${mot}${nombre > 1 ? 's' : ''}`
}

export default function Terminal() {
  const { etat, aller, ouvrirSujet } = useApp()
  const [copie, setCopie] = useState(false)

  const moment = epreuveDuMoment(etat)
  const compte = salles(etat)
  const decorations = dernieresDecorations(etat)
  const releve = releveDeService(etat)
  const parcours = carriere(etat)
  const citation = citationDeMarcel(moment.epreuve.id)

  useEffect(() => {
    if (!copie) return undefined
    const minuterie = setTimeout(() => setCopie(false), DUREE_COPIE)
    return () => clearTimeout(minuterie)
  }, [copie])

  function copierLaCommande() {
    if (!moment.commande || !navigator.clipboard) return
    navigator.clipboard.writeText(moment.commande).then(
      () => setCopie(true),
      () => setCopie(false)
    )
  }

  const mesure =
    moment.unite === 'XP'
      ? `seuil de validation ${moment.total} XP`
      : `${accorder(moment.total, 'jalon')} à cocher`

  return (
    <Ecran largeur={ecranParId('terminal').largeur}>
      <EnteteEcran
        label="POSTE 07 · NANTERRE · 2e SOUS-SOL"
        titre="Bonjour. BERTHA vous attend."
        chapo={`${accorder(compte.validees, 'salle')} derrière vous, ${compte.restantes} devant.`}
      />

      <div className="terminal-grille">
        <div className="terminal-colonne">
          <section className="carte" aria-labelledby="terminal-moment">
            <div className="carte-tete">
              <span className="moment-point" aria-hidden="true" />
              <span className="etiquette-mono etiquette-ambre">EPREUVE EN COURS</span>
            </div>
            <div className="carte-corps">
              <div className="moment">
                <div className="moment-fiche">
                  <div className="moment-intitule">
                    <span className="moment-code">{moment.epreuve.id}</span>
                    <h2 className="moment-titre" id="terminal-moment">
                      {moment.epreuve.titre}
                    </h2>
                  </div>
                  <div className="moment-lieu">
                    {moment.lieu} · {mesure}
                  </div>
                  <div className="moment-avancement">
                    <div className="jauge jauge-ambre">
                      <div
                        className="jauge-remplissage"
                        style={{ width: `${Math.round(moment.avancement * 100)}%` }}
                      />
                    </div>
                    <span className="moment-mesure">
                      {moment.faits} / {moment.total} {moment.unite}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="bouton-primaire"
                  onClick={() => ouvrirSujet(moment.epreuve.id)}
                >
                  {moment.validee ? 'Revoir' : 'Reprendre'}
                </button>
              </div>

              <div className="moment-console">
                <Console
                  action={
                    moment.commande ? (
                      <button type="button" className="bouton-console" onClick={copierLaCommande}>
                        {copie ? 'COPIE' : 'COPIER'}
                      </button>
                    ) : null
                  }
                >
                  {moment.commande
                    ? `$ ${moment.commande}`
                    : "$ ici BERTHA ne juge pas : la salle machine se valide sur l'honneur"}
                </Console>
              </div>
            </div>
          </section>

          <section className="decorations">
            <div className="section-tete">
              <span className="etiquette-mono">DERNIERES DECORATIONS</span>
              <button type="button" className="bouton-lien" onClick={() => aller('livret')}>
                Tout le livret →
              </button>
            </div>
            {decorations.length === 0 ? (
              <EtatVide
                texte="Aucune décoration pour l’instant. La première tombe dès la première salle validée."
                action={
                  <button type="button" className="bouton-lien" onClick={() => aller('livret')}>
                    Voir ce qu’il y a à décrocher →
                  </button>
                }
              />
            ) : (
              <div className="decorations-grille">
                {decorations.map((decoration) => (
                  <div className="decoration" key={decoration.id}>
                    <div className="decoration-medaille" aria-hidden="true">
                      {decoration.glyphe}
                    </div>
                    <div className="decoration-nom">{decoration.libelle}</div>
                    <div className="decoration-source">
                      {decoration.idEpreuve ? `Épreuve ${decoration.idEpreuve}` : 'Toute la piscine'}
                      {decoration.surLHonneur ? ' · sur l’honneur' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="terminal-colonne">
          {citation ? (
            <section className="citation">
              <div className="etiquette-mono">MEMO DE MARCEL</div>
              <p className="citation-texte">« {citation.texte} »</p>
              <div className="citation-source">
                {citation.auteur ? `${citation.auteur} · ` : ''}
                {citation.idEpreuve}
              </div>
            </section>
          ) : null}

          <section className="carte releve">
            <div className="etiquette-mono">ECHELON EN COURS</div>
            <div className="releve-echelon">{parcours.echelon.titre}</div>
            <div className="jauge releve-jauge">
              <div
                className="jauge-remplissage"
                style={{ width: `${Math.round(parcours.avancement * 100)}%` }}
              />
            </div>
            <div className="releve-pied">
              <span>
                Échelon {parcours.echelon.niveau} / {parcours.dernier.niveau}
              </span>
              <span className="releve-xp">{espacerMilliers(parcours.xp)} XP</span>
            </div>
            <div className="releve-vise">
              {!parcours.suivant
                ? 'Sommet de la carrière atteint'
                : parcours.xpAvant > 0
                  ? `Encore ${espacerMilliers(parcours.xpAvant)} XP avant ${parcours.suivant.titre}`
                  : `Prochain : ${parcours.suivant.titre}`}
            </div>

            <div className="etiquette-mono releve-label">RELEVE DE SERVICE</div>
            {releve.map((ligne) => (
              <div className="releve-ligne" key={ligne.cle}>
                <span>{ligne.cle}</span>
                <span className="releve-valeur">{ligne.valeur}</span>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </Ecran>
  )
}
