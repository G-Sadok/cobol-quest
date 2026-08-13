// Coque provisoire : le gabarit conforme au design est posé plus tard (T08).
// Elle sert ici de témoin que le corpus est bien embarqué à la compilation et
// que la progression fait l'aller-retour avec le fichier de l'utilisateur.
import { cheminsSujets } from './data/corpus.js'
import { epreuvesPiscine, xpMaximum } from './data/programme.js'
import { useProgression } from './store/useProgression.js'
import {
  basculerExercice,
  echelonCourant,
  epreuveCourante,
  etatEpreuve,
  xpTotal
} from './store/progression.js'

export default function App() {
  const { etat, charge, alerte, appliquer, persistance } = useProgression()
  const xpPiscine = epreuvesPiscine.reduce((cumul, e) => cumul + xpMaximum(e), 0)
  const echelon = echelonCourant(etat)
  const courante = epreuveCourante(etat)

  return (
    <main className="amorce">
      <h1>COBOL QUEST</h1>
      <p>Operation Marcel - CGBA</p>
      <p>{cheminsSujets.length} sujets embarqués</p>
      <p>
        Progression : {persistance.presente() ? 'fichier utilisateur' : 'mémoire (dev navigateur)'}
        {charge ? ', chargée' : ', en cours de lecture'}
      </p>
      {alerte ? <p className="amorce-alerte">{alerte}</p> : null}
      <p>
        Piscine : {epreuvesPiscine.length} épreuves, {xpPiscine} XP possibles
      </p>
      <p>
        Échelon {echelon.niveau} : {echelon.titre} - {xpTotal(etat)} XP
      </p>
      <p>
        Épreuve du moment : {courante.id} {courante.titre} ({etatEpreuve(etat, courante.id)})
      </p>
      <button
        type="button"
        className="amorce-bascule"
        onClick={() => appliquer(basculerExercice, 'J00', 'ex00')}
      >
        Basculer J00 / ex00
      </button>
    </main>
  )
}
