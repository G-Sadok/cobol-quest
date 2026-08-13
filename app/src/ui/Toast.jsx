// Le toast « BERTHA DIT OUI / NON » (design 6.6) : le seul element sombre
// flottant de l'interface. Il annonce un verdict et disparait tout seul au
// bout de 2400 ms, sans jamais rien bloquer ni offrir de bouton de fermeture.
//
// Il n'y en a qu'un a la fois : la coque le pose, App.jsx tient son etat.
// `role="status"` suffit a le faire lire par VoiceOver sans voler le focus.

/** Duree d'affichage d'un toast, en millisecondes (design 6.6). */
export const DUREE_TOAST = 2400

export default function Toast({ toast }) {
  if (!toast) return null

  return (
    <div className="toast" data-ton={toast.ton} role="status" key={toast.numero}>
      <span className="toast-point" aria-hidden="true" />
      <span className="toast-texte">{toast.texte}</span>
    </div>
  )
}
