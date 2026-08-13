# NOTES D'INTEGRATION

1. **Maquette de référence : `COBOL QUEST v2.dc.html`** (ouvrir avec `support.js` à côté). Elle est interactive : cases à cocher, quiz, modale, toasts, interrupteurs. En cas de doute, elle prime sur toute capture.
2. **Thème :** clair et sombre commutables (bouton dans la toolbar, interrupteur dans Réglages). Tout passe par des variables CSS (`:root` / `[data-sombre="1"]`) — ne jamais écrire une couleur en dur dans un composant. Console BERTHA et blocs de code identiques dans les deux thèmes.
3. **Sacré — le partage des matières :** coque claire (papier crème) pour l'app, sombre `#16160F` uniquement pour la console BERTHA, les blocs de code, le bandeau Salle machine et le toast. Si le sombre s'étend, la direction s'effondre.
4. **Sacré — les deux familles :** sans système pour lire, monospace pour tout ce qui est machine (codes, XP, labels, sorties BERTHA). Jamais un paragraphe en mono, jamais un code de salle en sans.
5. **Sacré — le contraste :** en thème clair, `#615B4F` est le gris le plus clair autorisé pour du texte et l'ambre est `#8F5A08`. Vérifier l'AA contre la surface réelle de l'élément (quatre surfaces distinctes), pas contre le blanc, et dans les deux thèmes.
6. **Sacré — La Carte et ses 4 états de salle.** Les quatre traitements doivent se distinguer sans lire le texte (fond + bordure + étiquette). Le tampon rouge sur les salles validées est ce qui rend la progression tangible.
7. **Sacré — la coque macOS :** barre latérale 248px avec carte de profil ancrée en bas, toolbar unifiée translucide, feux système. C'est ce qui fait « app » plutôt que « page web ».
8. **Sacrifiable :** les animations `tampon` et `phosphore` ; les transitions 130ms suffisent. À couper d'office sous `prefers-reduced-motion`.
9. **Sacrifiable :** le zébrage vert des tableaux, le halo des salles disponibles, la pastille « BERTHA EN LIGNE » de la toolbar, le relevé de service du Terminal.
10. **Redimensionnement :** barre latérale et toolbar fixes, contenu défilant, largeurs centrées (1020 / 1080 / 720 / 680 px selon l'écran). Sous 1180px de large, Le Sujet passe la Feuille de route sous la colonne de lecture.
11. **Hors-ligne :** aucune ressource distante, aucun `@font-face`, aucune icône chargée — les glyphes sont des caractères Unicode et les piles de polices sont système.
