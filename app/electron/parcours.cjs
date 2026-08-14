/*
 * LE PARCOURS DE CONTROLE (T21, cahier des charges §10).
 *
 * Le controle final exige un parcours mene de bout en bout : cocher J00, voir
 * les XP tomber, J01 s'ouvrir, passer le quiz de J01, decrocher une decoration,
 * exporter puis importer, et surtout RELANCER l'application pour verifier que
 * la progression a survecu. L'autotest de main.cjs ne peut pas le faire : il
 * est concu pour ne RIEN laisser derriere lui, alors que ce parcours-ci ne vaut
 * que par ce qu'il ecrit.
 *
 * Il se joue donc en deux lancements successifs, pilotes par
 * scripts/parcours.mjs :
 *   CQ_PARCOURS=aller   dossier neuf, on joue la journee, on exporte, on quitte
 *   CQ_PARCOURS=retour  meme dossier, on relit ce qui a survecu, on importe
 *
 * Deux garde-fous : le dossier utilisateur est impose par CQ_USER_DATA (jamais
 * celui de l'apprenti), et le fichier des boites natives est impose par
 * CQ_PARCOURS_FICHIER (personne n'est la pour cliquer « Enregistrer »).
 */

const { ipcMain } = require('electron')

// Delai laisse a React apres un clic, et delai des allers-retours IPC.
const RENDU = 80
const FICHIER = 400

function reponsesAttendues () {
  try {
    return JSON.parse(process.env.CQ_PARCOURS_REPONSES || '[]')
  } catch {
    return []
  }
}

// Les outils communs aux deux scenarios, injectes en tete de chacun.
const OUTILS = `
  const attendre = (ms) => new Promise((suite) => setTimeout(suite, ms))
  const lire = (s) => (document.querySelector(s) || {}).innerText || ''
  const items = [...document.querySelectorAll('.nav-item')]
  const aller = async (rang) => { items[rang].click(); await attendre(${RENDU}) }
  const salle = (id) => [...document.querySelectorAll('.salle')]
    .find((t) => ((t.querySelector('.salle-code') || {}).textContent || '') === id)
  const etatSalle = (id) => ((salle(id) || {}).dataset || {}).etat || 'absente'
  const xp = () => lire('.profil-xp')
  const medaille = (nom) => [...document.querySelectorAll('.decoration-tuile')]
    .find((t) => ((t.querySelector('.medaille-nom') || {}).textContent || '') === nom)
  const obtenue = (nom) => ((medaille(nom) || {}).dataset || {}).obtenue === '1'
  const decorations = () => document.querySelectorAll('.decoration-tuile[data-obtenue="1"]').length
  const puce = (id) => [...document.querySelectorAll('.quiz-puce')].find((p) => p.textContent === id)
  const seance = (id) => ((puce(id) || {}).dataset || {}).position || 'absente'
  const boutonsFichier = () => [...document.querySelectorAll('.reglages-progression .bouton-secondaire')]

  // La progression arrive du fichier APRES le premier rendu (un aller-retour
  // IPC) : lire la barre laterale trop tot, c'est lire un dossier vide. On
  // attend donc que le total d'XP ne bouge plus.
  const dossierLu = async () => {
    let avant = xp()
    for (let essai = 0; essai < 20; essai += 1) {
      await attendre(100)
      const maintenant = xp()
      if (essai >= 2 && maintenant === avant) return maintenant
      avant = maintenant
    }
    return avant
  }
`

/*
 * L'ALLER : la journee de travail. Dossier neuf, on ne triche sur rien, chaque
 * geste est celui d'un apprenti (un clic dans le plan, une case cochee, huit
 * reponses au quiz, un export).
 */
function scenarioAller (reponses) {
  return `(async () => {
    ${OUTILS}
    const REPONSES = ${JSON.stringify(reponses)}

    // Une seance du soir menee au bout : huit questions, la bonne reponse a
    // chacune (le pilote les a lues dans le JSON du quiz), et le releve final.
    //
    // La question se reconnait a son RANG, pas a son texte : le HTML replie les
    // espaces, or un enonce du quiz de J01 en aligne quatorze pour montrer le
    // remplissage d'une PIC X(20). L'enonce sert quand meme de garde-fou, une
    // fois les blancs replies des deux cotes.
    const replier = (t) => t.replace(/\\s+/g, ' ').trim()
    const rangAffiche = () => {
      const trouve = /QUESTION\\s+(\\d+)\\s*\\/\\s*(\\d+)/.exec(lire('.quiz-compteur'))
      return trouve ? Number(trouve[1]) - 1 : -1
    }

    const passerLaSeance = async () => {
      for (let n = 0; n < REPONSES.length; n += 1) {
        const rang = rangAffiche()
        const enonce = lire('.quiz-enonce')
        const attendue = REPONSES[rang]
        const choix = [...document.querySelectorAll('.quiz-reponse')]
        if (rang !== n || !attendue || choix.length !== 4) {
          return { echec: 'question ' + (n + 1) + ' introuvable (rang affiche ' + rang + ')', enonce }
        }
        if (replier(attendue.enonce) !== replier(enonce)) {
          return { echec: 'enonce inattendu a la question ' + (n + 1), enonce }
        }
        choix[attendue.bonne].click()
        await attendre(${RENDU})
        const suite = document.querySelector('.quiz-suite .bouton-primaire')
        if (!suite) return { echec: 'pas de bouton de suite a la question ' + (n + 1) }
        suite.click()
        await attendre(${RENDU})
      }
      return {
        note: lire('.quiz-note'),
        tampon: lire('.quiz-tampon'),
        phrase: lire('.quiz-phrase'),
        xp: xp()
      }
    }

    // 1. Le plan de depart : rien n'est fait, J00 attend, J01 est fermee.
    const departXp = await dossierLu()
    await aller(1)
    const depart = { j00: etatSalle('J00'), j01: etatSalle('J01'), xp: departXp }

    // 2. On ouvre J00 et on coche sa feuille de route (BERTHA a dit OK).
    if (salle('J00')) salle('J00').click()
    await attendre(${RENDU})
    const sujet = { titre: lire('.lecteur-titre'), adresse: lire('.lecteur-entete .etiquette-mono') }
    const cases = [...document.querySelectorAll('.feuille-case-native')]
    for (const c of cases) { c.click(); await attendre(${RENDU}) }
    const feuille = {
      cases: cases.length,
      cochees: document.querySelectorAll('.feuille-ligne[data-coche="1"]').length,
      tampon: lire('.feuille-tampon'),
      total: lire('.feuille-total'),
      xp: xp()
    }

    // 3. La decoration tombe toute seule : PREMIERE COMPILE se deduit de l'etat.
    await aller(4)
    const livret = { premiereCompile: obtenue('PREMIERE COMPILE'), obtenues: decorations() }

    // 4. Le plan a bouge : J00 est validee, J01 s'est ouverte.
    await aller(1)
    const plan = { j00: etatSalle('J00'), j01: etatSalle('J01') }

    // 5. Le quiz du soir de J01, mene au bout : 8/8 et les 10 XP du soir.
    await aller(3)
    const avantSeance = { proposee: seance('J01'), ouverte: !((puce('J01') || {}).disabled) }
    const soir = await passerLaSeance()

    // 6. On repasse la meme seance : les tentatives sont libres, mais les
    //    10 XP ne se gagnent qu'une fois (cahier des charges, §5.4).
    const retenter = document.querySelector('.quiz-actions .bouton-secondaire')
    if (retenter) retenter.click()
    await attendre(${RENDU})
    const soirBis = await passerLaSeance()

    // 7. L'export par la boite « Enregistrer sous » (le fichier est impose).
    await aller(5)
    const fichiers = boutonsFichier()
    if (fichiers[0]) fichiers[0].click()
    await attendre(${FICHIER})
    const exportation = {
      releve: lire('.reglages-releve'),
      ton: ((document.querySelector('.reglages-releve') || {}).dataset || {}).ton || ''
    }

    return { depart, sujet, feuille, livret, plan, avantSeance, soir, soirBis, exportation }
  })()`
}

/*
 * LE RETOUR : l'application vient d'etre relancee sur le meme dossier. Rien
 * n'est joue ici, tout est relu. Puis on importe le fichier exporte a l'aller
 * pour verifier que l'aller-retour rend exactement le meme dossier.
 */
function scenarioRetour () {
  return `(async () => {
    ${OUTILS}

    // 1. Ce que la barre laterale annonce une fois le dossier relu du fichier.
    const reprise = { xp: await dossierLu(), echelon: lire('.profil-pied') }

    // 2. Le plan : J00 reste validee, J01 reste ouverte.
    await aller(1)
    const plan = { j00: etatSalle('J00'), j01: etatSalle('J01') }

    // 3. La decoration est toujours au mur.
    await aller(4)
    const livret = { premiereCompile: obtenue('PREMIERE COMPILE'), obtenues: decorations() }

    // 4. La seance de J01 est marquee reussie, ses XP sont deja au dossier.
    await aller(3)
    const soir = { position: seance('J01'), chapo: lire('.quiz-chapo') }

    // 5. L'import par la boite « Ouvrir » : le fichier exporte a l'aller.
    await aller(5)
    const fichiers = boutonsFichier()
    if (fichiers[1]) fichiers[1].click()
    await attendre(${FICHIER})
    const importation = {
      releve: lire('.reglages-releve'),
      ton: ((document.querySelector('.reglages-releve') || {}).dataset || {}).ton || '',
      xp: xp()
    }

    return { reprise, plan, livret, soir, importation }
  })()`
}

/*
 * LA SONDE (verification fonctionnelle hors §10) : les chemins que le parcours
 * ne prend pas, et surtout les chemins d'ECHEC. Un seul lancement, dossier
 * neuf, et la remise a zero en dernier puisqu'elle emporte tout.
 */
function scenarioSonde (reponses) {
  return `(async () => {
    ${OUTILS}
    const REPONSES = ${JSON.stringify(reponses)}
    const rangAffiche = () => {
      const trouve = /QUESTION\\s+(\\d+)\\s*\\/\\s*(\\d+)/.exec(lire('.quiz-compteur'))
      return trouve ? Number(trouve[1]) - 1 : -1
    }
    const cocherTout = async () => {
      const cases = [...document.querySelectorAll('.feuille-case-native')]
      for (const c of cases) { c.click(); await attendre(${RENDU}) }
      return cases.length
    }

    await dossierLu()

    // 1. Le deblocage sequentiel : J02 reste fermee tant que J01 n'est pas
    //    validee, et J01 tant que J00 ne l'est pas.
    await aller(1)
    const depart = { j00: etatSalle('J00'), j01: etatSalle('J01'), j02: etatSalle('J02') }
    if (salle('J00')) salle('J00').click()
    await attendre(${RENDU})
    await cocherTout()
    await aller(1)
    const apresJ00 = { j01: etatSalle('J01'), j02: etatSalle('J02'), xp: xp() }

    // 2. Le retrait : une case rendue reprend ses XP et referme la suite.
    if (salle('J00')) salle('J00').click()
    await attendre(${RENDU})
    await cocherTout()
    await aller(1)
    const apresRetrait = { j00: etatSalle('J00'), j01: etatSalle('J01'), xp: xp() }
    if (salle('J00')) salle('J00').click()
    await attendre(${RENDU})
    await cocherTout()
    await attendre(${RENDU})

    // 3. Le quiz RATE : huit mauvaises reponses, aucun XP.
    await aller(3)
    for (let n = 0; n < REPONSES.length; n += 1) {
      const rang = rangAffiche()
      const choix = [...document.querySelectorAll('.quiz-reponse')]
      if (rang < 0 || choix.length !== 4) break
      choix[(REPONSES[rang].bonne + 1) % 4].click()
      await attendre(${RENDU})
      const suite = document.querySelector('.quiz-suite .bouton-primaire')
      if (suite) suite.click()
      await attendre(${RENDU})
    }
    const quizRate = {
      note: lire('.quiz-note'),
      tampon: lire('.quiz-tampon'),
      phrase: lire('.quiz-phrase'),
      position: seance('J01'),
      xp: xp()
    }

    // 4. J01 cochee en entier (bonus compris) : 155 XP, echelon 1, J02 ouverte.
    await aller(1)
    if (salle('J01')) salle('J01').click()
    await attendre(${RENDU})
    const casesJ01 = await cocherTout()
    await aller(1)
    const apresJ01 = {
      cases: casesJ01,
      j01: etatSalle('J01'),
      j02: etatSalle('J02'),
      j03: etatSalle('J03'),
      xp: xp(),
      echelon: lire('.profil-pied'),
      role: lire('.profil-role')
    }

    // 4 bis. L'echelon 1 demande 150 XP ET J00 a J02 validees (le livret) :
    //        a 155 XP sans J02, on doit rester Candidat.
    if (salle('J02')) salle('J02').click()
    await attendre(${RENDU})
    await cocherTout()
    await aller(1)
    const apresJ02 = {
      j02: etatSalle('J02'),
      j03: etatSalle('J03'),
      xp: xp(),
      echelon: lire('.profil-pied'),
      role: lire('.profil-role')
    }

    // 5. Une decoration sur l'honneur : elle se coche et elle reste.
    await aller(4)
    const colonne = medaille('COLONNE 7')
    if (colonne) colonne.click()
    await attendre(${RENDU})
    const honneur = { obtenue: obtenue('COLONNE 7'), obtenues: decorations() }

    // 6. Le theme sombre, qui est un reglage : il doit survivre a la remise a
    //    zero (elle emporte le dossier, pas les reglages).
    const theme = document.querySelector('.bouton-theme')
    if (theme) theme.click()
    await attendre(600)
    const sombre = document.documentElement.dataset.sombre

    // 7. Un import de fichier invalide : refuse, et rien ne bouge.
    await aller(5)
    const fichiers = boutonsFichier()
    if (fichiers[1]) fichiers[1].click()
    await attendre(${FICHIER})
    const importRate = {
      releve: lire('.reglages-releve'),
      ton: ((document.querySelector('.reglages-releve') || {}).dataset || {}).ton || '',
      xp: xp()
    }

    // 8. La remise a zero menee AU BOUT : deux confirmations, tout part.
    const effacer = document.querySelector('.reglages-danger .bouton-danger')
    if (effacer) effacer.click()
    await attendre(${RENDU})
    const premiere = document.querySelector('.modale-boutons .bouton-danger')
    if (premiere) premiere.click()
    await attendre(${RENDU})
    const seconde = document.querySelector('.modale-boutons .bouton-danger')
    if (seconde) seconde.click()
    await attendre(${FICHIER})
    const efface = {
      xp: xp(),
      boites: document.querySelectorAll('.modale').length,
      releve: lire('.reglages-releve'),
      sombre: document.documentElement.dataset.sombre
    }
    await aller(1)
    const planEfface = { j00: etatSalle('J00'), j01: etatSalle('J01') }
    await aller(4)
    const livretEfface = { obtenues: decorations() }

    return {
      depart, apresJ00, apresRetrait, quizRate, apresJ01, apresJ02, honneur, sombre,
      importRate, efface, planEfface, livretEfface
    }
  })()`
}

function verdictSonde (r) {
  const depart = r.depart ?? {}
  const apresJ00 = r.apresJ00 ?? {}
  const apresRetrait = r.apresRetrait ?? {}
  const quizRate = r.quizRate ?? {}
  const apresJ01 = r.apresJ01 ?? {}
  const efface = r.efface ?? {}

  return {
    'J01 et J02 fermees au depart':
      depart.j00 === 'disponible' && depart.j01 === 'verrouillee' && depart.j02 === 'verrouillee',
    'J00 validee ouvre J01, pas J02':
      apresJ00.j01 === 'disponible' && apresJ00.j02 === 'verrouillee' && apresJ00.xp === '30 XP',
    // La salle qu'on vient de quitter reste « en cours » : c'est le sujet pose
    // sur le pupitre, meme sans un seul XP a son compte.
    'une case rendue reprend ses XP et referme J01':
      apresRetrait.j00 === 'en-cours' && apresRetrait.j01 === 'verrouillee' && apresRetrait.xp === '0 XP',
    'un quiz rate ne rapporte rien':
      quizRate.note === '0/8' && quizRate.tampon === '' &&
      (quizRate.phrase ?? '').includes('6 bonnes') && quizRate.xp === '30 XP',
    'la seance reste a repasser': quizRate.position === 'a-repasser',
    'J01 cochee en entier (bonus compris)': apresJ01.cases === 7 && apresJ01.xp === '155 XP',
    'J02 ouverte, J03 encore fermee':
      apresJ01.j01 === 'validee' && apresJ01.j02 === 'disponible' && apresJ01.j03 === 'verrouillee',
    // Le livret demande 150 XP ET J00 a J02 : les XP seuls ne suffisent pas.
    "155 XP sans J02 ne font pas l'echelon":
      (apresJ01.echelon ?? '').includes('Échelon 0') && apresJ01.role === 'Candidat',
    "J02 validee fait monter l'echelon":
      (r.apresJ02?.echelon ?? '').includes('Échelon 1') && r.apresJ02?.role === 'Stagiaire' &&
      r.apresJ02?.j02 === 'validee' && r.apresJ02?.j03 === 'disponible',
    "la decoration sur l'honneur se coche": r.honneur?.obtenue === true,
    'un import invalide est refuse':
      r.importRate?.ton === 'non' &&
      (r.importRate?.releve ?? '').includes('pas une progression') &&
      r.importRate?.xp === r.apresJ02?.xp,
    'la remise a zero emporte tout':
      efface.xp === '0 XP' && efface.boites === 0 &&
      r.planEfface?.j00 === 'disponible' && r.planEfface?.j01 === 'verrouillee' &&
      r.livretEfface?.obtenues === 0,
    'la remise a zero garde les reglages': efface.sombre === r.sombre && r.sombre === '1'
  }
}

// Le verdict de l'aller : chaque etape du §10 du cahier des charges.
function verdictAller (r) {
  const depart = r.depart ?? {}
  const feuille = r.feuille ?? {}
  const livret = r.livret ?? {}
  const plan = r.plan ?? {}
  const soir = r.soir ?? {}
  const soirBis = r.soirBis ?? {}
  const exportation = r.exportation ?? {}

  return {
    'dossier neuf': depart.j00 === 'disponible' && depart.j01 === 'verrouillee' && depart.xp === '0 XP',
    'sujet J00 ouvert': (r.sujet?.titre ?? '').length > 0 && (r.sujet?.adresse ?? '').includes('LA PISCINE'),
    'feuille cochee': feuille.cases === 1 && feuille.cochees === 1 && (feuille.tampon ?? '').includes('VALIDE'),
    'XP credites': feuille.xp === '30 XP',
    'decoration accordee': livret.premiereCompile === true && livret.obtenues >= 1,
    'J00 validee, J01 ouverte': plan.j00 === 'validee' && plan.j01 === 'disponible',
    'seance J01 ouverte': r.avantSeance?.ouverte === true && r.avantSeance?.proposee === 'a-passer',
    'quiz 8 sur 8': soir.note === '8/8' && (soir.tampon ?? '').includes('+10 XP'),
    'XP du soir': soir.xp === '40 XP',
    'XP du quiz uniques': soirBis.note === '8/8' && soirBis.tampon === 'VALIDE' && soirBis.xp === '40 XP',
    exporte: exportation.ton === 'oui' && (exportation.releve ?? '').length > 0
  }
}

// Le verdict du retour : la progression a survecu a la relance, et l'import
// rend le meme dossier que l'export.
function verdictRetour (r) {
  const reprise = r.reprise ?? {}
  const plan = r.plan ?? {}
  const livret = r.livret ?? {}
  const soir = r.soir ?? {}
  const importation = r.importation ?? {}

  return {
    'progression conservee': reprise.xp === '40 XP' && (reprise.echelon ?? '').includes('Échelon'),
    // J01 n'est plus seulement ouverte : les 10 XP du soir l'ont mise en cours.
    'plan conserve': plan.j00 === 'validee' && plan.j01 === 'en-cours',
    'decoration conservee': livret.premiereCompile === true,
    // Une seance « reussie » dans le sommaire, c'est exactement xpCredite.
    'quiz conserve': soir.position === 'reussie' && (soir.chapo ?? '').startsWith('J01'),
    importe: importation.ton === 'oui' && importation.xp === '40 XP'
  }
}

/*
 * Joue le scenario demande dans la fenetre, rend compte et quitte. La sortie
 * vaut 0 quand toutes les etapes passent, 1 des qu'une seule manque.
 */
function jouer (fenetre, app) {
  const phase = process.env.CQ_PARCOURS
  if (phase !== 'aller' && phase !== 'retour' && phase !== 'sonde') return

  fenetre.webContents.once('did-finish-load', async () => {
    let code = 1
    try {
      const scenarios = {
        aller: () => scenarioAller(reponsesAttendues()),
        retour: () => scenarioRetour(),
        sonde: () => scenarioSonde(reponsesAttendues())
      }
      const verdicts = { aller: verdictAller, retour: verdictRetour, sonde: verdictSonde }
      const rapport = await fenetre.webContents.executeJavaScript(scenarios[phase]())
      const etapes = verdicts[phase](rapport)
      const manquantes = Object.keys(etapes).filter((cle) => !etapes[cle])
      code = manquantes.length === 0 ? 0 : 1

      console.log(
        `parcours ${phase} : ${Object.keys(etapes).length - manquantes.length} etapes sur ` +
          `${Object.keys(etapes).length}` +
          (manquantes.length === 0 ? ' (toutes)' : ` (manque : ${manquantes.join(', ')})`)
      )
      if (code !== 0) console.error('parcours : rapport', JSON.stringify(rapport, null, 2))

      // Le tampon d'ecriture est amorti a 500 ms : on emprunte le chemin de la
      // vraie fermeture pour que rien ne se perde entre les deux lancements.
      await new Promise((suite) => {
        const relance = setTimeout(suite, 1500)
        ipcMain.once('app:tampon-vide', () => { clearTimeout(relance); suite() })
        fenetre.webContents.send('app:avant-fermeture')
      })
    } catch (erreur) {
      console.error('parcours : echec', erreur)
    }
    app.exit(code)
  })
}

module.exports = { jouer }
