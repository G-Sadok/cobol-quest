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

// Le parcours de controle (T21, voir electron/parcours.cjs) joue une vraie
// journee, donc il ECRIT. Deux garde-fous, actifs seulement quand le pilote
// pose ces variables : le dossier utilisateur est detourne vers un dossier
// temporaire (jamais celui de l'apprenti), et les deux boites natives rendent
// le fichier impose au lieu d'attendre un clic que personne ne donnera.
const DOSSIER_IMPOSE = process.env.CQ_USER_DATA || ''
const FICHIER_IMPOSE = process.env.CQ_PARCOURS_FICHIER || ''
if (DOSSIER_IMPOSE) app.setPath('userData', DOSSIER_IMPOSE)

// Delai maximal laisse au rendu pour ecrire sa progression avant la fermeture.
const DELAI_VIDAGE = 1200

// Les tailles de fenetre sondees par l'autotest (T20) : le plancher impose par
// le cahier des charges, puis deux formats plus larges. Rien en dessous : la
// fenetre ne se redimensionne pas sous 1280x800.
const TAILLES_SONDEES = [
  [1280, 800],
  [1440, 900],
  [1680, 1050]
]

/*
 * Sonde de mise en page : elle repasse les six ecrans et releve, pour chacun,
 * ce qui deborde horizontalement. Deux mesures complementaires :
 *   defile  la zone de contenu ne doit RIEN avoir a faire defiler en largeur
 *           (elle est en overflow-x: hidden, donc un debordement se coupe)
 *   serres  les elements dont le contenu deborde leur propre boite alors
 *           qu'ils n'ont aucun defilement pour l'absorber (un bloc de code ou
 *           un cadre de tableau, eux, ont le droit : ils defilent seuls)
 */
const SONDE_LARGEURS = `(async () => {
  const attendre = (ms) => new Promise((suite) => setTimeout(suite, ms))
  const zone = () => document.querySelector('.coque-defile')
  const nom = (n) => String(n.className || n.tagName)
  // Une etiquette posee PAR-DESSUS (le repere du seuil, un tampon, une
  // pastille d'etat) a le droit de mordre le bord : elle ne serre rien.
  const posePardessus = (n) => {
    const cadre = n.getBoundingClientRect()
    return [...n.children].some((enfant) => {
      if (getComputedStyle(enfant).position !== 'absolute') return false
      const r = enfant.getBoundingClientRect()
      return r.right > cadre.right - 1 || r.left < cadre.left + 1
    })
  }
  const serres = () => [...zone().querySelectorAll('*')].filter((n) => {
    const style = getComputedStyle(n)
    if (style.overflowX === 'auto' || style.overflowX === 'scroll') return false
    if (n.scrollWidth - n.clientWidth <= 1) return false
    return !posePardessus(n)
  }).map(nom)

  const items = [...document.querySelectorAll('.nav-item')]
  const releve = []
  for (let rang = 0; rang < items.length; rang += 1) {
    items[rang].click()
    await attendre(90)
    releve.push({
      ecran: (document.querySelector('.toolbar-titre') || {}).textContent || '',
      defile: zone().scrollWidth - zone().clientWidth,
      page: document.documentElement.scrollWidth - window.innerWidth,
      serres: [...new Set(serres())].slice(0, 6)
    })
  }
  return { largeur: window.innerWidth, ecrans: releve }
})()`

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

// Les deux boites natives de macOS, ou le fichier impose par le parcours de
// controle. Hors parcours, rien ne change : c'est le systeme qui demande.
async function ouRanger (options) {
  if (FICHIER_IMPOSE) return { canceled: false, filePath: FICHIER_IMPOSE }
  return dialog.showSaveDialog(fenetre, options)
}

async function quoiRelire (options) {
  if (FICHIER_IMPOSE) return { canceled: false, filePaths: [FICHIER_IMPOSE] }
  return dialog.showOpenDialog(fenetre, options)
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
  // l'interface, controle le pont, l'aller-retour IPC et le rendu de React,
  // puis rend la main (le protocole interdit tout processus qui reste ouvert).
  // Sortie 0 si tout va.
  if (process.env.CQ_AUTOTEST === '1') {
    fenetre.webContents.once('did-finish-load', async () => {
      fermetureAutorisee = true
      let verdict = 1
      try {
        // On controle la coque (T08) : les 6 items de navigation, le passage
        // d'un ecran a l'autre, la carte de profil, et la bascule de theme, qui
        // est un reglage donc doit descendre jusqu'au fichier (ecriture amortie
        // a 500 ms). Le second clic remet le theme comme il etait : l'autotest
        // ne laisse aucune trace dans la progression de l'utilisateur.
        // On y lit aussi le tableau de bord (T09) au passage, avant de quitter
        // l'ecran : rien n'y est clique, justement pour ne rien ecrire.
        const rapport = await fenetre.webContents.executeJavaScript(`(async () => {
          const attendre = (ms) => new Promise((suite) => setTimeout(suite, ms))
          const sombreDe = (r) => Boolean(r && r.progression && r.progression.reglages
            && r.progression.reglages.sombre)
          const titre = () => (document.querySelector('.toolbar-titre') || {}).textContent || ''
          const lire = (selecteur) => (document.querySelector(selecteur) || {}).innerText || ''
          const racine = document.documentElement
          const pont = Boolean(window.cgba && window.cgba.present)
          const avant = pont ? await window.cgba.charger() : null

          const items = [...document.querySelectorAll('.nav-item')]
          const titreDepart = titre()
          const tableau = {
            epreuve: lire('.moment-code'),
            reprendre: lire('.bouton-primaire'),
            commande: lire('.moment-console'),
            citation: lire('.citation'),
            releve: lire('.releve')
          }
          if (items[1]) items[1].click()
          await attendre(60)
          const titreCarte = titre()

          // La Carte se lit sans rien cliquer : ouvrir une salle ecrirait
          // l'epreuve retenue dans la progression de l'utilisateur.
          const tuiles = [...document.querySelectorAll('.salle')]
          const plan = {
            salles: tuiles.length,
            etats: [...new Set(tuiles.map((t) => t.dataset.etat))].sort(),
            ouvrables: tuiles.filter((t) => !t.disabled).length,
            legende: document.querySelectorAll('.carte-legende .puce-etat').length,
            machine: lire('.salle-machine')
          }

          // Le lecteur se lit aussi sans rien cliquer d'autre que l'item de
          // navigation : afficher un sujet ne touche pas a la progression.
          if (items[2]) items[2].click()
          await attendre(60)
          const sujet = {
            titreEcran: titre(),
            adresse: lire('.lecteur-entete .etiquette-mono'),
            titre: lire('.lecteur-titre'),
            reperes: lire('.lecteur-reperes'),
            paragraphes: document.querySelectorAll('.md .md-p').length,
            codes: document.querySelectorAll('.md .md-code').length,
            tableaux: document.querySelectorAll('.md .md-tableau').length,
            largeur: Math.round((document.querySelector('.lecteur-colonne') || {}).clientWidth || 0),
            bords: document.querySelectorAll('.lecteur-voisine').length,
            absent: document.querySelectorAll('.lecteur-absent').length
          }

          // La feuille de route, elle, se coche : c'est tout son objet. On
          // bascule la premiere case, on releve le toast et la jauge, puis on
          // la rebascule pour ne rien laisser dans la progression.
          const lignes = () => [...document.querySelectorAll('.feuille-ligne')]
          const cochees = () => lignes().filter((l) => l.dataset.coche === '1').length
          const jauge = () => (document.querySelector('.feuille-jauge-remplissage') || {}).style.width || ''
          const ton = () => ((document.querySelector('.toast') || {}).dataset || {}).ton || ''
          const premiere = () => document.querySelector('.feuille-case-native')

          const routeAvant = {
            lignes: lignes().length,
            bonus: document.querySelectorAll('.feuille-registre[data-bonus="1"] .feuille-ligne').length,
            cochees: cochees(),
            jauge: jauge(),
            repere: (document.querySelector('.feuille-jauge-repere') || {}).style.left || '',
            total: lire('.feuille-total'),
            bertha: lire('.feuille-bertha')
          }

          if (premiere()) premiere().click()
          await attendre(60)
          const routePendant = {
            cochees: cochees(),
            jauge: jauge(),
            total: lire('.feuille-total'),
            toast: lire('.toast'),
            ton: ton()
          }

          // Le quiz du soir se visite AVANT de rendre la case : sur un dossier
          // vierge, c'est elle qui valide la journee du pupitre et ouvre la
          // seance du soir suivante.
          //
          // On repond a la premiere question, on lit la correction, puis on
          // passe a la deuxieme. On s'arrete la : c'est la HUITIEME reponse qui
          // porte la note au dossier, et une tentative, elle, ne se reprend pas.
          // Si la seance reste verrouillee, l'autotest controle cet ecran-la.
          if (items[3]) items[3].click()
          await attendre(60)
          const puces = [...document.querySelectorAll('.quiz-puce')]
          const compteur = () => lire('.quiz-compteur')
          const enonce = () => lire('.quiz-enonce')
          const soirAvant = {
            titreEcran: titre(),
            puces: puces.length,
            ouvertes: puces.filter((p) => !p.disabled).length,
            verrou: lire('.quiz-verrou'),
            compteur: compteur(),
            enonce: enonce(),
            choix: document.querySelectorAll('.quiz-reponse').length,
            corrections: document.querySelectorAll('.quiz-correction').length,
            score: lire('.quiz-score')
          }

          const reponse = document.querySelector('.quiz-reponse')
          if (reponse) reponse.click()
          await attendre(60)
          const soirPendant = {
            correction: lire('.quiz-correction'),
            ton: ((document.querySelector('.quiz-correction') || {}).dataset || {}).ton || '',
            bonnes: document.querySelectorAll('.quiz-reponse[data-etat="bonne"]').length,
            bloquees: [...document.querySelectorAll('.quiz-reponse')].filter((r) => r.disabled).length,
            toast: lire('.toast'),
            tonToast: ton(),
            suite: lire('.quiz-suite .bouton-primaire')
          }

          const suite = document.querySelector('.quiz-suite .bouton-primaire')
          if (suite) suite.click()
          await attendre(60)
          const soirApres = {
            compteur: compteur(),
            enonce: enonce(),
            corrections: document.querySelectorAll('.quiz-correction').length
          }

          // Retour au pupitre : la case se rend, la progression de
          // l'utilisateur revient exactement comme elle etait.
          if (items[2]) items[2].click()
          await attendre(60)
          if (premiere()) premiere().click()
          await attendre(60)
          const routeApres = { cochees: cochees(), jauge: jauge(), ton: ton() }

          // Le livret : le mur des decorations et la grille des echelons. Une
          // decoration sur l'honneur se coche, leve son toast, puis se rend :
          // la progression de l'utilisateur revient a l'identique.
          if (items[4]) items[4].click()
          await attendre(60)
          const medailles = () => [...document.querySelectorAll('.decoration-tuile')]
          const obtenues = () => medailles().filter((m) => m.dataset.obtenue === '1').length
          const surLHonneur = () => document.querySelector('.decoration-tuile[data-honneur="1"]')
          const livretAvant = {
            titreEcran: titre(),
            tuiles: medailles().length,
            honneur: document.querySelectorAll('.decoration-tuile[data-honneur="1"]').length,
            obtenues: obtenues(),
            compte: lire('.livret-titre-bloc'),
            echelons: document.querySelectorAll('.echelon-ligne').length,
            actuel: document.querySelectorAll('.echelon-ligne[data-position="actuel"]').length
          }

          if (surLHonneur()) surLHonneur().click()
          await attendre(60)
          const livretPendant = { obtenues: obtenues(), toast: lire('.toast'), ton: ton() }

          if (surLHonneur()) surLHonneur().click()
          await attendre(60)
          const livretApres = { obtenues: obtenues(), ton: ton() }

          // Les reglages : trois blocs, deux boites natives et l'encart rouge.
          // Le rythme se change puis se remet comme il etait ; la remise a
          // zero s'ouvre, passe sa PREMIERE confirmation, et se referme par
          // « Echap » a la seconde. La progression de l'utilisateur ne risque
          // rien : c'est le dernier bouton, jamais atteint ici, qui efface.
          if (items[5]) items[5].click()
          await attendre(60)
          const rythmes = () => [...document.querySelectorAll('.rythme-ligne')]
          const rythmeTenu = () => {
            const ligne = rythmes().find((r) => r.getAttribute('aria-checked') === 'true')
            return ligne ? ligne.innerText : ''
          }
          const boite = () => document.querySelector('.modale')
          const titreBoite = () => lire('.modale-titre')
          const interrupteurs = [...document.querySelectorAll('.interrupteur')]
          const posteAvant = {
            titreEcran: titre(),
            rythmes: rythmes().length,
            tenu: rythmeTenu(),
            interrupteurs: interrupteurs.length,
            etatsInter: interrupteurs.map((i) => i.getAttribute('aria-checked')),
            fichiers: [...document.querySelectorAll('.reglages-progression .bouton-secondaire')]
              .map((b) => b.innerText),
            ouverts: [...document.querySelectorAll('.reglages-progression .bouton-secondaire')]
              .filter((b) => !b.disabled).length,
            releve: lire('.reglages-releve'),
            danger: lire('.reglages-danger .bouton-danger'),
            boites: document.querySelectorAll('.modale').length
          }

          const autre = rythmes().find((r) => r.getAttribute('aria-checked') !== 'true')
          if (autre) autre.click()
          await attendre(60)
          const postePendant = { tenu: rythmeTenu(), toast: lire('.toast'), ton: ton() }

          const depart = rythmes().find((r) => r.innerText === posteAvant.tenu)
          if (depart) depart.click()
          await attendre(60)
          const posteRendu = rythmeTenu()

          const effacer = document.querySelector('.reglages-danger .bouton-danger')
          if (effacer) effacer.click()
          await attendre(60)
          const boite1 = {
            ouverte: Boolean(boite()),
            titre: titreBoite(),
            corps: lire('.modale-corps'),
            confirmer: lire('.modale-boutons .bouton-danger')
          }

          const suivre = document.querySelector('.modale-boutons .bouton-danger')
          if (suivre) suivre.click()
          await attendre(60)
          const boite2 = { titre: titreBoite(), confirmer: lire('.modale-boutons .bouton-danger') }

          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
          await attendre(60)
          const boitesApres = document.querySelectorAll('.modale').length

          // Le guide : l'accordeon s'ouvre sur le chapitre du moment, un autre
          // chapitre se deplie a la place, et son geste change d'ecran. On ne
          // touche a AUCUN geste qui ouvre un sujet : celui-la retiendrait
          // l'epreuve, donc ecrirait dans la progression de l'utilisateur.
          if (items[6]) items[6].click()
          await attendre(60)
          const chapitres = () => [...document.querySelectorAll('.guide-chapitre')]
          const ouverts = () => chapitres().filter((c) => c.dataset.ouvert === '1')
          const guideAvant = {
            titreEcran: titre(),
            suite: lire('.guide-suite-texte'),
            gesteSuite: lire('.guide-suite .bouton-primaire'),
            chapitres: chapitres().length,
            ouverts: ouverts().length,
            etat: lire('.guide-etat'),
            points: document.querySelectorAll('.guide-points li').length
          }

          // Le dernier chapitre porte les raccourcis, et son geste ne fait que
          // changer d'ecran : c'est celui qu'on peut manipuler sans rien ecrire.
          const dernier = chapitres()[chapitres().length - 1]
          if (dernier) dernier.querySelector('.guide-tete').click()
          await attendre(60)
          const guidePendant = {
            ouverts: ouverts().length,
            dernierOuvert: dernier ? dernier.dataset.ouvert === '1' : false,
            raccourcis: document.querySelectorAll('.guide-raccourci').length,
            geste: lire('.guide-geste .bouton-secondaire')
          }

          const gesteGuide = document.querySelector('.guide-geste .bouton-secondaire')
          if (gesteGuide) gesteGuide.click()
          await attendre(60)
          const guideApres = { titreEcran: titre() }

          const theme = document.querySelector('.bouton-theme')
          const sombreDepart = racine.dataset.sombre
          if (theme) theme.click()
          await attendre(800)
          const sombreApres = racine.dataset.sombre
          const pendant = pont ? await window.cgba.charger() : null

          if (theme) theme.click()
          await attendre(800)
          const apres = pont ? await window.cgba.charger() : null

          return {
            pont,
            ipc: apres,
            nav: items.length,
            navigation: titreDepart === 'Le terminal' && titreCarte === 'La carte',
            theme: sombreDepart !== sombreApres,
            ecrit: sombreDe(avant) !== sombreDe(pendant) && sombreDe(avant) === sombreDe(apres),
            effets: racine.dataset.effets,
            profil: (document.querySelector('.profil') || {}).innerText || '',
            tableau,
            plan,
            sujet,
            route: { avant: routeAvant, pendant: routePendant, apres: routeApres },
            soir: { avant: soirAvant, pendant: soirPendant, apres: soirApres },
            livret: { avant: livretAvant, pendant: livretPendant, apres: livretApres },
            poste: {
              avant: posteAvant,
              pendant: postePendant,
              rendu: posteRendu,
              boite1,
              boite2,
              boitesApres
            },
            guide: { avant: guideAvant, pendant: guidePendant, apres: guideApres }
          }
        })()`)

        // La mise en page a trois largeurs (T20). La fenetre revient a son
        // format de depart : l'autotest ne laisse rien derriere lui.
        const largeurs = []
        for (const [large, haut] of TAILLES_SONDEES) {
          fenetre.setContentSize(large, haut)
          // Le redimensionnement n'est pas immediat : sans attendre que la
          // fenetre porte VRAIMENT la largeur demandee, on sonde deux fois le
          // meme format en croyant en avoir sonde deux.
          for (let essai = 0; essai < 20; essai += 1) {
            await new Promise((suite) => setTimeout(suite, 100))
            const mesure = await fenetre.webContents.executeJavaScript('window.innerWidth')
            if (mesure === large) break
          }
          const sonde = await fenetre.webContents.executeJavaScript(SONDE_LARGEURS)
          largeurs.push({ ...sonde, demande: large })
        }
        fenetre.setContentSize(TAILLES_SONDEES[0][0], TAILLES_SONDEES[0][1])

        const profil = typeof rapport.profil === 'string' ? rapport.profil : ''
        const tableau = rapport.tableau ?? {}
        // L'epreuve du moment depend de la progression de la machine : on
        // controle la forme du tableau de bord, pas un identifiant precis.
        const bord =
          /^[A-Z0-9]+$/.test(tableau.epreuve ?? '') &&
          ['Reprendre', 'Revoir'].includes(tableau.reprendre) &&
          tableau.commande.includes('$ ') &&
          tableau.citation.includes('MEMO DE MARCEL') &&
          tableau.releve.includes('RELEVE DE SERVICE')
        // Le plan porte les 19 epreuves du programme (11 journees, 2 rushs,
        // 6 missions), la legende ses 4 etats, et au moins une salle s'ouvre.
        const plan = rapport.plan ?? {}
        const etatsConnus = ['disponible', 'en-cours', 'validee', 'verrouillee']
        const carte =
          plan.salles === 19 &&
          plan.legende === 4 &&
          Array.isArray(plan.etats) &&
          plan.etats.length > 0 &&
          plan.etats.every((e) => etatsConnus.includes(e)) &&
          plan.ouvrables >= 1 &&
          (plan.machine ?? '').includes('PHASE 3 ·')
        // Le sujet du moment depend lui aussi de la progression de la machine :
        // on controle la forme (adresse, reperes, texte rendu, deux bords).
        const s = rapport.sujet ?? {}
        const lecteur =
          s.titreEcran === 'Le sujet' &&
          /^(LA PISCINE|LES MISSIONS|LA SALLE MACHINE) ·/.test(s.adresse ?? '') &&
          (s.titre ?? '').length > 0 &&
          (s.reperes ?? '').includes('exercice') &&
          s.absent === 0 &&
          s.paragraphes >= 1 &&
          s.bords >= 1 &&
          s.largeur > 0 &&
          s.largeur <= 760
        // La feuille de route se coche puis se decoche : la jauge bouge, le
        // toast annonce le verdict dans les deux sens, et la progression de
        // l'utilisateur se retrouve exactement comme avant.
        const r = rapport.route ?? {}
        const avant = r.avant ?? {}
        const pendant = r.pendant ?? {}
        const apresRoute = r.apres ?? {}
        const feuille =
          avant.lignes >= 1 &&
          avant.total.includes('Total du jour') &&
          avant.bertha.includes('BERTHA') &&
          avant.repere.endsWith('%') &&
          pendant.cochees !== avant.cochees &&
          pendant.jauge !== avant.jauge &&
          ['oui', 'non'].includes(pendant.ton) &&
          pendant.toast.startsWith('BERTHA DIT') &&
          apresRoute.ton !== pendant.ton &&
          apresRoute.cochees === avant.cochees &&
          apresRoute.jauge === avant.jauge
        // Le quiz du soir porte les onze seances redigees. Quand la seance du
        // moment est ouverte, une reponse revele la correction, fige les
        // quatre choix et fait avancer d'une question ; quand elle ne l'est
        // pas encore, l'ecran dit ce qui l'ouvrira.
        const soirAvant = rapport.soir?.avant ?? {}
        const soirPendant = rapport.soir?.pendant ?? {}
        const soirApres = rapport.soir?.apres ?? {}
        const seanceOuverte = soirAvant.choix === 4
        const soir =
          soirAvant.titreEcran === 'Le quiz du soir' &&
          soirAvant.puces === 11 &&
          (seanceOuverte
            ? soirAvant.compteur === 'QUESTION 1 / 8' &&
              (soirAvant.enonce ?? '').length > 0 &&
              soirAvant.corrections === 0 &&
              (soirAvant.score ?? '').startsWith('Score ') &&
              (soirPendant.correction ?? '').startsWith('BERTHA DIT') &&
              ['oui', 'non'].includes(soirPendant.ton) &&
              soirPendant.bonnes === 1 &&
              soirPendant.bloquees === 4 &&
              (soirPendant.toast ?? '').startsWith('BERTHA DIT') &&
              soirPendant.suite === 'Question suivante' &&
              soirApres.compteur === 'QUESTION 2 / 8' &&
              soirApres.enonce !== soirAvant.enonce &&
              soirApres.corrections === 0
            : soirAvant.ouvertes === 0 &&
              soirAvant.verrou.includes('SEANCE VERROUILLEE') &&
              soirAvant.corrections === 0)
        // Le livret porte les 26 decorations du catalogue, dont les 5 qui se
        // cochent sur l'honneur, et les 9 echelons dont un seul est tenu.
        const l = rapport.livret ?? {}
        const livretAvant = l.avant ?? {}
        const livretPendant = l.pendant ?? {}
        const livretApres = l.apres ?? {}
        const dossier =
          livretAvant.titreEcran === 'Le livret' &&
          livretAvant.tuiles === 26 &&
          livretAvant.honneur === 5 &&
          (livretAvant.compte ?? '').includes('DECORATIONS · ') &&
          livretAvant.echelons === 9 &&
          livretAvant.actuel === 1 &&
          livretPendant.obtenues === livretAvant.obtenues + 1 &&
          livretPendant.ton === 'oui' &&
          (livretPendant.toast ?? '').includes("SUR L'HONNEUR") &&
          livretApres.obtenues === livretAvant.obtenues &&
          livretApres.ton === 'non'
        // Les reglages portent les trois rythmes, les deux interrupteurs, les
        // deux boites natives et l'encart rouge. Le rythme change puis revient,
        // et la remise a zero demande bien DEUX confirmations avant d'effacer.
        const p = rapport.poste ?? {}
        const posteAvant = p.avant ?? {}
        const postePendant = p.pendant ?? {}
        const boite1 = p.boite1 ?? {}
        const boite2 = p.boite2 ?? {}
        const poste =
          posteAvant.titreEcran === 'Réglages' &&
          posteAvant.rythmes === 3 &&
          posteAvant.interrupteurs === 2 &&
          posteAvant.etatsInter.every((e) => ['true', 'false'].includes(e)) &&
          posteAvant.fichiers.length === 2 &&
          posteAvant.ouverts === (rapport.pont ? 2 : 0) &&
          (posteAvant.releve ?? '').length > 0 &&
          (posteAvant.danger ?? '').startsWith('Tout effacer') &&
          posteAvant.boites === 0 &&
          postePendant.tenu !== posteAvant.tenu &&
          (postePendant.toast ?? '').startsWith('RYTHME') &&
          p.rendu === posteAvant.tenu &&
          boite1.ouverte === true &&
          boite1.titre.startsWith('Effacer toute la progression') &&
          (boite1.corps ?? '').length > 0 &&
          boite2.titre !== boite1.titre &&
          boite2.confirmer === 'Effacer définitivement' &&
          p.boitesApres === 0
        // Le guide : six chapitres, un seul ouvert a la fois, une ligne d'etat
        // qui parle du dossier, les raccourcis tires du registre des ecrans, et
        // un geste qui emmene la ou il annonce.
        const gu = rapport.guide ?? {}
        const guideAvant = gu.avant ?? {}
        const guidePendant = gu.pendant ?? {}
        const guide =
          guideAvant.titreEcran === 'Le guide' &&
          guideAvant.chapitres === 6 &&
          guideAvant.ouverts === 1 &&
          (guideAvant.suite ?? '').length > 0 &&
          (guideAvant.gesteSuite ?? '').length > 0 &&
          (guideAvant.etat ?? '').length > 0 &&
          guideAvant.points >= 3 &&
          guidePendant.ouverts === 1 &&
          guidePendant.dernierOuvert === true &&
          guidePendant.raccourcis === 7 &&
          (guidePendant.geste ?? '').length > 0 &&
          gu.apres?.titreEcran === 'Le terminal'
        // La mise en page tient a partir de 1280 : les sept ecrans passent aux
        // trois largeurs sans rien couper ni rien serrer.
        const mesure = (m) =>
          m.ecrans.length === 7 &&
          m.ecrans.every((e) => e.defile <= 1 && e.page <= 1 && e.serres.length === 0)
        const responsive = largeurs.length === TAILLES_SONDEES.length && largeurs.every(mesure)
        verdict =
          rapport.pont &&
          rapport.ipc?.ok === true &&
          rapport.nav === 7 &&
          rapport.navigation &&
          rapport.theme &&
          rapport.ecrit &&
          rapport.effets === '1' &&
          profil.includes('Échelon') &&
          bord &&
          carte &&
          lecteur &&
          feuille &&
          soir &&
          dossier &&
          poste &&
          guide &&
          responsive
            ? 0
            : 1
        console.log(
          `autotest : pont ${rapport.pont ? 'actif' : 'absent'}, ${rapport.nav} ecrans, ` +
            `navigation ${rapport.navigation ? 'ok' : 'ko'}, ` +
            `tableau de bord ${bord ? 'complet' : 'incomplet'}, ` +
            `plan ${carte ? plan.salles + ' salles' : 'incomplet'}, ` +
            `sujet ${lecteur ? s.paragraphes + ' paragraphes, ' + s.codes + ' blocs de code, ' + s.tableaux + ' tableaux' : 'incomplet'}, ` +
            `feuille de route ${feuille ? avant.lignes + ' case' + (avant.lignes > 1 ? 's' : '') + ' dont ' + avant.bonus + ' bonus, cochee puis rendue' : 'incomplete'}, ` +
            `quiz ${soir ? soirAvant.puces + ' seances, ' + (seanceOuverte ? 'question corrigee puis suivante' : 'seance encore verrouillee') : 'incomplet'}, ` +
            `livret ${dossier ? livretAvant.tuiles + ' medailles dont ' + livretAvant.obtenues + ' obtenues, ' + livretAvant.echelons + ' echelons, decoration accordee puis rendue' : 'incomplet'}, ` +
            `reglages ${poste ? posteAvant.rythmes + ' rythmes, ' + posteAvant.interrupteurs + ' interrupteurs, effacement a deux confirmations' : 'incomplets'}, ` +
            `guide ${guide ? guideAvant.chapitres + ' chapitres dont un ouvert, ' + guidePendant.raccourcis + ' raccourcis, geste suivi' : 'incomplet'}, ` +
            `mise en page ${
              responsive
                ? largeurs.map((m) => m.largeur).join('/') +
                  ' px sans debordement' +
                  // Une fenetre ne depasse pas l'ecran qui la porte : quand la
                  // machine est trop etroite, on le DIT plutot que de laisser
                  // croire qu'on a sonde une largeur qu'on n'a pas atteinte.
                  (largeurs.some((m) => m.largeur !== m.demande)
                    ? ` (${largeurs
                        .filter((m) => m.largeur !== m.demande)
                        .map((m) => m.demande)
                        .join('/')} px non atteints, ecran trop etroit)`
                    : '')
                : 'a revoir'
            }, ` +
            `theme ${rapport.theme ? 'bascule' : 'fige'}, ` +
            `reglage ${rapport.ecrit ? 'ecrit et repris' : 'inchange'}`
        )
        if (verdict !== 0) console.error('autotest : rapport', rapport)
        if (!responsive) console.error('autotest : largeurs', JSON.stringify(largeurs, null, 2))
      } catch (erreur) {
        console.error('autotest : echec', erreur)
      }
      app.exit(verdict)
    })
  }

  // Le parcours de controle (T21) : contrairement a l'autotest, il joue une
  // vraie journee et laisse tout ce qu'il ecrit derriere lui. Il vit dans son
  // propre module pour ne pas alourdir ce fichier, et ne se charge que quand
  // le pilote le demande.
  if (process.env.CQ_PARCOURS) {
    fermetureAutorisee = true
    require('./parcours.cjs').jouer(fenetre, app)
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
    const { canceled, filePath } = await ouRanger({
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
    const { canceled, filePaths } = await quoiRelire({
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
