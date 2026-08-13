import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DELAI_SAUVEGARDE, creerPersistance } from './persistance.js'
import {
  definirExercice,
  definirReglage,
  etatInitial,
  serialiser,
  xpTotal
} from './progression.js'

// Un pont `window.cgba` simule : il note ce qu'on lui demande et garde le
// dernier paquet ecrit, comme le ferait le fichier de l'utilisateur.
function pontSimule({ progression = null, echec = false } = {}) {
  const journal = []
  let fichier = progression
  let rappelFermeture = null
  return {
    journal,
    fichier: () => fichier,
    declencherFermeture: () => rappelFermeture?.(),
    ecouteFermeture: () => rappelFermeture !== null,
    pont: {
      present: true,
      charger: async () => {
        journal.push('charger')
        if (echec) return { ok: false, erreur: 'Progression illisible : disque HS' }
        return { ok: true, progression: fichier }
      },
      sauver: async (paquet) => {
        journal.push('sauver')
        if (echec) return { ok: false, erreur: 'Ecriture impossible' }
        fichier = paquet
        return { ok: true, chemin: '/tmp/progression.json' }
      },
      exporter: async (paquet) => {
        journal.push('exporter')
        return { ok: true, chemin: '/tmp/export.json', paquet }
      },
      importer: async () => {
        journal.push('importer')
        return { ok: true, progression: fichier, chemin: '/tmp/import.json' }
      },
      surAvantFermeture: (rappel) => {
        rappelFermeture = rappel
        return () => { rappelFermeture = null }
      },
      tamponVide: () => journal.push('tampon-vide')
    }
  }
}

describe('la persistance de la progression', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  describe('sur le pont Electron', () => {
    it('lit le fichier au demarrage, vierge la premiere fois', async () => {
      const simule = pontSimule()
      const persistance = creerPersistance({ pont: simule.pont })
      expect(persistance.presente()).toBe(true)

      const rapport = await persistance.charger()
      expect(rapport.ok).toBe(true)
      expect(rapport.etat).toEqual(etatInitial())
      expect(simule.journal).toEqual(['charger'])
    })

    it('relit une progression deja ecrite', async () => {
      const attendu = definirExercice(etatInitial(), 'J01', 'ex00', true)
      const simule = pontSimule({ progression: serialiser(attendu) })
      const persistance = creerPersistance({ pont: simule.pont })

      const rapport = await persistance.charger()
      expect(rapport.etat).toEqual(attendu)
      expect(xpTotal(rapport.etat)).toBe(10)
    })

    it('amortit les ecritures : une seule sauvegarde pour dix changements', async () => {
      const simule = pontSimule()
      const persistance = creerPersistance({ pont: simule.pont })

      let etat = etatInitial()
      for (const exercice of ['ex00', 'ex01', 'ex02', 'ex03', 'ex04']) {
        etat = definirExercice(etat, 'J01', exercice, true)
        persistance.planifier(etat)
      }
      expect(simule.journal).toEqual([])

      await vi.advanceTimersByTimeAsync(DELAI_SAUVEGARDE)
      expect(simule.journal).toEqual(['sauver'])
      expect(simule.fichier()).toEqual(serialiser(etat))
    })

    it('n ecrit rien avant la fin du delai', async () => {
      const simule = pontSimule()
      const persistance = creerPersistance({ pont: simule.pont, delai: 500 })
      persistance.planifier(definirExercice(etatInitial(), 'J00', 'ex00', true))

      await vi.advanceTimersByTimeAsync(499)
      expect(simule.journal).toEqual([])
      await vi.advanceTimersByTimeAsync(1)
      expect(simule.journal).toEqual(['sauver'])
    })

    it('ecrit encore apres la premiere fenetre', async () => {
      const simule = pontSimule()
      const persistance = creerPersistance({ pont: simule.pont })

      persistance.planifier(definirExercice(etatInitial(), 'J00', 'ex00', true))
      await vi.advanceTimersByTimeAsync(DELAI_SAUVEGARDE)
      const dernier = definirReglage(etatInitial(), 'sombre', true)
      persistance.planifier(dernier)
      await vi.advanceTimersByTimeAsync(DELAI_SAUVEGARDE)

      expect(simule.journal).toEqual(['sauver', 'sauver'])
      expect(simule.fichier()).toEqual(serialiser(dernier))
    })

    it('vide le tampon a la demande, sans attendre le minuteur', async () => {
      const simule = pontSimule()
      const persistance = creerPersistance({ pont: simule.pont })
      const etat = definirExercice(etatInitial(), 'J00', 'ex00', true)

      persistance.planifier(etat)
      await persistance.vider()
      expect(simule.fichier()).toEqual(serialiser(etat))

      // Le minuteur annule ne redeclenche pas une ecriture pour rien.
      await vi.advanceTimersByTimeAsync(DELAI_SAUVEGARDE * 2)
      expect(simule.journal).toEqual(['sauver'])
      expect((await persistance.vider()).rienAEcrire).toBe(true)
    })

    it('vide le tampon quand l application se ferme, puis accuse reception', async () => {
      const simule = pontSimule()
      const persistance = creerPersistance({ pont: simule.pont })
      const etat = definirExercice(etatInitial(), 'J00', 'ex00', true)

      persistance.planifier(etat)
      expect(simule.ecouteFermeture()).toBe(true)
      simule.declencherFermeture()
      await vi.runAllTimersAsync()

      expect(simule.fichier()).toEqual(serialiser(etat))
      expect(simule.journal).toEqual(['sauver', 'tampon-vide'])
    })

    it('rend la main sur un fichier illisible sans perdre l application', async () => {
      const simule = pontSimule({ echec: true })
      const persistance = creerPersistance({ pont: simule.pont })

      const rapport = await persistance.charger()
      expect(rapport.ok).toBe(false)
      expect(rapport.etat).toEqual(etatInitial())
      expect(rapport.erreur).toContain('illisible')
    })

    it('survit a un pont qui jette', async () => {
      const pont = {
        present: true,
        charger: async () => { throw new Error('canal coupe') },
        sauver: async () => { throw new Error('canal coupe') }
      }
      const persistance = creerPersistance({ pont })

      const lecture = await persistance.charger()
      expect(lecture.ok).toBe(false)
      expect(lecture.etat).toEqual(etatInitial())

      persistance.planifier(etatInitial())
      const ecriture = await persistance.vider()
      expect(ecriture.ok).toBe(false)
      expect(ecriture.erreur).toContain('canal coupe')
    })

    it('ecrit ce qui attend avant d exporter', async () => {
      const simule = pontSimule()
      const persistance = creerPersistance({ pont: simule.pont })
      const etat = definirExercice(etatInitial(), 'J00', 'ex00', true)

      persistance.planifier(etat)
      const rapport = await persistance.exporter(etat)
      expect(rapport.ok).toBe(true)
      expect(simule.journal).toEqual(['sauver', 'exporter'])
    })

    it('relit la progression importee et jette le tampon devenu caduc', async () => {
      const ancien = definirExercice(etatInitial(), 'J01', 'ex00', true)
      const simule = pontSimule({ progression: serialiser(ancien) })
      const persistance = creerPersistance({ pont: simule.pont })

      persistance.planifier(definirReglage(etatInitial(), 'sombre', true))
      const rapport = await persistance.importer()
      expect(rapport.ok).toBe(true)
      expect(rapport.etat).toEqual(ancien)

      await vi.advanceTimersByTimeAsync(DELAI_SAUVEGARDE)
      expect(simule.journal).toEqual(['importer'])
    })

    it('debranche tout a l arret', async () => {
      const simule = pontSimule()
      const persistance = creerPersistance({ pont: simule.pont })
      persistance.planifier(definirExercice(etatInitial(), 'J00', 'ex00', true))
      persistance.arreter()

      await vi.advanceTimersByTimeAsync(DELAI_SAUVEGARDE * 2)
      expect(simule.journal).toEqual([])
      expect(simule.ecouteFermeture()).toBe(false)
    })
  })

  describe('en repli memoire (dev navigateur)', () => {
    it('se declare absente mais reste jouable', async () => {
      const persistance = creerPersistance({ pont: null })
      expect(persistance.presente()).toBe(false)

      const vierge = await persistance.charger()
      expect(vierge.etat).toEqual(etatInitial())
      expect(vierge.memoire).toBe(true)

      const etat = definirExercice(etatInitial(), 'J00', 'ex00', true)
      persistance.planifier(etat)
      await vi.advanceTimersByTimeAsync(DELAI_SAUVEGARDE)

      const relu = await persistance.charger()
      expect(relu.etat).toEqual(etat)
    })

    it('refuse l export et l import, qui demandent les boites natives', async () => {
      const persistance = creerPersistance({ pont: null })
      expect((await persistance.exporter(etatInitial())).ok).toBe(false)
      expect((await persistance.importer()).ok).toBe(false)
    })
  })
})
