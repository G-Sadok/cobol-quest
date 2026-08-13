// La barre laterale : 248px fixes, la signature « app macOS » du design.
// De haut en bas : la bande des feux systeme, le bloc d'identite CGBA, les 6
// items de navigation, puis la carte de profil ancree en bas.
//
// La bande des feux est vide a dessein : les vrais boutons de fenetre sont
// dessines par macOS (titleBarStyle 'hiddenInset' dans electron/main.cjs), on
// leur reserve simplement la place et on rend la zone deplacable.

import { echelons, echelonSuivant, progressionVersEchelonSuivant } from '../data/echelons.js'
import { badgesObtenus, echelonCourant, epreuveCourante, epreuvesDebloquees, xpTotal } from '../store/progression.js'
import { useApp } from './contexte.js'
import { ecrans } from './ecrans.js'
import { espacerMilliers } from './format.js'

// Le matricule de l'apprenti, repris tel quel de la maquette : la CGBA numerote
// ses pupitreurs, le corpus ne nomme pas celui-ci.
const MATRICULE = '4417'

// Le compteur mono affiche a droite d'un item de nav. Vide quand l'ecran n'a
// rien de chiffrable a annoncer.
function compteur(id, etat) {
  if (id === 'carte') return String(epreuvesDebloquees(etat).length)
  if (id === 'lecteur') return epreuveCourante(etat).id
  if (id === 'livret') return String(badgesObtenus(etat).length)
  return ''
}

export default function BarreLaterale() {
  const { etat, ecran, aller } = useApp()
  const echelon = echelonCourant(etat)
  const total = xpTotal(etat)
  const avancement = progressionVersEchelonSuivant(echelon, total)
  const dernier = echelons[echelons.length - 1]

  return (
    <nav className="barre" aria-label="Navigation principale">
      <div className="barre-feux" />

      <div className="barre-identite">
        <div className="etiquette-mono">CGBA · 1962</div>
        <div className="barre-nom">Cobol Quest</div>
        <div className="barre-sous-nom">Opération Marcel</div>
      </div>

      <div className="barre-nav">
        {ecrans.map((e, rang) => {
          const actif = e.id === ecran
          const valeur = compteur(e.id, etat)
          return (
            <button
              key={e.id}
              type="button"
              className={actif ? 'nav-item nav-item-actif' : 'nav-item'}
              aria-current={actif ? 'page' : undefined}
              title={`${e.libelle} (Cmd+${rang + 1})`}
              onClick={() => aller(e.id)}
            >
              <span className="nav-puce">{e.code}</span>
              <span className="nav-libelle">{e.libelle}</span>
              <span className="nav-compteur">{valeur}</span>
            </button>
          )
        })}
      </div>

      <div className="barre-vide" />

      <div className="profil">
        <div className="profil-tete">
          <div className="profil-avatar" aria-hidden="true">
            {echelon.niveau}
          </div>
          <div className="profil-identite">
            <div className="profil-role">{echelon.titre}</div>
            <div className="profil-matricule">MATRICULE {MATRICULE}</div>
          </div>
        </div>
        <div className="jauge jauge-profil">
          <div
            className="jauge-remplissage"
            style={{ width: `${Math.round(avancement * 100)}%` }}
          />
        </div>
        <div className="profil-pied">
          <span>
            Échelon {echelon.niveau} / {dernier.niveau}
          </span>
          <span className="profil-xp">{espacerMilliers(total)} XP</span>
        </div>
        <div className="profil-vise">
          {echelonSuivant(echelon)
            ? `Prochain : ${echelonSuivant(echelon).titre}`
            : 'Sommet de la carrière atteint'}
        </div>
      </div>
    </nav>
  )
}
