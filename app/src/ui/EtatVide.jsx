// L'etat vide commun : une phrase sur un cadre en pointilles, jamais un carre
// gris ni un ecran blanc. Le design ne prevoit pas d'illustration : le
// pointille dit « rien ici pour l'instant », la phrase dit ce qui remplira la
// place, et le bouton optionnel donne le geste qui y mene.

export default function EtatVide({ label, texte, action }) {
  return (
    <div className="etat-vide">
      {label ? <div className="etiquette-mono">{label}</div> : null}
      <p className="etat-vide-texte">{texte}</p>
      {action ? <div className="etat-vide-action">{action}</div> : null}
    </div>
  )
}
