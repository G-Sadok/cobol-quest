import { describe, expect, it } from 'vitest'
import { lireSujet } from '../data/corpus.js'
import { epreuveParId, epreuves } from '../data/programme.js'
import { definirExercice, etatInitial, ouvrirEpreuve } from '../store/progression.js'
import {
  adresseEpreuve,
  decouperSujet,
  ficheLecture,
  reperesEpreuve,
  voisines
} from './lecteur.js'

// Coche tous les exercices d'une epreuve : elle passe donc son seuil du jour.
function valider(etat, idEpreuve) {
  return epreuveParId(idEpreuve).exercices.reduce(
    (cumul, ex) => definirExercice(cumul, idEpreuve, ex.id, true),
    etat
  )
}

// Ouvre le programme jusqu'a l'epreuve visee, celle-ci exclue.
function ouvrirJusqua(idEpreuve) {
  let etat = etatInitial()
  for (const epreuve of epreuves) {
    if (epreuve.id === idEpreuve) break
    etat = valider(etat, epreuve.id)
  }
  return etat
}

describe('l’adresse d’une epreuve', () => {
  it('nomme la salle, le bureau ou la salle machine selon la phase', () => {
    expect(adresseEpreuve(epreuveParId('J03'))).toBe('LA PISCINE · SALLE J03')
    expect(adresseEpreuve(epreuveParId('RUSH01'))).toBe('LA PISCINE · SALLE RUSH01')
    expect(adresseEpreuve(epreuveParId('M02'))).toBe('LES MISSIONS · BUREAU M02')
    expect(adresseEpreuve(epreuveParId('PHASE3'))).toBe('LA SALLE MACHINE · PHASE 3')
  })

  it('reste un label mono : capitales sans accent (design, section 2)', () => {
    for (const epreuve of epreuves) {
      expect(adresseEpreuve(epreuve)).toMatch(/^[A-Z0-9 ·]+$/)
    }
  })
})

describe('le decoupage du markdown d’un sujet', () => {
  it('detache le titre et le sous-titre du corps', () => {
    const decoupe = decouperSujet('# PISCINE : J03\n### 120 XP\n\nLe texte.\n')
    expect(decoupe.titre).toBe('PISCINE : J03')
    expect(decoupe.sousTitre).toBe('120 XP')
    expect(decoupe.corps).toBe('Le texte.')
  })

  it('garde le corps intact quand il n’y a pas de sous-titre', () => {
    const decoupe = decouperSujet('# Titre\n\n## Le memo\n\nLe texte.')
    expect(decoupe.sousTitre).toBeNull()
    expect(decoupe.corps).toBe('## Le memo\n\nLe texte.')
  })

  it('ne retire une section de niveau 3 que si un titre l’a precedee', () => {
    const decoupe = decouperSujet('### Une section\n\nLe texte.')
    expect(decoupe.titre).toBeNull()
    expect(decoupe.corps).toBe('### Une section\n\nLe texte.')
  })

  it('tient devant un sujet vide ou absent', () => {
    expect(decouperSujet(null)).toEqual({ titre: null, sousTitre: null, corps: '' })
    expect(decouperSujet('   \n\n')).toEqual({ titre: null, sousTitre: null, corps: '' })
  })

  it('detache l’en-tete des vingt sujets du corpus', () => {
    for (const epreuve of epreuves) {
      const decoupe = decouperSujet(lireSujet(epreuve.chemin))
      expect(decoupe.titre, epreuve.id).toBeTruthy()
      expect(decoupe.sousTitre, epreuve.id).toBeTruthy()
      // Le corps commence apres l'en-tete : plus aucun titre de niveau 1.
      expect(decoupe.corps.startsWith('# '), epreuve.id).toBe(false)
    }
  })
})

describe('les reperes d’une epreuve', () => {
  it('compte les exercices, les bonus et le seuil du jour', () => {
    expect(reperesEpreuve(epreuveParId('J01'))).toEqual(['6 exercices', '1 bonus', 'seuil 70 XP'])
  })

  it('tait les bonus quand l’epreuve n’en a pas', () => {
    expect(reperesEpreuve(epreuveParId('J00'))).toEqual(['1 exercice', 'seuil 30 XP'])
  })

  it('annonce la phase 3 sur l’honneur, faute de moulinette', () => {
    expect(reperesEpreuve(epreuveParId('PHASE3'))).toEqual([
      '4 exercices',
      'validation sur l’honneur'
    ])
  })
})

describe('la fiche de lecture', () => {
  it('suit l’epreuve retenue et porte son texte', () => {
    const etat = ouvrirEpreuve(ouvrirJusqua('J03'), 'J03')
    const fiche = ficheLecture(etat)

    expect(fiche.epreuve.id).toBe('J03')
    expect(fiche.adresse).toBe('LA PISCINE · SALLE J03')
    expect(fiche.titre).toBe('Les décisions')
    // Ouvrir une epreuve, c'est deja la commencer (store/progression.js).
    expect(fiche.etat).toBe('en-cours')
    expect(fiche.libelleEtat).toBe('En cours')
    expect(fiche.absent).toBe(false)
    expect(fiche.corps).toContain('LE MÉMO DU JOUR')
  })

  it('ouvre J00 au premier lancement, avant toute progression', () => {
    const fiche = ficheLecture(etatInitial())
    expect(fiche.epreuve.id).toBe('J00')
    expect(fiche.corps.length).toBeGreaterThan(0)
  })

  it('porte le texte des vingt sujets du programme', () => {
    for (const epreuve of epreuves) {
      const fiche = ficheLecture(ouvrirEpreuve(ouvrirJusqua(epreuve.id), epreuve.id))
      expect(fiche.epreuve.id, epreuve.id).toBe(epreuve.id)
      expect(fiche.absent, epreuve.id).toBe(false)
      expect(fiche.corps.length, epreuve.id).toBeGreaterThan(0)
    }
  })
})

describe('les epreuves voisines', () => {
  it('encadrent l’epreuve dans l’ordre du programme', () => {
    const { precedente, suivante } = voisines(ouvrirJusqua('J03'), 'J03')
    expect(precedente.id).toBe('J02')
    expect(suivante.id).toBe('J04')
    expect(precedente.accessible).toBe(true)
  })

  it('n’ont pas de bord avant la premiere ni apres la derniere', () => {
    const etat = etatInitial()
    expect(voisines(etat, 'J00').precedente).toBeNull()
    expect(voisines(etat, epreuves[epreuves.length - 1].id).suivante).toBeNull()
  })

  it('annoncent une suivante verrouillee sans l’ouvrir', () => {
    const { suivante } = voisines(etatInitial(), 'J00')
    expect(suivante.id).toBe('J01')
    expect(suivante.accessible).toBe(false)
    expect(suivante.annonce).toContain('verrouillée')
    expect(suivante.annonce).toContain('J00')
  })

  it('renvoient deux bords vides pour une epreuve inconnue', () => {
    expect(voisines(etatInitial(), 'J42')).toEqual({ precedente: null, suivante: null })
  })
})
