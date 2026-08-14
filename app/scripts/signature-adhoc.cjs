/*
 * Signature ad-hoc de l'application empaquetee (hook `afterPack`).
 *
 * COBOL QUEST se distribue NON SIGNEE : aucun certificat Apple n'entre dans ce
 * projet, et le README explique l'ouverture par clic droit (Gatekeeper).
 * `identity: null` dans package.json coupe donc la recherche d'un certificat
 * dans le trousseau, qui autrement bloque l'empaquetage sur une demande de mot
 * de passe et peut signer avec une identite etrangere au projet.
 *
 * Mais une application sans AUCUNE signature ne demarre pas sur Apple Silicon :
 * le noyau tue le processus a l'ouverture. La signature ad-hoc (`--sign -`),
 * qui n'exige ni certificat ni trousseau, suffit a le satisfaire.
 */

const { execFileSync } = require('node:child_process')
const path = require('node:path')

exports.default = async function signatureAdHoc (contexte) {
  if (contexte.electronPlatformName !== 'darwin') return

  const application = path.join(
    contexte.appOutDir,
    `${contexte.packager.appInfo.productFilename}.app`
  )

  execFileSync('codesign', ['--force', '--deep', '--sign', '-', application], {
    stdio: 'inherit'
  })
  execFileSync('codesign', ['--verify', '--deep', '--strict', application], {
    stdio: 'inherit'
  })

  console.log(`  • signature ad-hoc posee  application=${application}`)
}
