// LA CARTE, le sous-sol de la CGBA. Contenu pose en T10.

import Ecran, { EnteteEcran } from '../ui/Ecran.jsx'
import { ecranParId } from '../ui/ecrans.js'
import Chantier from './Chantier.jsx'

export default function Carte() {
  return (
    <Ecran largeur={ecranParId('carte').largeur}>
      <EnteteEcran
        label="PLAN DES SOUS-SOLS"
        titre="La carte"
        chapo="Le couloir de la piscine, les bureaux des missions et la salle machine."
      />
      <Chantier
        tache="T10"
        texte="Les salles et leurs quatre états (verrouillée, disponible, en cours, validée) s'afficheront ici, chacune ouvrant le lecteur d'un clic."
      />
    </Ecran>
  )
}
