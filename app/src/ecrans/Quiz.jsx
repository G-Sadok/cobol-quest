// LE QUIZ DU SOIR (cahier des charges, §5.4) : les 8 QCM d'une epreuve, la
// correction commentee apres chaque reponse, et les +10 XP au seuil de 6/8,
// credites une seule fois par epreuve.
//
// Tout ce qui est affiche sort du module pur ui/quiz.js ; cet ecran tient la
// copie en cours (un etat local : une copie abandonnee ne se sauvegarde pas) et
// rend la note au store une fois la derniere case remplie.
//
// La note part au dossier des que la huitieme reponse est posee, pas au clic
// sur « Voir le resultat » : une seance menee au bout compte, meme si on ferme
// l'ecran avant de lire son releve.

import { useEffect, useState } from 'react'
import { enregistrerQuiz, quizReussi } from '../store/progression.js'
import Ecran from '../ui/Ecran.jsx'
import EtatVide from '../ui/EtatVide.jsx'
import { useApp } from '../ui/contexte.js'
import { ecranParId } from '../ui/ecrans.js'
import {
  copieVierge,
  enteteSeance,
  epreuveDeLaSeance,
  ficheQuestion,
  repondre,
  repondues,
  resultatSeance,
  sommaireDesSeances,
  verdictReponse,
  verdictSeance
} from '../ui/quiz.js'
import { noterCopie } from '../data/quiz.js'

// Une seance neuve : la copie vierge, la premiere question, et l'etat du
// dossier AVANT la copie (c'est lui qui dira si les 10 XP tombent ce soir).
function nouvelleSeance(etat, idEpreuve) {
  return {
    pour: idEpreuve,
    copie: copieVierge(idEpreuve),
    rang: 0,
    fini: false,
    dejaCredite: quizReussi(etat, idEpreuve)
  }
}

function Sommaire({ seances, courante, choisir }) {
  return (
    <nav className="quiz-sommaire" aria-label="Séances du soir">
      {seances.map((s) => (
        <button
          key={s.id}
          type="button"
          className="quiz-puce"
          data-position={s.position}
          data-courante={s.id === courante ? '1' : '0'}
          disabled={!s.ouverte}
          title={s.annonce}
          aria-label={s.annonce}
          aria-current={s.id === courante ? 'true' : undefined}
          onClick={() => choisir(s.id)}
        >
          {s.id}
        </button>
      ))}
    </nav>
  )
}

function Question({ fiche, choisir, suivante }) {
  if (!fiche) return null

  return (
    <section className="quiz-carte" aria-label={fiche.compteur}>
      <header className="quiz-carte-tete">
        <span className="etiquette-mono quiz-compteur">{fiche.compteur}</span>
        <div
          className="jauge quiz-jauge"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={fiche.total}
          aria-valuenow={fiche.numero - (fiche.repondu ? 0 : 1)}
        >
          <div className="jauge-remplissage" style={{ width: `${fiche.progres}%` }} />
        </div>
        <span className="quiz-score">Score {fiche.note}</span>
      </header>

      <div className="quiz-corps">
        <h2 className="quiz-enonce">{fiche.enonce}</h2>

        <div className="quiz-choix">
          {fiche.choix.map((choix) => (
            <button
              key={choix.rang}
              type="button"
              className="quiz-reponse"
              data-etat={choix.etat}
              disabled={fiche.repondu}
              aria-label={choix.annonce}
              onClick={() => choisir(choix.rang)}
            >
              <span className="quiz-lettre" aria-hidden="true">
                {choix.lettre}
              </span>
              <span className="quiz-reponse-texte">{choix.texte}</span>
              <span className="quiz-marque" aria-hidden="true">
                {choix.marque}
              </span>
            </button>
          ))}
        </div>

        {fiche.correction ? (
          <>
            <div className="quiz-correction" data-ton={fiche.correction.ton} role="status">
              <div className="etiquette-mono quiz-correction-titre">{fiche.correction.titre}</div>
              <p className="quiz-correction-texte">{fiche.correction.texte}</p>
            </div>
            <div className="quiz-suite">
              <button type="button" className="bouton-primaire" onClick={suivante}>
                {fiche.suite}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}

function Resultat({ releve, entete, retenter, allerTerminal }) {
  return (
    <section className="quiz-carte quiz-resultat" aria-label="Résultat du soir">
      <div className="etiquette-mono">RESULTAT DU SOIR</div>
      <div className="quiz-note" data-reussi={releve.reussi ? '1' : '0'}>
        {releve.score}
      </div>
      <p className="quiz-phrase">{releve.phrase}</p>
      {releve.tampon ? <div className="quiz-tampon">{releve.tampon}</div> : null}
      <p className="quiz-releve">{entete.releve}</p>
      <div className="quiz-actions">
        <button type="button" className="bouton-secondaire" onClick={retenter}>
          Retenter
        </button>
        <button type="button" className="bouton-primaire" onClick={allerTerminal}>
          Retour au terminal
        </button>
      </div>
    </section>
  )
}

export default function Quiz() {
  const { etat, charge, appliquer, annoncer, aller } = useApp()
  const [choisie, setChoisie] = useState(null)

  const idEpreuve = choisie ?? epreuveDeLaSeance(etat)
  const [seance, setSeance] = useState(() => nouvelleSeance(etat, idEpreuve))

  // Changer de seance, c'est reprendre une copie neuve (React autorise cet
  // ajustement d'etat en cours de rendu, il n'y a pas d'effet a attendre).
  if (seance.pour !== idEpreuve) setSeance(nouvelleSeance(etat, idEpreuve))

  // La progression arrive du fichier apres le premier rendu : on fige la
  // seance proposee des qu'elle est lue, pour qu'une reussite en cours de
  // route ne change pas le quiz sous les doigts de l'apprenti.
  useEffect(() => {
    if (charge) setChoisie((deja) => deja ?? epreuveDeLaSeance(etat))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge])

  const entete = enteteSeance(etat, idEpreuve)
  const seances = sommaireDesSeances(etat)

  // Garde-fou pour une progression importee qui aurait vieilli : la seance
  // demandee ne figure plus au programme. On le dit et on rend le geste qui
  // ramene a la seance du moment, plutot que de laisser un ecran blanc.
  if (!entete) {
    return (
      <Ecran largeur={ecranParId('quiz').largeur}>
        <div className="quiz-entete">
          <div className="etiquette-mono">18 H 45 · AVANT DE RENDRE LE PUPITRE</div>
          <h1 className="ecran-titre">Le quiz du soir</h1>
        </div>
        <EtatVide
          label="SEANCE INTROUVABLE"
          texte="Cette séance ne figure plus au programme : elle vient sans doute d’une progression importée d’une version précédente."
          action={
            <button type="button" className="bouton-primaire" onClick={() => setChoisie(null)}>
              Revenir à la séance du soir
            </button>
          }
        />
      </Ecran>
    )
  }

  const releve = resultatSeance(idEpreuve, seance.copie, seance.dejaCredite)
  const fiche = seance.fini ? null : ficheQuestion(idEpreuve, seance.rang, seance.copie)

  function choisir(rangChoix) {
    if (!fiche || fiche.repondu) return

    const copie = repondre(seance.copie, seance.rang, rangChoix)
    setSeance({ ...seance, copie })

    const verdict = verdictReponse(ficheQuestion(idEpreuve, seance.rang, copie).juste)
    annoncer(verdict.texte, verdict.ton)

    // La derniere case remplie ferme la copie : la note part au dossier.
    if (repondues(copie) === copie.length) {
      appliquer(enregistrerQuiz, idEpreuve, noterCopie(idEpreuve, copie))
    }
  }

  function suivante() {
    if (!fiche) return
    if (!fiche.derniere) {
      setSeance({ ...seance, rang: seance.rang + 1 })
      return
    }
    setSeance({ ...seance, fini: true })
    const verdict = verdictSeance(releve)
    annoncer(verdict.texte, verdict.ton)
  }

  function retenter() {
    setSeance(nouvelleSeance(etat, idEpreuve))
  }

  return (
    <Ecran largeur={ecranParId('quiz').largeur}>
      <div className="quiz-entete">
        <div className="etiquette-mono">18 H 45 · AVANT DE RENDRE LE PUPITRE</div>
        <h1 className="ecran-titre">Le quiz du soir</h1>
        <p className="quiz-chapo">
          {entete.id} · {entete.titre}. {entete.exigence}.
        </p>
      </div>

      <Sommaire seances={seances} courante={idEpreuve} choisir={setChoisie} />

      {!entete.ouverte ? (
        <section className="quiz-carte quiz-verrou" aria-label="Séance verrouillée">
          <div className="etiquette-mono">SEANCE VERROUILLEE</div>
          <p className="quiz-phrase">{entete.verrou}</p>
        </section>
      ) : seance.fini ? (
        <Resultat
          releve={releve}
          entete={entete}
          retenter={retenter}
          allerTerminal={() => aller('terminal')}
        />
      ) : (
        <Question fiche={fiche} choisir={choisir} suivante={suivante} />
      )}
    </Ecran>
  )
}
