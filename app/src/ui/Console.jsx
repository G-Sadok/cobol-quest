// La console BERTHA : le seul objet sombre de l'interface claire, et le point
// fixe de l'identite (il ne change pas entre les deux themes).
// Le curseur clignote quand les effets sont actifs ; c'est de la decoration
// pure, donc masque aux lecteurs d'ecran.

export default function Console({ children, curseur = true, action = null }) {
  return (
    <div className="console">
      <span className="console-texte">{children}</span>
      {curseur ? <span className="console-curseur" aria-hidden="true" /> : null}
      <span className="console-vide" />
      {action}
    </div>
  )
}
