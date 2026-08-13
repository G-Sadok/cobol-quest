// LE TERMINAL, tableau de bord de l'apprenti. Contenu pose en T09.

import Ecran, { EnteteEcran } from '../ui/Ecran.jsx'
import { ecranParId } from '../ui/ecrans.js'
import Chantier from './Chantier.jsx'

export default function Terminal() {
  return (
    <Ecran largeur={ecranParId('terminal').largeur}>
      <EnteteEcran
        label="POSTE 07 · NANTERRE · 2e SOUS-SOL"
        titre="Bonjour. BERTHA vous attend."
        chapo="Le tableau de bord de votre carrière à la CGBA."
      />
      <Chantier
        tache="T09"
        texte="Échelon, barre d'XP, épreuve en cours, dernières décorations, citation de Marcel et commande BERTHA du moment prennent place ici."
      />
    </Ecran>
  )
}
