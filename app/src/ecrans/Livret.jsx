// LE LIVRET : les decorations et les 9 echelons. Contenu pose en T13.

import Ecran, { EnteteEcran } from '../ui/Ecran.jsx'
import { ecranParId } from '../ui/ecrans.js'
import Chantier from './Chantier.jsx'

export default function Livret() {
  return (
    <Ecran largeur={ecranParId('livret').largeur}>
      <EnteteEcran
        label="DOSSIER DU PERSONNEL"
        titre="Le livret"
        chapo="Les décorations obtenues et le tableau des neuf échelons de la CGBA."
      />
      <Chantier
        tache="T13"
        texte="La grille des badges (obtenus, grisés, sur l'honneur) et le tableau des échelons avec l'état courant prennent place ici."
      />
    </Ecran>
  )
}
