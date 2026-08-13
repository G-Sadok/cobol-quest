// LA CARTE, le sous-sol de la CGBA (cahier des charges, §5.2).
//
// Un seul plan, lu de haut en bas comme un document interne : le couloir de la
// piscine et ses deux salles de rush en retrait, l'escalier de service, les
// bureaux des missions, puis la salle machine au fond. Tout ce qui est affiche
// sort du module pur ui/carte.js ; cet ecran ne fait que poser les tuiles.

import Ecran, { EnteteEcran } from '../ui/Ecran.jsx'
import {
  LEGENDE,
  LIBELLES_ETAT_MAJUSCULE,
  bureauxMissions,
  comptePhase,
  couloirPiscine,
  salleMachine,
  sallesRush
} from '../ui/carte.js'
import { useApp } from '../ui/contexte.js'
import { ecranParId } from '../ui/ecrans.js'

function Salle({ salle, ouvrir }) {
  return (
    <button
      type="button"
      className="salle"
      data-etat={salle.etat}
      disabled={!salle.ouvrable}
      title={salle.annonce}
      aria-label={salle.annonce}
      onClick={() => ouvrir(salle.id)}
    >
      {salle.tampon ? (
        <span className="salle-tampon">{salle.tampon}</span>
      ) : (
        <span className="salle-etiquette">{salle.libelle}</span>
      )}
      <span className="salle-code">{salle.id}</span>
      <span className="salle-titre">{salle.titre}</span>
    </button>
  )
}

function Niveau({ nom, precision, compte, bas, children }) {
  return (
    <section className={bas ? 'plan-niveau plan-niveau-bas' : 'plan-niveau'}>
      <div className="niveau-tete">
        <span className="niveau-nom">{nom}</span>
        <span className="etiquette-mono">{precision}</span>
        <span className="niveau-filet" />
        {compte.validees > 0 ? (
          <span className="niveau-compte">
            {compte.validees} validée{compte.validees > 1 ? 's' : ''}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export default function Carte() {
  const { etat, ouvrirSujet } = useApp()

  const couloir = couloirPiscine(etat)
  const rushs = sallesRush(etat)
  const bureaux = bureauxMissions(etat)
  const machine = salleMachine(etat)

  return (
    <Ecran largeur={ecranParId('carte').largeur}>
      <EnteteEcran
        label="PLAN DES SOUS-SOLS · DOCUMENT INTERNE"
        titre="La carte"
        aside={
          <div className="carte-legende">
            {LEGENDE.map((entree) => (
              <span key={entree.etat}>
                <span className="puce-etat" data-etat={entree.etat} aria-hidden="true" />
                {entree.libelle}
              </span>
            ))}
          </div>
        }
      />

      <div className="plan">
        <Niveau
          nom="La Piscine"
          precision={`NIVEAU -1 · FONDAMENTAUX · ${couloir.length} SALLES`}
          compte={comptePhase(etat, 'piscine')}
        >
          <div className="niveau-corps">
            <div className="salles">
              {couloir.map((salle) => (
                <Salle key={salle.id} salle={salle} ouvrir={ouvrirSujet} />
              ))}
            </div>
            <div className="salles-rush">
              <div className="etiquette-mono">SALLES RUSH</div>
              {rushs.map((salle) => (
                <Salle key={salle.id} salle={salle} ouvrir={ouvrirSujet} />
              ))}
            </div>
          </div>
        </Niveau>

        <div className="plan-escalier">
          <span className="niveau-filet" />
          <span className="etiquette-mono">ESCALIER DE SERVICE</span>
          <span className="niveau-filet" />
        </div>

        <Niveau
          nom="Les Missions"
          precision={`NIVEAU -2 · PROJETS · ${bureaux.length} BUREAUX`}
          compte={comptePhase(etat, 'missions')}
          bas
        >
          <div className="salles">
            {bureaux.map((salle) => (
              <Salle key={salle.id} salle={salle} ouvrir={ouvrirSujet} />
            ))}
          </div>
        </Niveau>

        <button
          type="button"
          className="salle-machine"
          data-etat={machine.etat}
          disabled={!machine.ouvrable}
          title={machine.annonce}
          aria-label={machine.annonce}
          onClick={() => ouvrirSujet(machine.id)}
        >
          <span className="salle-machine-glyphe" aria-hidden="true">
            ⌧
          </span>
          <span className="salle-machine-corps">
            <span className="salle-machine-titre">La salle machine</span>
            <span className="salle-machine-detail">
              {machine.ouvrable
                ? 'Le vrai mainframe chez IBM : ni XP ni moulinette, tout se valide sur l’honneur.'
                : 'BERTHA en production. S’ouvre après les six missions.'}
            </span>
          </span>
          <span className="salle-machine-etat">
            PHASE 3 · {LIBELLES_ETAT_MAJUSCULE[machine.etat]}
          </span>
        </button>
      </div>
    </Ecran>
  )
}
