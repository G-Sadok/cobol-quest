// LE LIVRET (cahier des charges, §5.5) : la grille des decorations, obtenues
// ou grisees mais toujours avec leur condition affichee, et le tableau des
// neuf echelons avec l'etat courant.
//
// Tout ce qui est affiche sort du module pur ui/livret.js ; cet ecran ne fait
// que poser les tuiles et rendre les clics au store. Seules les decorations
// « sur l'honneur » se cliquent : les autres, l'application les mesure.

import { basculerBadge } from '../store/progression.js'
import Ecran, { EnteteEcran } from '../ui/Ecran.jsx'
import { useApp } from '../ui/contexte.js'
import { ecranParId } from '../ui/ecrans.js'
import { livret, verdictBadge } from '../ui/livret.js'

function Decoration({ tuile, basculer }) {
  const contenu = (
    <>
      <span className="medaille" aria-hidden="true">
        {tuile.glyphe}
      </span>
      <span className="medaille-nom">{tuile.nom}</span>
      <span className="medaille-origine">{tuile.origine}</span>
      <span className="medaille-condition">{tuile.condition}</span>
      <span className="medaille-mention">{tuile.mention}</span>
    </>
  )

  if (!tuile.basculable) {
    return (
      <div className="decoration-tuile" data-obtenue={tuile.obtenu ? '1' : '0'}>
        {contenu}
      </div>
    )
  }

  return (
    <button
      type="button"
      className="decoration-tuile"
      data-obtenue={tuile.obtenu ? '1' : '0'}
      data-honneur="1"
      aria-pressed={tuile.obtenu}
      title={
        tuile.obtenu
          ? `Rendre la décoration ${tuile.nom}`
          : `S'accorder la décoration ${tuile.nom} sur l'honneur`
      }
      onClick={() => basculer(tuile)}
    >
      {contenu}
    </button>
  )
}

export default function Livret() {
  const { etat, appliquer, annoncer } = useApp()
  const { compte, decorations, echelons, echelon } = livret(etat)

  function basculer(tuile) {
    appliquer(basculerBadge, tuile.id)
    const verdict = verdictBadge(tuile, !tuile.obtenu)
    annoncer(verdict.texte, verdict.ton)
  }

  return (
    <Ecran largeur={ecranParId('livret').largeur}>
      <EnteteEcran
        label="DOSSIER DU PERSONNEL"
        titre="Le livret"
        chapo={`Échelon ${echelon.niveau} : ${echelon.titre}. Les décorations obtenues et le tableau des neuf échelons de la CGBA.`}
      />

      <div className="livret-grille">
        <section aria-label="Décorations">
          <div className="etiquette-mono livret-titre-bloc">{compte.libelle}</div>
          <div className="decorations-mur">
            {decorations.map((tuile) => (
              <Decoration key={tuile.id} tuile={tuile} basculer={basculer} />
            ))}
          </div>
          <p className="livret-note">
            Une décoration que BERTHA sait juger tombe toute seule et se reprend si la case de
            l’exercice retombe. Les cinq autres se cochent sur l’honneur : Marcel ne vérifiera pas,
            mais vous, si.
          </p>
        </section>

        <section className="carte livret-echelons" aria-label="Grille des échelons">
          <div className="carte-tete">Grille des échelons</div>
          <ol className="echelons-liste">
            {echelons.map((ligne) => (
              <li key={ligne.niveau} className="echelon-ligne" data-position={ligne.position}>
                <span className="echelon-rang">{ligne.rang}</span>
                <span className="echelon-corps">
                  <span className="echelon-titre">{ligne.titre}</span>
                  <span className="echelon-condition">{ligne.condition}</span>
                </span>
                <span className="echelon-seuil" data-tenu={ligne.xpTenus ? '1' : '0'}>
                  {ligne.seuil}
                </span>
                <span className="echelon-marque">{ligne.marque}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Ecran>
  )
}
