import { describe, expect, it } from 'vitest'
import { epreuveParId, epreuves, epreuvesDeLaPhase } from '../data/programme.js'
import {
  ETATS_EPREUVE,
  definirExercice,
  enregistrerQuiz,
  etatInitial,
  ouvrirEpreuve
} from '../store/progression.js'
import {
  ID_SALLE_MACHINE,
  IDS_RUSH,
  LEGENDE,
  LIBELLES_ETAT,
  LIBELLES_ETAT_MAJUSCULE,
  bureauxMissions,
  comptePhase,
  couloirPiscine,
  salle,
  salleMachine,
  sallesRush
} from './carte.js'

// Coche tous les exercices d'une epreuve : elle passe donc son seuil du jour.
function valider(etat, idEpreuve) {
  return epreuveParId(idEpreuve).exercices.reduce(
    (cumul, ex) => definirExercice(cumul, idEpreuve, ex.id, true),
    etat
  )
}

// Ouvre le couloir jusqu'a l'epreuve visee, celle-ci exclue.
function ouvrirJusqua(idEpreuve) {
  let etat = etatInitial()
  for (const epreuve of epreuves) {
    if (epreuve.id === idEpreuve) break
    etat = valider(etat, epreuve.id)
  }
  return etat
}

describe('la legende', () => {
  it('annonce les quatre etats de salle dans l’ordre du design', () => {
    expect(LEGENDE.map((l) => l.etat)).toEqual([...ETATS_EPREUVE])
    expect(LEGENDE.map((l) => l.libelle)).toEqual([
      'Verrouillée',
      'Disponible',
      'En cours',
      'Validée'
    ])
  })

  it('perd ses accents en capitales, comme les sorties COBOL', () => {
    for (const etat of ETATS_EPREUVE) {
      const majuscule = LIBELLES_ETAT_MAJUSCULE[etat]
      // Ni minuscule ni accent : le jeu de caracteres d'une sortie COBOL.
      expect(majuscule).toMatch(/^[A-Z ]+$/)
      const sansAccent = LIBELLES_ETAT[etat]
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
      expect(majuscule).toBe(sansAccent)
    }
  })
})

describe('une salle', () => {
  it('ouvre le plan sur J00 disponible et tout le reste verrouille', () => {
    const etat = etatInitial()
    expect(salle(etat, 'J00').etat).toBe('disponible')
    expect(salle(etat, 'J00').libelle).toBe('Disponible')
    expect(salle(etat, 'J00').ouvrable).toBe(true)
    expect(salle(etat, 'J00').tampon).toBe(null)

    for (const epreuve of epreuves.slice(1)) {
      expect(salle(etat, epreuve.id).etat).toBe('verrouillee')
    }
  })

  it('ne laisse pas entrer dans une salle verrouillee et dit laquelle ouvrir', () => {
    const salleJ02 = salle(etatInitial(), 'J02')
    expect(salleJ02.ouvrable).toBe(false)
    expect(salleJ02.annonce).toContain('verrouillée')
    expect(salleJ02.annonce).toContain('J01')
  })

  it('passe « en cours » des qu’on a pose quelque chose dessus', () => {
    let etat = valider(etatInitial(), 'J00')
    expect(salle(etat, 'J01').etat).toBe('disponible')

    etat = definirExercice(etat, 'J01', 'ex00', true)
    expect(salle(etat, 'J01').etat).toBe('en-cours')
    expect(salle(etat, 'J01').libelle).toBe('En cours')
    expect(salle(etat, 'J01').ouvrable).toBe(true)
  })

  it('se contente d’avoir ete ouverte dans le lecteur pour passer « en cours »', () => {
    const etat = ouvrirEpreuve(valider(etatInitial(), 'J00'), 'J01')
    expect(salle(etat, 'J01').etat).toBe('en-cours')
  })

  it('tamponne les XP reellement gagnes, quiz du soir compris', () => {
    let etat = valider(etatInitial(), 'J00')
    etat = valider(etat, 'J01')
    const sansQuiz = salle(etat, 'J01')
    expect(sansQuiz.etat).toBe('validee')
    expect(sansQuiz.xp).toBe(125) // 95 de base + 30 de bonus
    expect(sansQuiz.tampon).toBe('VALIDE +125')
    expect(sansQuiz.annonce).toContain('125 XP')

    etat = enregistrerQuiz(etat, 'J01', 8)
    expect(salle(etat, 'J01').tampon).toBe('VALIDE +135')
  })

  it('tamponne sans chiffre la salle machine, qui ne rapporte aucun XP', () => {
    let etat = etatInitial()
    for (const epreuve of epreuves) etat = valider(etat, epreuve.id)
    const machine = salle(etat, ID_SALLE_MACHINE)
    expect(machine.etat).toBe('validee')
    expect(machine.xp).toBe(0)
    expect(machine.tampon).toBe('VALIDE')
  })

  it('renvoie null pour une salle qui n’existe pas', () => {
    expect(salle(etatInitial(), 'J99')).toBe(null)
  })
})

describe('le plan des sous-sols', () => {
  it('range les onze journees dans le couloir et les rushs a part', () => {
    const couloir = couloirPiscine(etatInitial())
    expect(couloir.map((s) => s.id)).toEqual([
      'J00', 'J01', 'J02', 'J03', 'J04', 'J05', 'J06', 'J07', 'J08', 'J09', 'J10'
    ])
    expect(sallesRush(etatInitial()).map((s) => s.id)).toEqual([...IDS_RUSH])
    expect(couloir.length + IDS_RUSH.length).toBe(epreuvesDeLaPhase('piscine').length)
  })

  it('aligne les six bureaux des missions et la seule salle machine', () => {
    expect(bureauxMissions(etatInitial()).map((s) => s.id)).toEqual([
      'M01', 'M02', 'M03', 'M04', 'M05', 'M06'
    ])
    expect(salleMachine(etatInitial()).id).toBe(ID_SALLE_MACHINE)
    expect(salleMachine(etatInitial()).phase).toBe('phase3')
  })

  it('couvre toutes les epreuves du programme, sans doublon', () => {
    const etat = etatInitial()
    const posees = [
      ...couloirPiscine(etat),
      ...sallesRush(etat),
      ...bureauxMissions(etat),
      salleMachine(etat)
    ].map((s) => s.id)
    expect(new Set(posees).size).toBe(posees.length)
    expect(new Set(posees)).toEqual(new Set(epreuves.map((e) => e.id)))
  })

  it('ouvre le rush une fois la journee qui le precede validee', () => {
    const etat = ouvrirJusqua('RUSH01')
    const [rush01, rush02] = sallesRush(etat)
    expect(rush01.etat).toBe('disponible')
    expect(rush02.etat).toBe('verrouillee')
  })

  it('n’ouvre la salle machine qu’apres les six missions', () => {
    expect(salleMachine(ouvrirJusqua('M06')).etat).toBe('verrouillee')
    expect(salleMachine(ouvrirJusqua(ID_SALLE_MACHINE)).etat).toBe('disponible')
  })
})

describe('le compteur d’un niveau', () => {
  it('part de zero et suit les validations', () => {
    expect(comptePhase(etatInitial(), 'piscine')).toEqual({ validees: 0, total: 13 })
    expect(comptePhase(etatInitial(), 'missions')).toEqual({ validees: 0, total: 6 })
    expect(comptePhase(etatInitial(), 'phase3')).toEqual({ validees: 0, total: 1 })

    let etat = valider(etatInitial(), 'J00')
    etat = valider(etat, 'J01')
    expect(comptePhase(etat, 'piscine').validees).toBe(2)
  })
})
