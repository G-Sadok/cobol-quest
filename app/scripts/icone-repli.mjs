// Dessin de repli de l'icone, utilise UNIQUEMENT si design/icone.png est absent.
// Contrainte : aucune dependance (le cahier des charges fige la liste) et sips ne
// sait pas rasteriser un SVG. La toile est donc peinte pixel par pixel ici, puis
// encodee en PNG avec le zlib de Node.
import zlib from 'node:zlib'
import { writeFileSync } from 'node:fs'

const CANAUX = 4

// Les couleurs du theme sombre du design : papier creme, ecran de console, phosphore.
const PAPIER = [246, 242, 232]
const BORD = [222, 215, 198]
const ECRAN = [22, 22, 15]
const PHOSPHORE = [79, 191, 123]

function creerToile (taille) {
  return { taille, pixels: Buffer.alloc(taille * taille * CANAUX, 0) }
}

// Compose une couleur sur le pixel deja pose (alpha classique, pre-multiplie a la main).
function poser (toile, x, y, couleur, alpha) {
  if (alpha <= 0) return
  const i = (y * toile.taille + x) * CANAUX
  const p = toile.pixels
  const aSur = Math.min(1, alpha)
  const aFond = p[i + 3] / 255
  const aSortie = aSur + aFond * (1 - aSur)
  if (aSortie <= 0) return
  for (let c = 0; c < 3; c += 1) {
    p[i + c] = Math.round((couleur[c] * aSur + p[i + c] * aFond * (1 - aSur)) / aSortie)
  }
  p[i + 3] = Math.round(aSortie * 255)
}

// Peint une forme donnee par un predicat, adoucie par 4 sous-echantillons par pixel.
function peindre (toile, couleur, dedans) {
  const decalages = [0.25, 0.75]
  for (let y = 0; y < toile.taille; y += 1) {
    for (let x = 0; x < toile.taille; x += 1) {
      let touches = 0
      for (const dy of decalages) {
        for (const dx of decalages) {
          if (dedans(x + dx, y + dy)) touches += 1
        }
      }
      if (touches > 0) poser(toile, x, y, couleur, touches / 4)
    }
  }
}

function rectangleArrondi (x0, y0, x1, y1, rayon) {
  return (x, y) => {
    const dx = Math.max(x0 + rayon - x, 0, x - (x1 - rayon))
    const dy = Math.max(y0 + rayon - y, 0, y - (y1 - rayon))
    if (x < x0 || x > x1 || y < y0 || y > y1) return false
    return Math.hypot(dx, dy) <= rayon
  }
}

function anneau (cx, cy, rayon, epaisseur, ouverture = null) {
  const interne = rayon - epaisseur / 2
  const externe = rayon + epaisseur / 2
  return (x, y) => {
    const d = Math.hypot(x - cx, y - cy)
    if (d < interne || d > externe) return false
    if (ouverture === null) return true
    // L'ouverture du C : un secteur laisse vide, centre sur l'angle donne.
    let ecart = Math.abs(Math.atan2(y - cy, x - cx) - ouverture.angle)
    if (ecart > Math.PI) ecart = 2 * Math.PI - ecart
    return ecart > ouverture.demiLargeur
  }
}

function segment (x0, y0, x1, y1, epaisseur) {
  const vx = x1 - x0
  const vy = y1 - y0
  const carre = vx * vx + vy * vy
  return (x, y) => {
    let t = ((x - x0) * vx + (y - y0) * vy) / carre
    t = Math.max(0, Math.min(1, t))
    return Math.hypot(x - (x0 + t * vx), y - (y0 + t * vy)) <= epaisseur / 2
  }
}

function ou (...formes) {
  return (x, y) => formes.some((forme) => forme(x, y))
}

// Une carte de papier arrondie, un ecran de console, et « CQ » en phosphore.
export function dessineIcone (taille = 1024) {
  const t = (part) => part * taille
  const toile = creerToile(taille)

  const carte = rectangleArrondi(t(0.07), t(0.07), t(0.93), t(0.93), t(0.19))
  peindre(toile, BORD, carte)
  peindre(toile, PAPIER, rectangleArrondi(t(0.078), t(0.078), t(0.922), t(0.922), t(0.183)))

  peindre(toile, ECRAN, rectangleArrondi(t(0.19), t(0.24), t(0.81), t(0.62), t(0.035)))

  const cy = t(0.43)
  const rayon = t(0.085)
  const epaisseur = t(0.035)
  const cxC = t(0.4)
  const cxQ = t(0.61)
  const lettreC = anneau(cxC, cy, rayon, epaisseur, { angle: 0, demiLargeur: 0.62 })
  const lettreQ = ou(
    anneau(cxQ, cy, rayon, epaisseur),
    segment(cxQ + rayon * 0.35, cy + rayon * 0.35, cxQ + rayon * 1.05, cy + rayon * 1.05, epaisseur)
  )
  peindre(toile, PHOSPHORE, ou(lettreC, lettreQ))

  return encodePng(toile)
}

// --- Encodage PNG (RVBA 8 bits, sans filtre) ---

const TABLE_CRC = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32 (donnees) {
  let c = 0xffffffff
  for (let i = 0; i < donnees.length; i += 1) c = TABLE_CRC[(c ^ donnees[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function morceau (type, donnees) {
  const corps = Buffer.concat([Buffer.from(type, 'ascii'), donnees])
  const longueur = Buffer.alloc(4)
  longueur.writeUInt32BE(donnees.length)
  const controle = Buffer.alloc(4)
  controle.writeUInt32BE(crc32(corps))
  return Buffer.concat([longueur, corps, controle])
}

function encodePng (toile) {
  const { taille, pixels } = toile
  const ligne = taille * CANAUX
  const brut = Buffer.alloc((ligne + 1) * taille)
  for (let y = 0; y < taille; y += 1) {
    brut[y * (ligne + 1)] = 0
    pixels.copy(brut, y * (ligne + 1) + 1, y * ligne, (y + 1) * ligne)
  }
  const entete = Buffer.alloc(13)
  entete.writeUInt32BE(taille, 0)
  entete.writeUInt32BE(taille, 4)
  entete[8] = 8 // 8 bits par canal
  entete[9] = 6 // RVBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    morceau('IHDR', entete),
    morceau('IDAT', zlib.deflateSync(brut, { level: 9 })),
    morceau('IEND', Buffer.alloc(0))
  ])
}

// Appel direct : node scripts/icone-repli.mjs <sortie.png> [taille]
if (process.argv[1] && process.argv[1].endsWith('icone-repli.mjs')) {
  const sortie = process.argv[2]
  if (!sortie) {
    console.error('Usage : node scripts/icone-repli.mjs <sortie.png> [taille]')
    process.exit(1)
  }
  const taille = Number(process.argv[3]) || 1024
  writeFileSync(sortie, dessineIcone(taille))
  console.log(`Icone de repli dessinee : ${sortie} (${taille}x${taille})`)
}
