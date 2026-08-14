// Le guide n'a d'interet que s'il parle du dossier de CELUI qui le lit : ce
// qu'on verrouille ici, c'est qu'il change avec l'etat, et qu'il ne propose
// jamais un geste impossible.

import { describe, expect, it } from 'vitest'
import { idsBadges } from '../data/badges.js'
import { epreuveParId, idsAvecQuiz, idsEpreuves } from '../data/programme.js'
import { definirExercice, enregistrerQuiz, etatInitial } from '../store/progression.js'
import { ecrans, idsEcrans } from './ecrans.js'
import { CHEMIN_DOSSIER, chapitreDuMoment, chapitres, prochainPas } from './guide.js'

// Coche tous les exercices non-bonus des epreuves demandees : de quoi valider.
function valider(etat, ...ids) {
  return ids.reduce(
    (cumul, id) =>
      epreuveParId(id).exercices.reduce(
        (interne, ex) => (ex.estBonus ? interne : definirExercice(interne, id, ex.id, true)),
        cumul
      ),
    etat
  )
}

function chapitre(etat, id) {
  return chapitres(etat).find((c) => c.id === id)
}

describe('les chapitres du guide', () => {
  it('en pose six, numerotes, chacun avec son label mono et son titre', () => {
    const liste = chapitres(etatInitial())
    expect(liste).toHaveLength(6)
    expect(liste.map((c) => c.numero)).toEqual([1, 2, 3, 4, 5, 6])
    for (const c of liste) {
      expect(c.id).toBeTruthy()
      expect(c.titre).toBeTruthy()
      expect(c.label).toBe(c.label.toUpperCase())
      expect(c.points.length).toBeGreaterThan(2)
    }
  })

  it('ne propose que des gestes que la coque sait executer', () => {
    for (const c of chapitres(etatInitial())) {
      expect(['ecran', 'sujet']).toContain(c.geste.type)
      if (c.geste.type === 'ecran') expect(idsEcrans).toContain(c.geste.cible)
      else expect(epreuveParId(c.geste.cible)).toBeTruthy()
    }
  })

  it('nomme la salle du moment plutot que « la salle disponible »', () => {
    const vierge = chapitre(etatInitial(), 'premiers-pas')
    expect(vierge.etat.texte).toContain('J00')
    expect(vierge.geste.cible).toBe('J00')

    const apresJ00 = chapitre(valider(etatInitial(), 'J00'), 'premiers-pas')
    expect(apresJ00.etat.texte).toContain('J01')
    expect(apresJ00.geste.cible).toBe('J01')
  })

  it('donne la commande BERTHA de l exercice qui vient, pas une commande type', () => {
    const vierge = chapitre(etatInitial(), 'cocher')
    expect(vierge.commande).toContain('J00/ex00')

    const apresJ00 = chapitre(valider(etatInitial(), 'J00'), 'cocher')
    expect(apresJ00.commande).toContain('J01/ex00')
  })

  it('compte les XP qui restent avant le seuil du jour', () => {
    const vierge = chapitre(etatInitial(), 'cocher')
    expect(vierge.etat.texte).toContain('0 XP sur les 30')
    expect(vierge.etat.ton).toBe('encours')

    // Une salle validee n'est plus « la salle du moment » : le guide passe a la
    // suivante et annonce SON seuil, celui de J01.
    const suivante = chapitre(valider(etatInitial(), 'J00'), 'cocher')
    expect(suivante.etat.texte).toContain('J01')
    expect(suivante.etat.texte).toContain('70')
  })

  it('dit ce qui ouvrira la seance du soir tant qu elle est fermee', () => {
    const vierge = chapitre(etatInitial(), 'quiz')
    expect(vierge.etat.ton).toBe('verrou')
    expect(vierge.etat.texte).toContain('J00')

    const ouverte = chapitre(valider(etatInitial(), 'J00'), 'quiz')
    expect(ouverte.etat.ton).toBe('encours')
    expect(ouverte.etat.texte).toContain('J01')
  })

  it('annonce les 10 XP deja au dossier quand la seance est reussie', () => {
    const etat = enregistrerQuiz(valider(etatInitial(), 'J00'), 'J01', 8)
    const c = chapitre(etat, 'quiz')
    expect(c.etat.ton).toBe('oui')
    expect(c.etat.texte).toContain('10 XP')
    expect(c.resume).toContain(`sur les ${idsAvecQuiz.length}`)
  })

  it('compte les decorations et ce qui manque avant l echelon suivant', () => {
    const c = chapitre(etatInitial(), 'carriere')
    expect(c.etat.texte).toContain(`sur ${idsBadges.length}`)
    expect(c.etat.texte).toContain('Candidat')
    expect(c.etat.texte).toMatch(/150 XP/)
  })

  it('donne le chemin reel du dossier et compte ce qu il contient', () => {
    const c = chapitre(valider(etatInitial(), 'J00'), 'dossier')
    expect(c.chemin).toBe(CHEMIN_DOSSIER)
    expect(c.chemin).toContain('progression.json')
    expect(c.etat.texte).toContain('1 salle validée')
  })

  it('tire les raccourcis du registre des ecrans, donc ils ne peuvent pas mentir', () => {
    const c = chapitre(etatInitial(), 'sous-la-main')
    expect(c.raccourcis).toHaveLength(ecrans.length)
    expect(c.raccourcis[0].touche).toBe('Cmd + 1')
    expect(c.raccourcis.at(-1).libelle).toBe(ecrans.at(-1).libelle)
    expect(c.etat).toBeNull()
  })
})

describe('ce qu il y a a faire maintenant', () => {
  it('envoie cocher la salle en cours tant que son seuil n est pas tenu', () => {
    const suite = prochainPas(etatInitial())
    expect(suite.geste.type).toBe('sujet')
    expect(suite.geste.cible).toBe('J00')
    expect(suite.texte).toContain('30 XP')
  })

  it('envoie au quiz quand une salle validee doit encore sa seance du soir', () => {
    const suite = prochainPas(valider(etatInitial(), 'J00', 'J01'))
    expect(suite.geste.type).toBe('ecran')
    expect(suite.geste.cible).toBe('quiz')
    expect(suite.texte).toContain('J01')
  })

  it('passe a la salle suivante une fois la seance du soir reussie', () => {
    const etat = enregistrerQuiz(valider(etatInitial(), 'J00', 'J01'), 'J01', 8)
    const suite = prochainPas(etat)
    expect(suite.geste.type).toBe('sujet')
    expect(suite.geste.cible).toBe('J02')
  })

  it('renvoie au livret quand tout le programme est validé', () => {
    const suite = prochainPas(valider(etatInitial(), ...idsEpreuves))
    expect(suite.ton).toBe('oui')
    expect(suite.geste.cible).toBe('livret')
  })
})

describe('le chapitre ouvert en arrivant', () => {
  it('ouvre sur le plan quand rien n est commence', () => {
    expect(chapitreDuMoment(etatInitial())).toBe('premiers-pas')
  })

  it('ouvre sur la feuille de route quand une salle est entamee', () => {
    const etat = definirExercice(valider(etatInitial(), 'J00'), 'J01', 'ex00', true)
    expect(chapitreDuMoment(etat)).toBe('cocher')
  })

  it('ouvre sur la seance du soir quand elle est due a une salle validee', () => {
    expect(chapitreDuMoment(valider(etatInitial(), 'J00', 'J01'))).toBe('quiz')
  })
})
