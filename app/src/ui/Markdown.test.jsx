// Le rendu markdown se teste au rendu statique : pas de DOM, pas de navigateur,
// juste le HTML produit par react-markdown et les classes que le lecteur pose.

import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { lireSujet } from '../data/corpus.js'
import { epreuves } from '../data/programme.js'
import Markdown from './Markdown.jsx'
import { decouperSujet } from './lecteur.js'

function rendre(texte) {
  return renderToStaticMarkup(<Markdown texte={texte} />)
}

describe('le rendu markdown d’un sujet', () => {
  it('pose le sombre sur les blocs de code, la puce sur le code en ligne', () => {
    const html = rendre('Un `MOVE` en ligne.\n\n```cobol\nDISPLAY "OK".\n```\n')
    expect(html).toContain('class="md-code"')
    expect(html).toContain('class="md-puce-code"')
    expect(html).toContain('DISPLAY &quot;OK&quot;.')
  })

  it('encadre les tableaux GFM et les zebre par le CSS', () => {
    const html = rendre('| A | B |\n| --- | --- |\n| 1 | 2 |\n')
    expect(html).toContain('class="md-cadre-tableau"')
    expect(html).toContain('class="md-tableau"')
    expect(html).toContain('class="md-th"')
    expect(html).toContain('class="md-td"')
  })

  it('traite le memo de Marcel en citation et redescend les titres', () => {
    const html = rendre('> *Memo de Marcel*\n\n# Reste de titre\n\n## Le memo\n')
    expect(html).toContain('class="md-citation"')
    // Le titre de la page est celui de l'ecran : un niveau 1 redescend en h2.
    expect(html).not.toContain('<h1')
    expect((html.match(/<h2 class="md-h2"/g) ?? []).length).toBe(2)
  })

  it('ouvre les liens hors de la fenetre de l’application', () => {
    const html = rendre('Voir <https://www.ibm.com/z>.')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
  })

  describe('sur le corpus entier', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('rend les vingt sujets sans se plaindre', () => {
      for (const epreuve of epreuves) {
        const html = rendre(decouperSujet(lireSujet(epreuve.chemin)).corps)
        expect(html.length, epreuve.id).toBeGreaterThan(0)
        expect(html, epreuve.id).toContain('class="md-p"')
      }
      // React ecrit ses avertissements de rendu sur console.error : aucun ici.
      expect(console.error).not.toHaveBeenCalled()
    })
  })
})
