// LE QUIZ DU SOIR. Contenu redige en T14 et T15, ecran pose en T16.

import Ecran, { EnteteEcran } from '../ui/Ecran.jsx'
import { ecranParId } from '../ui/ecrans.js'
import Chantier from './Chantier.jsx'

export default function Quiz() {
  return (
    <Ecran largeur={ecranParId('quiz').largeur}>
      <EnteteEcran
        label="SEANCE DU SOIR"
        titre="Le quiz du soir"
        chapo="Huit questions sur le mémo du jour, autant de tentatives que voulu."
      />
      <Chantier
        tache="T16"
        texte="Le déroulé des 8 QCM, la correction commentée et les +10 XP accordés une seule fois par épreuve arrivent ici."
      />
    </Ecran>
  )
}
