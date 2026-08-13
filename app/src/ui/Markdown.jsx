// Le rendu markdown des sujets (cahier des charges, §5.3).
//
// react-markdown + remark-gfm (tableaux, listes de taches, barre) : les deux
// sont prevus au §2 du cahier des charges. Aucun HTML brut n'est interprete,
// c'est le defaut de react-markdown et le corpus n'en contient pas.
//
// Chaque element recoit une classe et rien d'autre : toute la mise en forme est
// dans styles/lecteur.css, ou les couleurs viennent des tokens.

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Un element du markdown, habille d'une classe. `node` est l'arbre que
 * react-markdown passe a chaque composant : il ne doit pas descendre dans le
 * DOM, sans quoi React se plaint d'un attribut inconnu.
 */
function habiller(Balise, classe) {
  return function Element({ node, ...reste }) {
    return <Balise className={classe} {...reste} />
  }
}

// Un tableau large defile dans son propre cadre plutot que d'elargir la
// colonne de lecture (design, section 6.12).
function Tableau({ node, children, ...reste }) {
  return (
    <div className="md-cadre-tableau">
      <table className="md-tableau" {...reste}>
        {children}
      </table>
    </div>
  )
}

// Hors-ligne oblige : un lien s'ouvre dans le navigateur du systeme, jamais
// dans la fenetre de l'app (electron/main.cjs tient la porte).
function Lien({ node, ...reste }) {
  return <a target="_blank" rel="noreferrer" {...reste} />
}

const ELEMENTS = {
  // Le titre du sujet est pose par l'ecran : un niveau 1 restant dans le corps
  // redescend d'un cran plutot que de concurrencer le titre de la page.
  h1: habiller('h2', 'md-h2'),
  h2: habiller('h2', 'md-h2'),
  h3: habiller('h3', 'md-h3'),
  h4: habiller('h4', 'md-h4'),
  h5: habiller('h4', 'md-h4'),
  h6: habiller('h4', 'md-h4'),
  p: habiller('p', 'md-p'),
  ul: habiller('ul', 'md-liste'),
  ol: habiller('ol', 'md-liste'),
  li: habiller('li', 'md-item'),
  blockquote: habiller('blockquote', 'md-citation'),
  hr: habiller('hr', 'md-filet'),
  // Le <code> d'un bloc garde sa classe de puce, que le CSS neutralise a
  // l'interieur du sombre : react-markdown ne dit pas si un code est en ligne.
  code: habiller('code', 'md-puce-code'),
  // Le seul objet sombre du sujet (note d'integration 3).
  pre: habiller('pre', 'md-code'),
  table: Tableau,
  th: habiller('th', 'md-th'),
  td: habiller('td', 'md-td'),
  a: Lien
}

export default function Markdown({ texte }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={ELEMENTS}>
        {texte}
      </ReactMarkdown>
    </div>
  )
}
