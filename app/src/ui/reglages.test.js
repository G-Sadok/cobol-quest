import { describe, expect, it } from 'vitest'
import { epreuveParId } from '../data/programme.js'
import {
  REGLAGES_PAR_DEFAUT,
  RYTHMES,
  definirExercice,
  definirReglage,
  etatInitial,
  remiseAZero,
  xpTotal
} from '../store/progression.js'
import { espacerMilliers } from './format.js'
import {
  ETAPES_EFFACEMENT,
  RYTHMES_AFFICHES,
  dossierVierge,
  etapeEffacement,
  ligneProgression,
  lignesInterrupteur,
  lignesRythme,
  listeCarriere,
  mouvementExport,
  mouvementImport,
  mouvementRemiseAZero,
  nomFichier,
  phraseEffacement,
  reglages,
  resumeCarriere,
  verdictInterrupteur,
  verdictRythme
} from './reglages.js'

// Coche tous les exercices non-bonus des epreuves demandees.
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

describe('le rythme de formation', () => {
  it('affiche exactement les trois rythmes du cahier des charges', () => {
    expect(RYTHMES_AFFICHES).toHaveLength(RYTHMES.length)
    expect([...RYTHMES_AFFICHES.map((r) => r.id)].sort()).toEqual([...RYTHMES].sort())
  })

  it('les range du plus calme au plus dur, chacun avec sa cadence', () => {
    expect(RYTHMES_AFFICHES.map((r) => r.id)).toEqual(['tranquille', 'soutenu', 'intensif'])
    for (const rythme of RYTHMES_AFFICHES) {
      expect(rythme.nom.length).toBeGreaterThan(0)
      expect(rythme.detail).toMatch(/salle/)
    }
  })

  it('marque le rythme tenu, et lui seul', () => {
    const lignes = lignesRythme(etatInitial())
    expect(lignes.filter((l) => l.actif).map((l) => l.id)).toEqual([REGLAGES_PAR_DEFAUT.rythme])
  })

  it('suit le rythme choisi', () => {
    const etat = definirReglage(etatInitial(), 'rythme', 'intensif')
    expect(lignesRythme(etat).find((l) => l.actif).id).toBe('intensif')
  })

  it('annonce le rythme retenu par un toast', () => {
    const ligne = RYTHMES_AFFICHES[0]
    expect(verdictRythme(ligne)).toEqual({ ton: 'oui', texte: 'RYTHME · TRANQUILLE' })
  })
})

describe('les interrupteurs de l affichage', () => {
  it('en pose deux : le theme et les effets de phosphore', () => {
    const lignes = lignesInterrupteur(etatInitial())
    expect(lignes.map((l) => l.clef)).toEqual(['sombre', 'scanlines'])
    for (const ligne of lignes) expect(ligne.clef in REGLAGES_PAR_DEFAUT).toBe(true)
  })

  it('part du reglage d origine : clair, effets allumes', () => {
    const lignes = lignesInterrupteur(etatInitial())
    expect(lignes[0].actif).toBe(REGLAGES_PAR_DEFAUT.sombre)
    expect(lignes[1].actif).toBe(REGLAGES_PAR_DEFAUT.scanlines)
  })

  it('dit dans quel theme on est', () => {
    expect(lignesInterrupteur(etatInitial())[0].detail).toContain('clair')
    const sombre = definirReglage(etatInitial(), 'sombre', true)
    const ligne = lignesInterrupteur(sombre)[0]
    expect(ligne.actif).toBe(true)
    expect(ligne.detail).toContain('sombre')
  })

  it('suit l interrupteur des effets', () => {
    const eteints = definirReglage(etatInitial(), 'scanlines', false)
    expect(lignesInterrupteur(eteints)[1].actif).toBe(false)
  })

  it('annonce chaque bascule, dans les deux sens', () => {
    const [theme, effets] = lignesInterrupteur(etatInitial())
    expect(verdictInterrupteur(theme, true)).toEqual({ ton: 'oui', texte: 'THEME SOMBRE · ON' })
    expect(verdictInterrupteur(effets, false)).toEqual({ ton: 'non', texte: 'EFFETS · OFF' })
  })
})

describe('le poids de la carriere', () => {
  it('est nul sur un dossier neuf', () => {
    const resume = resumeCarriere(etatInitial())
    expect(resume).toEqual({ xp: 0, badges: 0, salles: 0 })
    expect(dossierVierge(resume)).toBe(true)
  })

  it('compte les XP, les decorations et les salles validees', () => {
    const etat = valider(etatInitial(), 'J00')
    const resume = resumeCarriere(etat)
    expect(resume.xp).toBe(xpTotal(etat))
    expect(resume.salles).toBe(1)
    expect(resume.badges).toBeGreaterThan(0)
    expect(dossierVierge(resume)).toBe(false)
  })

  it('accorde le singulier et le pluriel', () => {
    expect(listeCarriere({ xp: 10, badges: 1, salles: 1 })).toBe(
      '10 XP, 1 décoration et 1 salle validée'
    )
    expect(listeCarriere({ xp: 1240, badges: 3, salles: 4 })).toBe(
      `${espacerMilliers(1240)} XP, 3 décorations et 4 salles validées`
    )
  })

  it('ne promet pas de broyer un dossier vide', () => {
    expect(phraseEffacement({ xp: 0, badges: 0, salles: 0 })).toContain('déjà vierge')
    expect(phraseEffacement({ xp: 90, badges: 2, salles: 1 })).toBe(
      '90 XP, 2 décorations et 1 salle validée partent au broyeur.'
    )
  })
})

describe('la remise a zero', () => {
  const resume = { xp: 1240, badges: 3, salles: 4 }

  it('se confirme deux fois (§5.6)', () => {
    expect(ETAPES_EFFACEMENT).toBe(2)
    expect(etapeEffacement(1, resume).rang).toBe(1)
    expect(etapeEffacement(2, resume).rang).toBe(2)
  })

  it('n ouvre aucune boite hors de ces deux etapes', () => {
    expect(etapeEffacement(0, resume)).toBeNull()
    expect(etapeEffacement(3, resume)).toBeNull()
  })

  it('annonce d abord ce qui part, en gardant les reglages', () => {
    const etape = etapeEffacement(1, resume)
    expect(etape.corps).toContain(`${espacerMilliers(1240)} XP`)
    expect(etape.corps).toContain('réglages')
    expect(etape.confirmer).toBe('Effacer…')
    expect(etape.annuler).toBe('Annuler')
  })

  it('demande ensuite le dernier mot, et le dit definitif', () => {
    const etape = etapeEffacement(2, resume)
    expect(etape.corps).toContain('définitive')
    expect(etape.confirmer).toBe('Effacer définitivement')
    expect(etape.annuler).toBe('Annuler')
  })

  it('rend compte de l effacement une fois qu il a eu lieu', () => {
    const mouvement = mouvementRemiseAZero(resume)
    expect(mouvement).toMatchObject({ ton: 'non', toast: 'PROGRESSION EFFACEE' })
    expect(mouvement.ligne).toContain(`${espacerMilliers(1240)} XP`)
    expect(mouvementRemiseAZero({ xp: 0, badges: 0, salles: 0 }).ligne).toContain('déjà vide')
  })

  it('laisse les reglages en place, comme le dit la boite', () => {
    const etat = definirReglage(valider(etatInitial(), 'J00'), 'rythme', 'intensif')
    const apres = remiseAZero(etat)
    expect(dossierVierge(resumeCarriere(apres))).toBe(true)
    expect(apres.reglages.rythme).toBe('intensif')
  })
})

describe('l export et l import', () => {
  it('tire le nom du fichier de son chemin', () => {
    expect(nomFichier('/Users/marcel/Bureau/cobol-quest-progression.json')).toBe(
      'cobol-quest-progression.json'
    )
    expect(nomFichier('')).toBe('progression.json')
    expect(nomFichier(undefined)).toBe('progression.json')
  })

  it('accuse reception d un export reussi', () => {
    const mouvement = mouvementExport({ ok: true, chemin: '/tmp/dossier.json' })
    expect(mouvement.ton).toBe('oui')
    expect(mouvement.toast).toBe('PROGRESSION EXPORTEE · dossier.json')
    expect(mouvement.ligne).toBe('Dernier export : dossier.json')
  })

  it('distingue un export annule d un export en echec', () => {
    expect(mouvementExport({ ok: false, annule: true })).toMatchObject({
      ton: 'non',
      toast: 'EXPORT ANNULE'
    })
    const echec = mouvementExport({ ok: false, erreur: 'Disque plein.' })
    expect(echec.toast).toBe('EXPORT IMPOSSIBLE')
    expect(echec.ligne).toBe('Disque plein.')
  })

  it('accuse reception d un import reussi', () => {
    const mouvement = mouvementImport({ ok: true, chemin: '/tmp/reprise.json' })
    expect(mouvement.ton).toBe('oui')
    expect(mouvement.toast).toBe('PROGRESSION IMPORTEE · reprise.json')
    expect(mouvement.ligne).toContain('reprise.json')
  })

  it('dit qu un import annule n a rien change', () => {
    const mouvement = mouvementImport({ ok: false, annule: true })
    expect(mouvement.toast).toBe('AUCUN FICHIER SELECTIONNE')
    expect(mouvement.ligne).toContain('n’a pas bougé')
  })

  it('rend la raison d un import refuse', () => {
    const mouvement = mouvementImport({
      ok: false,
      erreur: 'Ce fichier n’est pas une progression COBOL Quest.'
    })
    expect(mouvement.toast).toBe('IMPORT IMPOSSIBLE')
    expect(mouvement.ligne).toBe('Ce fichier n’est pas une progression COBOL Quest.')
  })

  it('previent quand le fichier reel n est pas accessible', () => {
    expect(ligneProgression(true)).toContain('dossier utilisateur')
    expect(ligneProgression(false)).toContain('application')
  })
})

describe('l ecran entier', () => {
  it('compose les trois blocs en un seul objet', () => {
    const vue = reglages(etatInitial(), true)
    expect(vue.rythmes).toHaveLength(3)
    expect(vue.interrupteurs).toHaveLength(2)
    expect(vue.vierge).toBe(true)
    expect(vue.ligneProgression).toBe(ligneProgression(true))
  })

  it('suit l etat qu on lui donne', () => {
    const etat = definirReglage(valider(etatInitial(), 'J00'), 'sombre', true)
    const vue = reglages(etat, false)
    expect(vue.interrupteurs[0].actif).toBe(true)
    expect(vue.vierge).toBe(false)
    expect(vue.resume.xp).toBe(xpTotal(etat))
  })
})
