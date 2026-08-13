// Coque provisoire : le gabarit conforme au design est posé plus tard (T08).
// Elle sert ici de témoin que le corpus est bien embarqué à la compilation.
import { cheminsSujets, lireSujet } from './data/corpus.js'

const TEMOIN = 'piscine/J01_les_quatre_divisions.md'

export default function App() {
  const brut = lireSujet(TEMOIN)

  return (
    <main className="amorce">
      <h1>COBOL QUEST</h1>
      <p>Operation Marcel - CGBA</p>
      <p>{cheminsSujets.length} sujets embarqués</p>
      <pre className="amorce-brut">
        {brut ? brut.slice(0, 600) : `Sujet introuvable : ${TEMOIN}`}
      </pre>
    </main>
  )
}
