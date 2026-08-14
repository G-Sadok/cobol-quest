#!/usr/bin/env node
/*
 * LE PILOTE DU PARCOURS DE CONTROLE (T21, cahier des charges §10).
 *
 * Le controle final demande un parcours mene de bout en bout, RELANCE DE
 * L'APPLICATION COMPRISE : c'est la seule facon de prouver que la progression
 * vit dans un vrai fichier et non dans la memoire d'une page. Ce script
 * orchestre donc deux lancements successifs de l'application sur un MEME
 * dossier utilisateur temporaire :
 *
 *   1. l'aller  : dossier neuf, on coche J00, les XP tombent, J01 s'ouvre, on
 *                 passe le quiz de J01, une decoration s'accroche, on exporte,
 *                 on quitte proprement (le tampon d'ecriture est vide au quit)
 *   2. le retour: meme dossier, application relancee de zero, on relit tout ce
 *                 qui a survecu, puis on importe le fichier de l'aller
 *
 * Entre les deux, et a la fin, le pilote lit le fichier de progression avec ses
 * propres yeux (Node, pas l'application) et le compare a l'export.
 *
 * Le dossier de l'apprenti n'est jamais touche : CQ_USER_DATA detourne le
 * dossier utilisateur vers un dossier temporaire, efface a la fin.
 *
 * Usage : npm run parcours
 *         npm run parcours -- "release/mac-arm64/COBOL Quest.app"
 *
 * Sans argument, c'est l'application de developpement (le bundle compile, lance
 * par Electron) ; avec un chemin de .app, c'est l'application EMPAQUETEE qui
 * joue le parcours, celle que l'apprenti installera vraiment.
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ICI = path.dirname(fileURLToPath(import.meta.url))
const RACINE = path.join(ICI, '..')
const ELECTRON = require('electron')

const controles = []
function controler (intitule, tenu, detail = '') {
  controles.push({ intitule, tenu, detail })
  console.log(`${tenu ? '  ok  ' : ' RATE '} ${intitule}${detail ? ` : ${detail}` : ''}`)
}

function memeJson (a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

async function lireJson (chemin) {
  try {
    return JSON.parse(await fs.readFile(chemin, 'utf8'))
  } catch {
    return null
  }
}

/*
 * Ce qu'il faut lancer : l'application empaquetee quand on en donne le chemin
 * (le binaire vit dans Contents/MacOS), Electron sur les sources sinon.
 */
function aLancer (demande) {
  if (!demande) return { binaire: ELECTRON, arguments: ['.'] }
  const app = path.resolve(process.cwd(), demande)
  const nom = path.basename(app, '.app')
  return { binaire: path.join(app, 'Contents', 'MacOS', nom), arguments: [] }
}

// La sonde (--sonde) prend les chemins que le parcours ne prend pas, et
// surtout les chemins d'ECHEC : deblocage sequentiel, XP repris quand une case
// se rend, quiz rate, echelon qui demande plus que des XP, import invalide,
// remise a zero menee au bout. Un seul lancement, tout est verifie a l'ecran.
const arguments_ = process.argv.slice(2)
const enSonde = arguments_.includes('--sonde')
const cheminApp = arguments_.find((a) => a !== '--sonde')
const cible = aLancer(cheminApp)

function jouer (phase, environnement) {
  return new Promise((resolve) => {
    const fils = spawn(cible.binaire, cible.arguments, {
      cwd: RACINE,
      env: { ...process.env, CQ_PARCOURS: phase, ...environnement },
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let sortie = ''
    fils.stdout.on('data', (m) => { sortie += m })
    fils.stderr.on('data', (m) => { sortie += m })
    fils.on('close', (code) => resolve({ code, sortie: sortie.trim() }))
  })
}

// Les lignes du parcours, pas le bruit d'Electron autour.
function extraire (sortie) {
  return sortie
    .split('\n')
    .filter((l) => l.startsWith('parcours ') || l.startsWith('parcours :'))
    .join('\n')
}

const dossier = await fs.mkdtemp(path.join(os.tmpdir(), 'cobol-quest-parcours-'))
const fichierExport = path.join(dossier, 'export-de-l-aller.json')
const fichierProgression = path.join(dossier, 'progression.json')

// Les bonnes reponses du quiz de J01, lues dans le JSON redige en T14 : le
// parcours repond juste huit fois, comme un apprenti qui a lu son memo.
const quiz = await lireJson(path.join(RACINE, 'src', 'data', 'quiz', 'J01.json'))
const reponses = (quiz?.questions ?? []).map((q) => ({ enonce: q.enonce, bonne: q.bonne }))

const environnement = {
  CQ_USER_DATA: dossier,
  CQ_PARCOURS_FICHIER: fichierExport,
  CQ_PARCOURS_REPONSES: JSON.stringify(reponses)
}

console.log(enSonde ? 'SONDE FONCTIONNELLE' : 'PARCOURS DE CONTROLE (T21)')
console.log(`Application : ${cheminApp ? cible.binaire : 'les sources, lancees par Electron'}`)
console.log(`Dossier utilisateur temporaire : ${dossier}`)
console.log(`Quiz de J01 : ${reponses.length} questions lues dans le fichier redige.`)

// ---- La sonde : un seul lancement, les chemins d'echec ---------------------
if (enSonde) {
  // Le fichier que la boite « Ouvrir » rendra : volontairement invalide, pour
  // que l'import soit refuse au lieu d'ecraser le dossier.
  await fs.writeFile(
    fichierExport,
    JSON.stringify({ bonjour: 'je ne suis pas une progression' }, null, 2)
  )

  const sonde = await jouer('sonde', environnement)
  console.log(`\n${extraire(sonde.sortie) || sonde.sortie}`)
  controler('la sonde va au bout', sonde.code === 0, `sortie ${sonde.code}`)
  if (sonde.code !== 0) console.error(sonde.sortie)

  // Apres la remise a zero : le dossier est vide, les reglages sont restes.
  const restant = await lireJson(fichierProgression)
  controler(
    'la remise a zero laisse un dossier vide',
    memeJson(restant?.epreuves, {}) && memeJson(restant?.badges, {})
  )
  controler(
    'la remise a zero garde les reglages',
    restant?.reglages?.sombre === true,
    JSON.stringify(restant?.reglages ?? {})
  )

  await fs.rm(dossier, { recursive: true, force: true })
  const echecs = controles.filter((c) => !c.tenu)
  console.log(
    `\nVerdict : ${controles.length - echecs.length} controles sur ${controles.length}` +
      (echecs.length === 0 ? ' (tous).' : ` (rates : ${echecs.map((c) => c.intitule).join(', ')}).`)
  )
  process.exit(echecs.length === 0 ? 0 : 1)
}

// ---- 1. L'aller ------------------------------------------------------------
console.log('\n1. Premier lancement : la journee de travail.')
const aller = await jouer('aller', environnement)
console.log(extraire(aller.sortie) || aller.sortie)
controler('le premier lancement va au bout', aller.code === 0, `sortie ${aller.code}`)
if (aller.code !== 0) console.error(aller.sortie)

const apresAller = await lireJson(fichierProgression)
const exporte = await lireJson(fichierExport)

controler('le fichier de progression est ecrit', apresAller !== null, fichierProgression)
controler(
  "l'exercice de J00 est dans le fichier",
  apresAller?.epreuves?.J00?.exercices?.ex00 === true
)
controler(
  'les 10 XP du quiz de J01 sont au dossier',
  apresAller?.epreuves?.J01?.quiz?.xpCredite === true,
  `meilleur score ${apresAller?.epreuves?.J01?.quiz?.meilleurScore ?? '?'} / 8, ` +
    `${apresAller?.epreuves?.J01?.quiz?.tentatives ?? '?'} tentatives`
)
controler("le fichier exporte est ecrit", exporte !== null, fichierExport)
controler("l'export est identique a la progression", memeJson(apresAller, exporte))

// ---- 2. Le retour ----------------------------------------------------------
console.log("\n2. Second lancement : l'application est relancee de zero.")
const retour = await jouer('retour', environnement)
console.log(extraire(retour.sortie) || retour.sortie)
controler('le second lancement va au bout', retour.code === 0, `sortie ${retour.code}`)
if (retour.code !== 0) console.error(retour.sortie)

const apresRetour = await lireJson(fichierProgression)
controler(
  'la progression a survecu a la relance et a l\'import',
  memeJson(apresAller, apresRetour)
)

// ---- Verdict ---------------------------------------------------------------
await fs.rm(dossier, { recursive: true, force: true })

const rates = controles.filter((c) => !c.tenu)
console.log(
  `\nVerdict : ${controles.length - rates.length} controles sur ${controles.length}` +
    (rates.length === 0 ? ' (tous).' : ` (rates : ${rates.map((c) => c.intitule).join(', ')}).`)
)
process.exit(rates.length === 0 ? 0 : 1)
