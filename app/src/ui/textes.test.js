// Les regles d'ecriture de l'application, tenues par un test plutot que par la
// vigilance : le tiret cadratin est interdit par le cahier des charges (9 bis),
// et le design (regle 7 du paragraphe 7) reserve les MAJUSCULES aux labels
// mono, aux tampons et aux toasts, qui perdent alors leurs accents.
//
// Le corpus n'est pas concerne : il est en lecture seule et s'affiche tel quel.

import { describe, expect, it } from 'vitest'

const CADRATIN = '—'
const ACCENTS = /[À-ÿŒœŸ]/
const MAJUSCULE_ACCENTUEE = /[ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]/

// Une chaine « en capitales » : au moins quatre signes, au moins une lettre, et
// rien qui distingue son ecriture de sa version en majuscules.
function enCapitales(texte) {
  return texte.length >= 4 && /[A-Za-z]/.test(texte) && texte === texte.toUpperCase()
}

/** Les chaines litterales d'un fichier source, sans les gabarits ni le code. */
function chaines(source) {
  return [...source.matchAll(/'([^'\\\n]*)'|"([^"\\\n]*)"/g)].map((m) => m[1] ?? m[2])
}

/** Le texte ecrit en dur dans une etiquette mono d'un ecran. */
function etiquettesMono(source) {
  return [...source.matchAll(/className="etiquette-mono[^"]*"[^>]*>\s*([^<{][^<]*?)\s*</g)].map(
    (m) => m[1].replace(/\s+/g, ' ')
  )
}

function fichiers(modules) {
  return Object.entries(modules).filter(([chemin]) => !chemin.includes('.test.'))
}

const sources = fichiers(
  import.meta.glob('../{data,ecrans,store,ui}/**/*.{js,jsx}', {
    query: '?raw',
    import: 'default',
    eager: true
  })
)
const ecrans = fichiers(
  import.meta.glob('../{ecrans,ui}/*.jsx', { query: '?raw', import: 'default', eager: true })
)
const quiz = Object.entries(
  import.meta.glob('../data/quiz/*.json', { query: '?raw', import: 'default', eager: true })
)

describe("les regles d'ecriture de l'application", () => {
  it('a bien de quoi controler : les sources sont trouvees', () => {
    expect(sources.length).toBeGreaterThan(20)
    expect(ecrans.length).toBeGreaterThan(5)
    expect(quiz.length).toBe(11)
  })

  it("n'ecrit jamais de tiret cadratin, nulle part", () => {
    const fautifs = [...sources, ...quiz]
      .filter(([, texte]) => texte.includes(CADRATIN))
      .map(([chemin]) => chemin)
    expect(fautifs).toEqual([])
  })

  it('ecrit ses capitales sans accents', () => {
    const fautifs = sources.flatMap(([chemin, texte]) =>
      chaines(texte)
        .filter((chaine) => enCapitales(chaine) && MAJUSCULE_ACCENTUEE.test(chaine))
        .map((chaine) => `${chemin} : ${chaine}`)
    )
    expect(fautifs).toEqual([])
  })

  it('pose des etiquettes mono en MAJUSCULES, sans accents', () => {
    const etiquettes = ecrans.flatMap(([chemin, texte]) =>
      etiquettesMono(texte).map((libelle) => [chemin, libelle])
    )
    expect(etiquettes.length).toBeGreaterThan(5)

    const fautifs = etiquettes
      .filter(([, libelle]) => libelle !== libelle.toUpperCase() || ACCENTS.test(libelle))
      .map(([chemin, libelle]) => `${chemin} : ${libelle}`)
    expect(fautifs).toEqual([])
  })

  it("n'emploie que l'apostrophe typographique dans les quiz, hors code", () => {
    const fautifs = quiz
      .filter(([, texte]) =>
        // Un accent grave ouvre un extrait de code : l'apostrophe y est un
        // delimiteur COBOL, elle reste droite. Ailleurs, elle se courbe.
        texte
          .split('`')
          .filter((_, rang) => rang % 2 === 0)
          .some((morceau) => morceau.includes("'"))
      )
      .map(([chemin]) => chemin)
    expect(fautifs).toEqual([])
  })
})
