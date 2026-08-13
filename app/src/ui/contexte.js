// Le contexte de l'application : ce que la racine met a disposition des 6
// ecrans. La progression n'est chargee qu'une fois (useProgression est appele
// dans App.jsx et nulle part ailleurs) ; les ecrans la lisent d'ici.
//
// Contenu :
//   etat        l'etat de progression (module pur store/progression.js)
//   charge      false tant que le fichier de l'utilisateur n'est pas relu
//   alerte      le message d'une lecture qui s'est mal passee, ou null
//   appliquer   appliquer(action, ...arguments) : joue une action du store
//   remplacer   remplace l'etat entier (import, remise a zero)
//   persistance le pont vers le fichier reel (export/import en T17)
//   ecran       l'identifiant de l'ecran ouvert
//   aller       aller(idEcran) : change d'ecran
//   ouvrirSujet ouvrirSujet(idEpreuve) : retient l'epreuve et ouvre le lecteur

import { createContext, useContext } from 'react'

export const ContexteApp = createContext(null)

/** L'acces des ecrans au contexte. Hurle si on l'appelle hors de la coque. */
export function useApp() {
  const contexte = useContext(ContexteApp)
  if (!contexte) throw new Error("useApp() s'appelle a l'interieur de ContexteApp.Provider")
  return contexte
}
