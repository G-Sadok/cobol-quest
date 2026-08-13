// La barre d'outils unifiee : 52px translucides en haut du contenu.
// A gauche le titre de l'ecran et sa precision, a droite la bascule de theme
// et la pastille « BERTHA EN LIGNE ».

import { definirReglage } from '../store/progression.js'
import { useApp } from './contexte.js'
import { ecranParId } from './ecrans.js'

export default function BarreOutils() {
  const { etat, ecran, appliquer } = useApp()
  const courant = ecranParId(ecran)
  const sombre = etat.reglages.sombre

  return (
    <header className="toolbar">
      <span className="toolbar-titre">{courant.titre}</span>
      <span className="toolbar-precision">{courant.precision}</span>
      <span className="toolbar-vide" />
      <button
        type="button"
        className="bouton-theme"
        title={sombre ? 'Passer en thème clair' : 'Passer en thème sombre'}
        aria-label={sombre ? 'Passer en thème clair' : 'Passer en thème sombre'}
        onClick={() => appliquer(definirReglage, 'sombre', !sombre)}
      >
        {sombre ? '☀' : '☾'}
      </button>
      <div className="pastille-bertha">
        <span className="pastille-point" aria-hidden="true" />
        BERTHA EN LIGNE
      </div>
    </header>
  )
}
