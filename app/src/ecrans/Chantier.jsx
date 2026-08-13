// L'etat d'attente d'un ecran que la feuille de route n'a pas encore construit.
// Provisoire par nature : chaque tache T09 a T17 remplace un de ces blocs par
// le vrai ecran. Il montre malgre tout quelque chose d'utile (l'epreuve du
// moment et sa commande BERTHA) plutot qu'un carre vide.

import { commandeBertha } from '../data/programme.js'
import { epreuveCourante } from '../store/progression.js'
import Console from '../ui/Console.jsx'
import { useApp } from '../ui/contexte.js'

export default function Chantier({ tache, texte }) {
  const { etat } = useApp()
  const courante = epreuveCourante(etat)
  const premier = courante.exercices[0] ?? null

  return (
    <div className="carte chantier">
      <div className="carte-tete">
        <span className="etiquette-mono etiquette-ambre">CHANTIER {tache}</span>
      </div>
      <div className="carte-corps">
        <p className="chantier-texte">{texte}</p>
        <Console>
          {commandeBertha(premier)
            ? `$ ${commandeBertha(premier)}`
            : `$ epreuve du moment : ${courante.id}`}
        </Console>
      </div>
    </div>
  )
}
