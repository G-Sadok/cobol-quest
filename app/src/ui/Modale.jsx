// La boite de confirmation (design 6.7) : voile flou, boite centree, deux
// boutons a parts egales. Elle ne sert qu'aux gestes qu'on ne peut pas
// reprendre, donc pour l'instant a la seule remise a zero.
//
// Trois regles du design y sont tenues : « Échap » annule, le repli prend le
// focus a l'ouverture, et l'action destructrice n'est jamais le bouton par
// defaut.

import { useEffect, useRef } from 'react'

export default function Modale({ titre, corps, confirmer, annuler, onConfirmer, onAnnuler }) {
  const replier = useRef(null)

  useEffect(() => {
    replier.current?.focus()
  }, [titre])

  useEffect(() => {
    function auClavier(evenement) {
      if (evenement.key !== 'Escape') return
      evenement.preventDefault()
      onAnnuler()
    }
    window.addEventListener('keydown', auClavier)
    return () => window.removeEventListener('keydown', auClavier)
  }, [onAnnuler])

  return (
    <div className="modale-voile">
      <div className="modale" role="alertdialog" aria-modal="true" aria-label={titre}>
        <div className="modale-pastille" aria-hidden="true">
          !
        </div>
        <div className="modale-titre">{titre}</div>
        <p className="modale-corps">{corps}</p>
        <div className="modale-boutons">
          <button type="button" className="bouton-secondaire" ref={replier} onClick={onAnnuler}>
            {annuler}
          </button>
          <button
            type="button"
            className="bouton-danger bouton-danger-plein"
            onClick={onConfirmer}
          >
            {confirmer}
          </button>
        </div>
      </div>
    </div>
  )
}
