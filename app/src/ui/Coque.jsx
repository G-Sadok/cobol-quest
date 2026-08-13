// La coque : barre laterale fixe a gauche, barre d'outils fixe en haut, et le
// contenu qui defile seul entre les deux (note d'integration 10).

import BarreLaterale from './BarreLaterale.jsx'
import BarreOutils from './BarreOutils.jsx'
import { useApp } from './contexte.js'

export default function Coque({ children }) {
  const { alerte } = useApp()

  return (
    <div className="coque">
      <BarreLaterale />
      <div className="coque-corps">
        <BarreOutils />
        {alerte ? (
          <div className="bandeau-alerte" role="status">
            {alerte}
          </div>
        ) : null}
        <main className="coque-defile">{children}</main>
      </div>
    </div>
  )
}
