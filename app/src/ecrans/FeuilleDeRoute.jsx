// La feuille de route (cahier des charges, §5.3) : le volet de droite du
// lecteur. Cases des exercices et des bonus, XP credites ou retires, jauge du
// seuil du jour, tampon VALIDE et encart de la commande BERTHA.
//
// Tout ce qui est affiche vient du module pur ui/feuilleDeRoute.js ; ce
// fichier ne fait que poser les lignes et transmettre les clics au store.
// Chaque bascule leve un toast (design 6.2) : c'est la seule facon de voir
// passer les XP, la jauge etant trop lente pour un exercice a 10 XP.

import { basculerExercice } from '../store/progression.js'
import { useApp } from '../ui/contexte.js'
import { feuilleDeRoute, verdictBascule } from '../ui/feuilleDeRoute.js'

function Ligne({ ligne, basculer }) {
  return (
    <label className="feuille-ligne" data-coche={ligne.coche ? '1' : '0'}>
      <input
        type="checkbox"
        className="feuille-case-native"
        checked={ligne.coche}
        title={ligne.commande ?? undefined}
        onChange={() => basculer(ligne)}
      />
      <span className="feuille-case" aria-hidden="true">
        ✓
      </span>
      <span className="feuille-ligne-titre">{ligne.titre}</span>
      <span className="feuille-ligne-xp">{ligne.xpLibelle}</span>
    </label>
  )
}

// L'identifiant vient du lecteur, jamais de l'etat : les deux volets doivent
// parler de la MEME epreuve, or l'epreuve du moment change des qu'elle est
// validee alors que le sujet reste sous les yeux.
export default function FeuilleDeRoute({ idEpreuve }) {
  const { etat, appliquer, annoncer } = useApp()
  const feuille = feuilleDeRoute(etat, idEpreuve)

  // Garde-fou pour une progression importee qui aurait vieilli.
  if (!feuille) return null

  const { epreuve, jauge, bertha } = feuille

  function basculer(ligne) {
    appliquer(basculerExercice, epreuve.id, ligne.id)
    const verdict = verdictBascule(ligne, !ligne.coche)
    annoncer(verdict.texte, verdict.ton)
  }

  return (
    <>
      <div className="feuille-registre">
        {feuille.obligatoires.map((ligne) => (
          <Ligne key={ligne.id} ligne={ligne} basculer={basculer} />
        ))}
      </div>

      {feuille.bonus.length > 0 ? (
        <>
          <div className="etiquette-mono feuille-titre-bloc">BONUS · POUR LES ZELES</div>
          <div className="feuille-registre" data-bonus="1">
            {feuille.bonus.map((ligne) => (
              <Ligne key={ligne.id} ligne={ligne} basculer={basculer} />
            ))}
          </div>
        </>
      ) : null}

      <section className="feuille-seuil" aria-label="Seuil de validation">
        <div className="feuille-seuil-tete">
          <span>Seuil de validation</span>
          <span className="feuille-seuil-compteur">{jauge.compteur}</span>
        </div>
        <div
          className="feuille-jauge"
          data-validee={jauge.validee ? '1' : '0'}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={jauge.surLHonneur ? jauge.total : epreuve.xpBase}
          aria-valuenow={jauge.acquis}
          aria-valuetext={
            jauge.surLHonneur
              ? `${jauge.acquis} jalons sur ${jauge.total}`
              : `${jauge.acquis} XP, seuil à ${jauge.seuil} XP`
          }
        >
          <div className="feuille-jauge-remplissage" style={{ width: `${jauge.remplissage}%` }} />
          <div className="feuille-jauge-repere" style={{ left: `${jauge.repere}%` }} />
        </div>
        <p className="feuille-seuil-legende">{jauge.legende}</p>

        <div className="feuille-total">
          <span>Total du jour</span>
          <span className="feuille-total-valeur">{feuille.xpTotal} XP</span>
        </div>
        {feuille.xpQuiz > 0 ? (
          <p className="feuille-total-quiz">dont {feuille.xpQuiz} XP du quiz du soir</p>
        ) : null}

        {feuille.tampon ? <span className="feuille-tampon">{feuille.tampon}</span> : null}
      </section>

      <div className="feuille-bertha">
        <div className="feuille-bertha-label">BERTHA</div>
        {bertha.texte}
        {bertha.commande ? (
          <code className="feuille-bertha-commande">{bertha.commande}</code>
        ) : null}
      </div>
    </>
  )
}
