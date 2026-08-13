// LE LECTEUR DE SUJET et sa feuille de route. Contenu pose en T11 et T12.

import Ecran, { EnteteEcran } from '../ui/Ecran.jsx'
import Chantier from './Chantier.jsx'

export default function Lecteur() {
  // Largeur null dans le registre : le lecteur a sa propre mise en page a deux
  // volets (T11). En attendant, il emprunte la colonne de lecture.
  return (
    <Ecran largeur="var(--l-terminal)">
      <EnteteEcran
        label="SUJET DU JOUR"
        titre="Le sujet"
        chapo="Le texte de l'épreuve et la feuille de route qui l'accompagne."
      />
      <Chantier
        tache="T11"
        texte="Le rendu markdown du sujet (code, tableaux, colonne de lecture) arrive en T11, la feuille de route latérale et ses cases à cocher en T12."
      />
    </Ecran>
  )
}
