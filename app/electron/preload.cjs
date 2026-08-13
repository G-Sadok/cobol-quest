/*
 * Pont unique entre le rendu et le processus principal.
 * contextIsolation active : le rendu ne voit que `window.cgba`, jamais Node.
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('cgba', {
  // Temoin de presence : en dev navigateur, `window.cgba` est absent et le
  // store bascule sur son repli memoire (T07).
  present: true,
  plateforme: process.platform,

  charger: () => ipcRenderer.invoke('progression:charger'),
  sauver: (progression) => ipcRenderer.invoke('progression:sauver', progression),
  exporter: (progression) => ipcRenderer.invoke('progression:exporter', progression),
  importer: () => ipcRenderer.invoke('progression:importer'),

  // Fermeture de l'app : le principal previent, le rendu ecrit puis accuse
  // reception avec `tamponVide()`.
  surAvantFermeture: (rappel) => {
    const ecoute = () => rappel()
    ipcRenderer.on('app:avant-fermeture', ecoute)
    return () => ipcRenderer.removeListener('app:avant-fermeture', ecoute)
  },
  tamponVide: () => ipcRenderer.send('app:tampon-vide')
})
