// La racine : elle charge la progression une fois pour toutes, tient l'ecran
// ouvert, applique le theme et les effets sur la racine du document, puis
// distribue le tout aux ecrans par le contexte.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Carte from './ecrans/Carte.jsx'
import Guide from './ecrans/Guide.jsx'
import Lecteur from './ecrans/Lecteur.jsx'
import Livret from './ecrans/Livret.jsx'
import Quiz from './ecrans/Quiz.jsx'
import Reglages from './ecrans/Reglages.jsx'
import Terminal from './ecrans/Terminal.jsx'
import { ouvrirEpreuve } from './store/progression.js'
import { useProgression } from './store/useProgression.js'
import Coque from './ui/Coque.jsx'
import { ContexteApp } from './ui/contexte.js'
import { ecranParDefaut, ecranParId, ecranParRaccourci } from './ui/ecrans.js'
import { DUREE_TOAST } from './ui/Toast.jsx'

const RENDU = {
  terminal: Terminal,
  carte: Carte,
  lecteur: Lecteur,
  quiz: Quiz,
  livret: Livret,
  reglages: Reglages,
  guide: Guide
}

export default function App() {
  const { etat, charge, alerte, appliquer, remplacer, persistance } = useProgression()
  const [ecran, setEcran] = useState(ecranParDefaut)
  const [toast, setToast] = useState(null)
  const numeroToast = useRef(0)
  const minuterieToast = useRef(null)

  const aller = useCallback((id) => {
    if (ecranParId(id)) setEcran(id)
  }, [])

  /**
   * Annonce un verdict par un toast (design 6.6). Un seul a la fois : le
   * suivant remplace le precedent et relance le decompte. Le numero force le
   * remontage, pour que l'animation reparte meme sur deux verdicts identiques.
   */
  const annoncer = useCallback((texte, ton = 'oui') => {
    numeroToast.current += 1
    setToast({ texte, ton, numero: numeroToast.current })
    clearTimeout(minuterieToast.current)
    minuterieToast.current = setTimeout(() => setToast(null), DUREE_TOAST)
  }, [])

  useEffect(() => () => clearTimeout(minuterieToast.current), [])

  /** Retient l'epreuve puis ouvre le lecteur : le geste de La Carte (T10). */
  const ouvrirSujet = useCallback(
    (idEpreuve) => {
      appliquer(ouvrirEpreuve, idEpreuve)
      setEcran('lecteur')
    },
    [appliquer]
  )

  // Cmd+1 a Cmd+7, dans l'ordre de la barre laterale (design, section 5).
  useEffect(() => {
    function auClavier(evenement) {
      if (!evenement.metaKey || evenement.ctrlKey || evenement.altKey) return
      const vise = ecranParRaccourci(evenement.key)
      if (!vise) return
      evenement.preventDefault()
      setEcran(vise)
    }
    window.addEventListener('keydown', auClavier)
    return () => window.removeEventListener('keydown', auClavier)
  }, [])

  // Theme et effets : deux attributs sur <html>, tout le reste est du CSS.
  // Regle sacree du design : aucune couleur en dur dans un composant.
  useEffect(() => {
    const racine = document.documentElement
    racine.dataset.sombre = etat.reglages.sombre ? '1' : '0'
    racine.dataset.effets = etat.reglages.scanlines ? '1' : '0'
  }, [etat.reglages.sombre, etat.reglages.scanlines])

  const contexte = useMemo(
    () => ({
      etat,
      charge,
      alerte,
      appliquer,
      remplacer,
      persistance,
      ecran,
      aller,
      ouvrirSujet,
      annoncer,
      toast
    }),
    [
      etat,
      charge,
      alerte,
      appliquer,
      remplacer,
      persistance,
      ecran,
      aller,
      ouvrirSujet,
      annoncer,
      toast
    ]
  )

  const Ecran = RENDU[ecran]

  return (
    <ContexteApp.Provider value={contexte}>
      <Coque>
        <Ecran />
      </Coque>
    </ContexteApp.Provider>
  )
}
