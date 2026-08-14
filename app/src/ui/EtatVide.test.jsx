// L'etat vide se teste au rendu statique : ce qui compte est sa forme (le
// cadre en pointilles, l'etiquette mono facultative, la phrase, le geste
// facultatif), pas un navigateur.

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import EtatVide from './EtatVide.jsx'

describe("l'etat vide", () => {
  it('se reduit a une phrase quand on ne lui donne que ca', () => {
    const html = renderToStaticMarkup(<EtatVide texte="Rien pour l’instant." />)
    expect(html).toContain('class="etat-vide"')
    expect(html).toContain('class="etat-vide-texte"')
    expect(html).toContain('Rien pour l’instant.')
    expect(html).not.toContain('etiquette-mono')
    expect(html).not.toContain('etat-vide-action')
  })

  it('porte son etiquette mono et son geste quand on les lui donne', () => {
    const html = renderToStaticMarkup(
      <EtatVide
        label="SEANCE INTROUVABLE"
        texte="Cette séance ne figure plus au programme."
        action={<button type="button">Revenir</button>}
      />
    )
    expect(html).toContain('class="etiquette-mono"')
    expect(html).toContain('SEANCE INTROUVABLE')
    expect(html).toContain('class="etat-vide-action"')
    expect(html).toContain('Revenir')
  })
})
