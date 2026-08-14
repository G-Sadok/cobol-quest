// LE GUIDE : le mode d'emploi de l'application, chapitre par chapitre.
//
// Tout ce qui s'affiche sort du module pur ui/guide.js, qui lit l'etat de
// l'apprenti : cet ecran ne fait que poser le resultat et rendre les gestes au
// contexte. Un seul chapitre est ouvert a la fois (un accordeon), et celui qui
// s'ouvre en arrivant est celui qui parle de ce qu'il y a a faire maintenant.

import { useEffect, useState } from 'react'
import Ecran, { EnteteEcran } from '../ui/Ecran.jsx'
import { useApp } from '../ui/contexte.js'
import { ecranParId } from '../ui/ecrans.js'
import { chapitreDuMoment, chapitres, prochainPas } from '../ui/guide.js'

/** Le bouton d'un geste : changer d'ecran, ou ouvrir une epreuve. */
function Geste({ geste, primaire }) {
  const { aller, ouvrirSujet } = useApp()
  if (!geste) return null

  return (
    <button
      type="button"
      className={primaire ? 'bouton-primaire' : 'bouton-secondaire'}
      onClick={() => (geste.type === 'sujet' ? ouvrirSujet(geste.cible) : aller(geste.cible))}
    >
      {geste.libelle}
    </button>
  )
}

function Chapitre({ chapitre, ouvert, basculer }) {
  return (
    <section className="guide-chapitre" data-ouvert={ouvert ? '1' : '0'}>
      <button
        type="button"
        className="guide-tete"
        aria-expanded={ouvert}
        onClick={() => basculer(chapitre.id)}
      >
        <span className="guide-numero" aria-hidden="true">
          {String(chapitre.numero).padStart(2, '0')}
        </span>
        <span className="guide-tete-texte">
          <span className="etiquette-mono">{chapitre.label}</span>
          <span className="guide-titre">{chapitre.titre}</span>
          <span className="guide-resume">{chapitre.resume}</span>
        </span>
        <span className="guide-chevron" aria-hidden="true">
          {ouvert ? '−' : '+'}
        </span>
      </button>

      {ouvert ? (
        <div className="guide-corps">
          {chapitre.etat ? (
            <p className="guide-etat" data-ton={chapitre.etat.ton}>
              {chapitre.etat.texte}
            </p>
          ) : null}

          {chapitre.commande ? (
            <div className="guide-console">
              <div className="guide-console-label">BERTHA</div>
              <code className="guide-console-commande">{chapitre.commande}</code>
            </div>
          ) : null}

          {chapitre.chemin ? <code className="guide-chemin">{chapitre.chemin}</code> : null}

          <ul className="guide-points">
            {chapitre.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          {chapitre.raccourcis ? (
            <div className="guide-raccourcis">
              {chapitre.raccourcis.map((raccourci) => (
                <div key={raccourci.touche} className="guide-raccourci">
                  <kbd className="guide-touche">{raccourci.touche}</kbd>
                  <span className="guide-raccourci-nom">{raccourci.libelle}</span>
                  <span className="guide-raccourci-precision">{raccourci.precision}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="guide-geste">
            <Geste geste={chapitre.geste} />
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default function Guide() {
  const { etat, charge } = useApp()
  const [ouvert, setOuvert] = useState(null)

  // La progression arrive du fichier apres le premier rendu : on attend de
  // l'avoir lue pour decider quel chapitre ouvrir, sinon le guide s'ouvrirait
  // toujours sur « vous n'avez rien fait ».
  useEffect(() => {
    if (charge) setOuvert((deja) => deja ?? chapitreDuMoment(etat))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge])

  const suite = prochainPas(etat)
  const liste = chapitres(etat)

  function basculer(id) {
    setOuvert((deja) => (deja === id ? null : id))
  }

  return (
    <Ecran largeur={ecranParId('guide').largeur}>
      <EnteteEcran
        label="MODE D EMPLOI"
        titre="Le guide"
        chapo="Comment se servir de l’application, à partir de là où vous en êtes."
      />

      <section className="guide-suite" aria-label="Ce qu’il y a à faire maintenant">
        <div className="etiquette-mono">OU VOUS EN ETES</div>
        <p className="guide-suite-texte" data-ton={suite.ton}>
          {suite.texte}
        </p>
        <Geste geste={suite.geste} primaire />
      </section>

      <div className="guide-chapitres">
        {liste.map((chapitre) => (
          <Chapitre
            key={chapitre.id}
            chapitre={chapitre}
            ouvert={ouvert === chapitre.id}
            basculer={basculer}
          />
        ))}
      </div>

      <p className="guide-pied">
        Ce guide se met à jour tout seul : il parle de votre dossier, pas d’un
        parcours imaginaire. BERTHA, elle, ne se met à jour pour personne.
      </p>
    </Ecran>
  )
}
