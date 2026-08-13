// Coque provisoire : le gabarit conforme au design est posé plus tard (T08).
// Elle sert ici de témoin que le corpus est bien embarqué à la compilation.
import { cheminsSujets, lireSujet } from './data/corpus.js'

const TEMOIN = 'piscine/J01_les_quatre_divisions.md'

export default function App() {
  const brut = lireSujet(TEMOIN)
  // Le pont n'existe que sous Electron : en dev navigateur, le store (T07)
  // basculera sur son repli mémoire.
  const pont = typeof window !== 'undefined' && window.cgba?.present

  return (
    <main className="amorce">
      <h1>COBOL QUEST</h1>
      <p>Operation Marcel - CGBA</p>
      <p>{cheminsSujets.length} sujets embarqués</p>
      <p>Pont cgba : {pont ? 'actif' : 'absent (dev navigateur)'}</p>
      <pre className="amorce-brut">
        {brut ? brut.slice(0, 600) : `Sujet introuvable : ${TEMOIN}`}
      </pre>
    </main>
  )
}
