// LE LECTEUR DE SUJET (cahier des charges, §5.3) : le texte de l'epreuve dans
// sa colonne de lecture, et la feuille de route dans le volet de droite.
//
// L'ecran a sa propre mise en page a deux volets : il n'emprunte pas
// l'enveloppe commune ui/Ecran.jsx. Tout ce qu'il affiche en tete comme en pied
// sort du module pur ui/lecteur.js ; le corps du sujet passe par ui/Markdown.jsx.
// Le volet de droite vit dans ecrans/FeuilleDeRoute.jsx.

import { useEffect, useRef } from 'react'
import FeuilleDeRoute from './FeuilleDeRoute.jsx'
import Markdown from '../ui/Markdown.jsx'
import { ouvrirEpreuve } from '../store/progression.js'
import { useApp } from '../ui/contexte.js'
import { ficheLecture, voisines } from '../ui/lecteur.js'

function Voisine({ sens, epreuve, ouvrir }) {
  if (!epreuve) return <span className="lecteur-bord" />

  const fleche = sens === 'precedente' ? '‹' : '›'
  const libelle = sens === 'precedente' ? 'Salle précédente' : 'Salle suivante'

  return (
    <button
      type="button"
      className="lecteur-voisine"
      data-sens={sens}
      disabled={!epreuve.accessible}
      title={epreuve.annonce}
      aria-label={`${libelle} : ${epreuve.annonce}`}
      onClick={() => ouvrir(epreuve.id)}
    >
      {sens === 'precedente' ? (
        <span className="lecteur-fleche" aria-hidden="true">
          {fleche}
        </span>
      ) : null}
      <span className="lecteur-voisine-texte">
        <span className="lecteur-voisine-sens">{libelle}</span>
        <span className="lecteur-voisine-titre">
          {epreuve.id} · {epreuve.titre}
        </span>
      </span>
      {sens === 'suivante' ? (
        <span className="lecteur-fleche" aria-hidden="true">
          {fleche}
        </span>
      ) : null}
    </button>
  )
}

export default function Lecteur() {
  const { etat, appliquer, ouvrirSujet } = useApp()
  const haut = useRef(null)

  const fiche = ficheLecture(etat)
  const bords = voisines(etat, fiche.epreuve.id)

  // Arriver ici par la barre laterale, c'est ouvrir un sujet comme un autre :
  // on le retient, sinon cocher la derniere case le remplacerait par le
  // suivant sous les yeux du lecteur (ui/lecteur.js, epreuveLue).
  useEffect(() => {
    if (etat.epreuveOuverte !== fiche.epreuve.id) {
      appliquer(ouvrirEpreuve, fiche.epreuve.id)
    }
  }, [appliquer, etat.epreuveOuverte, fiche.epreuve.id])

  // Changer de salle, c'est ouvrir un autre sujet : on revient en haut du
  // texte, comme quand on repose un dossier et qu'on en prend un autre.
  useEffect(() => {
    haut.current?.scrollIntoView({ block: 'start' })
  }, [fiche.epreuve.id])

  return (
    <div className="lecteur">
      <article className="lecteur-volet">
        <div className="lecteur-colonne" ref={haut}>
          <div className="lecteur-entete">
            <div className="etiquette-mono">{fiche.adresse}</div>
            <h1 className="lecteur-titre">{fiche.titre}</h1>
            <div className="lecteur-reperes">
              <span className="puce-etat" data-etat={fiche.etat} aria-hidden="true" />
              <span>{fiche.libelleEtat}</span>
              {fiche.reperes.map((repere) => (
                <span key={repere}>{repere}</span>
              ))}
            </div>
            {fiche.sousTitre ? <p className="lecteur-precision">{fiche.sousTitre}</p> : null}
          </div>

          {fiche.absent ? (
            <p className="lecteur-absent">
              Le sujet <code className="md-puce-code">{fiche.chemin}</code> ne se trouve pas dans
              l’application. Relancez la synchronisation du corpus
              (<code className="md-puce-code">npm run sync:corpus</code>) puis recompilez.
            </p>
          ) : (
            <Markdown texte={fiche.corps} />
          )}

          <nav className="lecteur-bords" aria-label="Navigation entre les salles">
            <Voisine sens="precedente" epreuve={bords.precedente} ouvrir={ouvrirSujet} />
            <Voisine sens="suivante" epreuve={bords.suivante} ouvrir={ouvrirSujet} />
          </nav>
        </div>
      </article>

      <aside className="lecteur-panneau">
        <div className="lecteur-panneau-tete">
          <div className="lecteur-panneau-titre">Feuille de route</div>
          <div className="lecteur-panneau-chapo">Cochez au fil de l’eau. BERTHA vérifie.</div>
        </div>
        <FeuilleDeRoute idEpreuve={fiche.epreuve.id} />
      </aside>
    </div>
  )
}
