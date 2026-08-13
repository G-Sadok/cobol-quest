# JOURNAL DE CONSTRUCTION - COBOL QUEST

Un paragraphe par itération : tâche traitée, décisions, fichiers touchés,
verdict build/tests, commits créés.

## 2026-08-13 - T01 : amorce du dépôt et du projet Vite + React

Tâche : mise en place du `.gitignore` et du squelette applicatif dans `app/`.

Décisions :
- Le dépôt git existait déjà à la racine : rien à initialiser, seul le
  `.gitignore` manquait (node_modules, dist, release, `app/src/corpus/`,
  `.MISSION_TERMINEE`, `boucle.log`, plus `.DS_Store` pour éviter des salissures
  de statut sous macOS).
- Projet créé à la main plutôt que par `npm create vite` : le gabarit officiel
  embarque un compteur de démonstration, des logos et un `README` qu'il aurait
  fallu supprimer ensuite. Résultat : `index.html`, `src/main.jsx`,
  `src/App.jsx`, `src/styles/base.css`, aucun résidu de gabarit.
- `base: './'` dans `vite.config.js` : les chemins absolus cassent le chargement
  en `file://` dans une app Electron empaquetée. Décidé dès maintenant pour ne
  pas avoir à le diagnostiquer plus tard.
- Content-Security-Policy restrictive posée dans `index.html` (`default-src
  'self'`), cohérente avec une application 100% hors-ligne.
- Scripts npm limités à `dev`, `build`, `preview`. Les scripts `dev:app`,
  `test` et `dist:mac` exigés par le cahier des charges seront ajoutés avec les
  tâches qui apportent leurs outils (T03 sync corpus, T04 Electron, T07 vitest),
  pour ne pas laisser de scripts cassés dans l'intervalle.
- Dépendances installées : `react`, `react-dom`, `vite`, `@vitejs/plugin-react`.
  Toutes figurent dans la liste autorisée du cahier des charges, aucune
  dépendance hors liste.
- Champ `author` de `package.json` laissé vide, conformément à la règle de
  signature.

Fichiers touchés : `.gitignore`, `app/package.json`, `app/package-lock.json`,
`app/vite.config.js`, `app/index.html`, `app/src/main.jsx`, `app/src/App.jsx`,
`app/src/styles/base.css`, `.claude/settings.json` (versionné tel quel, non
modifié), `ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (27 modules, `dist/` produit en 291 ms). Pas de
tests à ce stade : vitest arrive en T07.

Commits créés :
- `app: ajouter le .gitignore du depot`
- `app: versionner la configuration de la boucle de construction`
- `app: initialiser le projet Vite + React dans app/`
- `doc: consigner l'iteration T01`
