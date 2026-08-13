// Recopie le corpus pedagogique (lecture seule) vers app/src/corpus/.
//
// Pourquoi : fetch() d'un fichier file:// echoue dans une app Electron empaquetee.
// Les sujets sont donc embarques A LA COMPILATION par src/data/corpus.js
// (import.meta.glob). Ce script est branche en predev/prebuild : la copie est
// toujours fraiche, et src/corpus/ reste ignore par git.
//
// Lancement : node scripts/sync-corpus.mjs (depuis app/).

import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const racineApp = resolve(ici, '..')
const racineProjet = resolve(racineApp, '..')
const destination = join(racineApp, 'src', 'corpus')

// Le perimetre sacre, tel que fixe par le cahier des charges (section 1).
const DOSSIERS = ['piscine', 'missions', 'phase3', 'progression', 'bertha']
const FICHIERS = ['00_PLAN_MAITRE.md', '01_NORME_CGBA.md', '02_J00_INSTALLATION.md']

async function existe(chemin) {
  try {
    await stat(chemin)
    return true
  } catch {
    return false
  }
}

// Liste recursive des .md d'un dossier, en chemins relatifs a lui.
async function listerMarkdown(racine, prefixe = '') {
  const entrees = await readdir(join(racine, prefixe), { withFileTypes: true })
  const trouves = []
  for (const entree of entrees) {
    const relatif = prefixe ? join(prefixe, entree.name) : entree.name
    if (entree.isDirectory()) {
      trouves.push(...(await listerMarkdown(racine, relatif)))
    } else if (entree.name.endsWith('.md')) {
      trouves.push(relatif)
    }
  }
  return trouves
}

async function copier(source, cible) {
  await mkdir(dirname(cible), { recursive: true })
  await cp(source, cible)
}

async function synchroniser() {
  // Repartir d'une copie vide : un sujet retire du corpus ne doit pas survivre.
  await rm(destination, { recursive: true, force: true })
  await mkdir(destination, { recursive: true })

  const copies = []
  const absents = []

  for (const dossier of DOSSIERS) {
    const source = join(racineProjet, dossier)
    if (!(await existe(source))) {
      absents.push(dossier)
      continue
    }
    for (const relatif of await listerMarkdown(source)) {
      await copier(join(source, relatif), join(destination, dossier, relatif))
      copies.push(join(dossier, relatif))
    }
  }

  for (const fichier of FICHIERS) {
    const source = join(racineProjet, fichier)
    if (!(await existe(source))) {
      absents.push(fichier)
      continue
    }
    await copier(source, join(destination, fichier))
    copies.push(fichier)
  }

  const ou = relative(racineApp, destination)
  console.log(`[corpus] ${copies.length} fichier(s) .md copie(s) vers ${ou}/`)
  if (absents.length > 0) {
    console.warn(`[corpus] introuvable(s), ignore(s) : ${absents.join(', ')}`)
  }
  if (copies.length === 0) {
    console.error('[corpus] aucun sujet copie : le corpus est-il bien a la racine du depot ?')
    process.exitCode = 1
  }
}

await synchroniser()
