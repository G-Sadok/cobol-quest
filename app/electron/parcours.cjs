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
  if (phase !== 'aller' && phase !== 'retour') return

  fenetre.webContents.once('did-finish-load', async () => {
    let code = 1
    try {
      const script = phase === 'aller' ? scenarioAller(reponsesAttendues()) : scenarioRetour()
      const rapport = await fenetre.webContents.executeJavaScript(script)
      const etapes = phase === 'aller' ? verdictAller(rapport) : verdictRetour(rapport)
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
