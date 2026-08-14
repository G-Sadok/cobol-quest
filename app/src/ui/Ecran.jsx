// L'enveloppe commune des ecrans : la colonne centree et ses marges
// (40px en haut, 28px sur les cotes, 72px en bas), a la largeur que le
// registre fixe pour cet ecran. Un ecran qui gere sa propre mise en page ne
// passe pas par ici : le lecteur et ses deux volets posent leur propre grille.

export default function Ecran({ largeur, children }) {
  // La largeur du registre est celle du CONTENU : la boite ajoute ses deux
  // marges par-dessus, sinon l'ecran se lit 56px trop etroit (design 3).
  const style = largeur
    ? { maxWidth: `calc(${largeur} + 2 * var(--marge-ecran))` }
    : undefined

  return (
    <div className="ecran" style={style}>
      {children}
    </div>
  )
}

/**
 * Le bandeau de tete d'un ecran : label mono, titre en casse de phrase, chapo.
 * `aside` pose un complement a droite, aligne sur le bas du titre : c'est la
 * legende de La Carte dans le design, et rien d'autre pour l'instant.
 */
export function EnteteEcran({ label, titre, chapo, aside }) {
  return (
    <div className="ecran-entete">
      <div className="ecran-entete-texte">
        {label ? <div className="etiquette-mono">{label}</div> : null}
        <h1 className="ecran-titre">{titre}</h1>
        {chapo ? <p className="ecran-chapo">{chapo}</p> : null}
      </div>
      {aside ?? null}
    </div>
  )
}
