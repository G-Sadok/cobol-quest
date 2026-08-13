// Le corpus embarque a la compilation.
//
// import.meta.glob avec eager: true inline le texte de chaque .md dans le
// bundle : aucune lecture disque a l'execution, donc un comportement identique
// en dev (vite) et dans le .app empaquete (file://).
//
// Les cles sont des chemins relatifs a src/corpus/, tels que les designera
// programme.js : « piscine/J01_les_quatre_divisions.md », « 01_NORME_CGBA.md ».

const modules = import.meta.glob('../corpus/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

function normaliser(cle) {
  return cle.replace(/^\.\.\/corpus\//, '')
}

export const sujets = Object.freeze(
  Object.fromEntries(Object.entries(modules).map(([cle, texte]) => [normaliser(cle), texte]))
)

/** Tous les chemins disponibles, tries. */
export const cheminsSujets = Object.freeze(Object.keys(sujets).sort())

/** Le markdown brut d'un sujet, ou null si le chemin est inconnu. */
export function lireSujet(chemin) {
  if (!chemin) return null
  const propre = chemin.replace(/^\.?\//, '')
  return Object.prototype.hasOwnProperty.call(sujets, propre) ? sujets[propre] : null
}

/** Vrai si le corpus a bien ete synchronise avant la compilation. */
export function corpusPresent() {
  return cheminsSujets.length > 0
}
