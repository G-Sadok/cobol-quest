// L'enveloppe commune des ecrans : la colonne centree et ses marges
// (40px en haut, 28px sur les cotes, 72px en bas), a la largeur que le
// registre fixe pour cet ecran. Un ecran qui gere sa propre mise en page
// (le lecteur et ses deux volets) passe `largeur` a null.

export default function Ecran({ largeur, children }) {
  return (
    <div className="ecran" style={largeur ? { maxWidth: largeur } : undefined}>
      {children}
    </div>
  )
}

/** Le bandeau de tete d'un ecran : label mono, titre en casse de phrase, chapo. */
export function EnteteEcran({ label, titre, chapo }) {
  return (
    <div className="ecran-entete">
      {label ? <div className="etiquette-mono">{label}</div> : null}
      <h1 className="ecran-titre">{titre}</h1>
      {chapo ? <p className="ecran-chapo">{chapo}</p> : null}
    </div>
  )
}
