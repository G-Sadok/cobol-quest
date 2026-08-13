// Le raccord entre le store pur et React.
//
// Un seul appel a ce crochet dans toute l'application (la racine) : c'est lui
// qui charge la progression au demarrage, qui la garde en etat React et qui la
// renvoie a la persistance des qu'elle bouge. Les ecrans reçoivent ensuite
// l'etat et les actions par le contexte pose en T08.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { creerPersistance } from './persistance.js'
import { etatInitial } from './progression.js'

// `options` sert aux essais (pont simule) : passer un objet stable, sinon la
// persistance se recree a chaque rendu.
export function useProgression(options) {
  const persistance = useMemo(() => creerPersistance(options), [options])
  const [etat, setEtat] = useState(etatInitial)
  const [charge, setCharge] = useState(false)
  const [alerte, setAlerte] = useState(null)

  // Premiere lecture du fichier reel. Le demontage vide le tampon : on ne
  // debranche pas la fermeture, ce crochet vit aussi longtemps que l'app.
  useEffect(() => {
    let vivant = true
    persistance.charger().then((rapport) => {
      if (!vivant) return
      setEtat(rapport.etat)
      setAlerte(rapport.ok ? null : rapport.erreur)
      setCharge(true)
    })
    return () => {
      vivant = false
      persistance.vider()
    }
  }, [persistance])

  // Toute evolution repart vers le disque, amortie a 500 ms. Rien n'est ecrit
  // avant la fin du chargement : on n'ecrase pas le fichier par un etat vierge.
  useEffect(() => {
    if (!charge) return
    persistance.planifier(etat)
  }, [charge, etat, persistance])

  /** Applique une action du store : appliquer(cocherExercice, 'J01', 'ex00'). */
  const appliquer = useCallback((action, ...arguments_) => {
    setEtat((precedent) => action(precedent, ...arguments_))
  }, [])

  /** Remplace l'etat de fond en comble (import, remise a zero). */
  const remplacer = useCallback((suivant) => setEtat(suivant), [])

  return { etat, charge, alerte, appliquer, remplacer, persistance }
}
