import { describe, expect, it } from 'vitest'
import { citationDeMarcel, citationParEpreuve, citations, lireCitation } from './citations.js'
import { idsEpreuves } from './programme.js'

describe('lireCitation', () => {
  it('sépare l’attribution de la parole', () => {
    const lue = lireCitation(['# TITRE', '', '> *Mémo de Marcel :*', '> *« Deux lignes', '> qui n’en font qu’une. »*', '', 'Suite.'].join('\n'))
    expect(lue).toEqual({ auteur: 'Mémo de Marcel', texte: 'Deux lignes qui n’en font qu’une.' })
  })

  it('accepte un bloc sans attribution', () => {
    const lue = lireCitation('> *« Sans signature. »*')
    expect(lue).toEqual({ auteur: '', texte: 'Sans signature.' })
  })

  it('ne retient que le PREMIER bloc du fichier', () => {
    const lue = lireCitation(['> *Marcel :*', '> *« Le premier. »*', '', 'Texte.', '', '> *« Le second. »*'].join('\n'))
    expect(lue.texte).toBe('Le premier.')
  })

  it('renvoie null quand le sujet n’ouvre sur rien', () => {
    expect(lireCitation('# TITRE\n\nDu texte, pas de citation.')).toBeNull()
    expect(lireCitation('')).toBeNull()
    expect(lireCitation(null)).toBeNull()
  })
})

describe('citations du corpus', () => {
  it('en trouve une pour chacune des 20 épreuves', () => {
    expect(citations).toHaveLength(idsEpreuves.length)
    expect(citations.map((c) => c.idEpreuve)).toEqual([...idsEpreuves])
  })

  it('donne une parole non vide et une attribution à chaque fois', () => {
    for (const citation of citations) {
      expect(citation.texte.length).toBeGreaterThan(40)
      expect(citation.auteur).not.toBe('')
      expect(citation.texte.startsWith('«')).toBe(false)
      expect(citation.texte.endsWith('»')).toBe(false)
    }
  })

  it('reconnaît les mémos de Marcel et ne confond pas les autres bouches', () => {
    expect(citationParEpreuve('J01').deMarcel).toBe(true)
    expect(citationParEpreuve('J01').auteur).toBe('Mémo de Marcel, café n°1')
    // J10 parle DE Marcel sans être signée DE lui : l'attribution seule tranche.
    expect(citationParEpreuve('J10').deMarcel).toBe(false)
    expect(citationParEpreuve('RUSH01').deMarcel).toBe(false)
    expect(citationParEpreuve('M01').deMarcel).toBe(false)
  })

  it('ignore une épreuve inconnue', () => {
    expect(citationParEpreuve('J42')).toBeNull()
  })
})

describe('citationDeMarcel', () => {
  it('rend la citation de l’épreuve quand Marcel la signe', () => {
    expect(citationDeMarcel('J03').idEpreuve).toBe('J03')
    expect(citationDeMarcel('J03').deMarcel).toBe(true)
  })

  it('remonte au dernier mémo de Marcel quand une autre bouche ouvre le sujet', () => {
    // RUSH01 est signé de la DRH : le dernier mémo en amont est celui de J05.
    expect(citationDeMarcel('RUSH01').idEpreuve).toBe('J05')
    expect(citationDeMarcel('M01').idEpreuve).toBe('J09')
  })

  it('se rabat sur le premier mémo quand rien ne précède', () => {
    // J00 est signé de la DRH et ouvre le programme.
    expect(citationDeMarcel('J00').idEpreuve).toBe('J01')
    expect(citationDeMarcel('epreuve-inconnue').idEpreuve).toBe('J01')
  })

  it('ne rend jamais autre chose qu’une parole de Marcel', () => {
    for (const id of idsEpreuves) {
      expect(citationDeMarcel(id).deMarcel).toBe(true)
    }
  })
})
