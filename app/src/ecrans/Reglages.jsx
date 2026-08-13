// REGLAGES. Contenu pose en T17.

import Ecran, { EnteteEcran } from '../ui/Ecran.jsx'
import { ecranParId } from '../ui/ecrans.js'
import Chantier from './Chantier.jsx'

export default function Reglages() {
  return (
    <Ecran largeur={ecranParId('reglages').largeur}>
      <EnteteEcran
        label="POSTE DE TRAVAIL"
        titre="Réglages"
        chapo="Votre progression, votre rythme et l'affichage de l'application."
      />
      <Chantier
        tache="T17"
        texte="Export et import de la progression, remise à zéro à double confirmation, choix du rythme, thème sombre et effets de phosphore arrivent ici."
      />
    </Ecran>
  )
}
