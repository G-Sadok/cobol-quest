/*
 * Processus principal de COBOL QUEST.
 * Responsabilites : la fenetre (coque macOS du design), le menu francais et les
 * quatre handlers IPC de progression. Aucune logique de jeu ici : le processus
 * principal ne fait que servir l'interface et lire/ecrire le fichier reel.
 */

const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron')
const fs = require('node:fs/promises')
const path = require('node:path')

// L'URL de dev est injectee par le script `dev:app`. Sans elle, on charge le
// bundle compile : identique en dev electron et dans le .app empaquete.
const URL_DEV = process.env.CQ_URL_DEV || ''
const FICHIER_INDEX = path.join(__dirname, '..', 'dist', 'index.html')
const NOM_PROGRESSION = 'progression.json'

// Delai maximal laisse au rendu pour ecrire sa progression avant la fermeture.
const DELAI_VIDAGE = 1200

let fenetre = null
let fermetureAutorisee = false

function cheminProgression () {
  return path.join(app.getPath('userData'), NOM_PROGRESSION)
}

/*
 * Controle structurel minimal d'une progression importee : on refuse tout ce
 * qui n'a manifestement pas ete produit par l'app. Le store (T07) affine
 * ensuite a la lecture, valeurs manquantes comprises.
 */
function estObjet (valeur) {
  return typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)
}

function progressionValide (donnees) {
  if (!estObjet(donnees)) return false
  if (typeof donnees.version !== 'number') return false
  if (!estObjet(donnees.epreuves)) return false
  if ('quiz' in donnees && !estObjet(donnees.quiz)) return false
  if ('badges' in donnees && !estObjet(donnees.badges) && !Array.isArray(donnees.badges)) return false
  return true
}

// Ecriture atomique : un fichier temporaire puis un renommage, pour ne jamais
// laisser une progression tronquee si la machine s'arrete en plein ecrit.
async function ecrireJson (chemin, donnees) {
  const temporaire = `${chemin}.tmp`
  await fs.writeFile(temporaire, `${JSON.stringify(donnees, null, 2)}\n`, 'utf8')
  await fs.rename(temporaire, chemin)
}

async function lireJson (chemin) {
  const brut = await fs.readFile(chemin, 'utf8')
  return JSON.parse(brut)
}

function creerFenetre () {
  fenetre = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    resizable: true,
    show: false,
    backgroundColor: '#EFE9DC',
    title: 'COBOL Quest',
    // Feux systeme poses dans la barre de 52px en haut de la barre laterale.
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 20 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  })

  fenetre.once('ready-to-show', () => fenetre.show())
  fenetre.on('closed', () => { fenetre = null })

  // Application hors-ligne : rien ne navigue, rien ne s'ouvre ailleurs.
  fenetre.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  fenetre.webContents.on('will-navigate', (evenement, url) => {
    const attendue = URL_DEV || `file://${FICHIER_INDEX}`
    if (!url.startsWith(attendue)) evenement.preventDefault()
  })

  if (URL_DEV) fenetre.loadURL(URL_DEV)
  else fenetre.loadFile(FICHIER_INDEX)

  // Verification automatisee du demarrage : `CQ_AUTOTEST=1 electron .` charge
  // l'interface, controle le pont et l'aller-retour IPC, puis rend la main (le
  // protocole interdit tout processus qui reste ouvert). Sortie 0 si tout va.
  if (process.env.CQ_AUTOTEST === '1') {
    fenetre.webContents.once('did-finish-load', async () => {
      fermetureAutorisee = true
      let verdict = 1
      try {
        const rapport = await fenetre.webContents.executeJavaScript(
          'window.cgba && window.cgba.present ? window.cgba.charger() : null'
        )
        verdict = rapport && rapport.ok === true ? 0 : 1
        console.log(`autotest : pont ${verdict === 0 ? 'actif' : 'absent'}`, rapport)
      } catch (erreur) {
        console.error('autotest : echec', erreur)
      }
      app.exit(verdict)
    })
  }
}

function poserMenu () {
  const enDeveloppement = !app.isPackaged
  const modele = [
    {
      label: 'COBOL Quest',
      submenu: [
        { role: 'about', label: 'A propos de COBOL Quest' },
        { type: 'separator' },
        { role: 'hide', label: 'Masquer COBOL Quest' },
        { role: 'hideOthers', label: 'Masquer les autres' },
        { role: 'unhide', label: 'Tout afficher' },
        { type: 'separator' },
        { role: 'quit', label: 'Quitter COBOL Quest' }
      ]
    },
    {
      label: 'Edition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Retablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'selectAll', label: 'Tout selectionner' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Recharger' },
        { role: 'resetZoom', label: 'Taille reelle' },
        { role: 'zoomIn', label: 'Agrandir' },
        { role: 'zoomOut', label: 'Reduire' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein ecran' },
        ...(enDeveloppement
          ? [{ type: 'separator' }, { role: 'toggleDevTools', label: 'Outils de developpement' }]
          : [])
      ]
    },
    {
      label: 'Fenetre',
      submenu: [
        { role: 'minimize', label: 'Placer dans le Dock' },
        { role: 'zoom', label: 'Agrandir la fenetre' },
        { type: 'separator' },
        { role: 'close', label: 'Fermer la fenetre' }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(modele))
}

function brancherIpc () {
  ipcMain.handle('progression:charger', async () => {
    try {
      const progression = await lireJson(cheminProgression())
      return { ok: true, progression }
    } catch (erreur) {
      // Premiere ouverture : pas de fichier, ce n'est pas une erreur.
      if (erreur.code === 'ENOENT') return { ok: true, progression: null }
      return { ok: false, erreur: `Progression illisible : ${erreur.message}` }
    }
  })

  ipcMain.handle('progression:sauver', async (_evenement, progression) => {
    if (!estObjet(progression)) return { ok: false, erreur: 'Progression invalide.' }
    try {
      await ecrireJson(cheminProgression(), progression)
      return { ok: true, chemin: cheminProgression() }
    } catch (erreur) {
      return { ok: false, erreur: `Ecriture impossible : ${erreur.message}` }
    }
  })

  ipcMain.handle('progression:exporter', async (_evenement, progression) => {
    if (!estObjet(progression)) return { ok: false, erreur: 'Progression invalide.' }
    const { canceled, filePath } = await dialog.showSaveDialog(fenetre, {
      title: 'Exporter la progression',
      defaultPath: 'cobol-quest-progression.json',
      filters: [{ name: 'Progression COBOL Quest', extensions: ['json'] }],
      buttonLabel: 'Exporter'
    })
    if (canceled || !filePath) return { ok: false, annule: true }
    try {
      await ecrireJson(filePath, progression)
      return { ok: true, chemin: filePath }
    } catch (erreur) {
      return { ok: false, erreur: `Export impossible : ${erreur.message}` }
    }
  })

  ipcMain.handle('progression:importer', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(fenetre, {
      title: 'Importer une progression',
      filters: [{ name: 'Progression COBOL Quest', extensions: ['json'] }],
      properties: ['openFile'],
      buttonLabel: 'Importer'
    })
    if (canceled || filePaths.length === 0) return { ok: false, annule: true }
    try {
      const progression = await lireJson(filePaths[0])
      if (!progressionValide(progression)) {
        return { ok: false, erreur: 'Ce fichier n\'est pas une progression COBOL Quest.' }
      }
      await ecrireJson(cheminProgression(), progression)
      return { ok: true, progression, chemin: filePaths[0] }
    } catch (erreur) {
      return { ok: false, erreur: `Import impossible : ${erreur.message}` }
    }
  })
}

app.whenReady().then(() => {
  brancherIpc()
  poserMenu()
  creerFenetre()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) creerFenetre()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Sauvegarde au quit : on laisse au rendu le temps de vider son tampon de
// debounce avant de fermer pour de bon.
app.on('before-quit', (evenement) => {
  if (fermetureAutorisee || !fenetre || fenetre.isDestroyed()) return
  evenement.preventDefault()
  fermetureAutorisee = true
  const relance = setTimeout(() => app.quit(), DELAI_VIDAGE)
  ipcMain.once('app:tampon-vide', () => {
    clearTimeout(relance)
    app.quit()
  })
  fenetre.webContents.send('app:avant-fermeture')
})
