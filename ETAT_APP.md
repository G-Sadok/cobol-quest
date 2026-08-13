# ETAT_APP — Feuille de route de construction (mise à jour par la boucle)

Règles : traiter les tâches DANS L'ORDRE. Une itération = une tâche menée au bout
(code + vérifications + commits atomiques), puis cocher ici avec une note d'une
ligne. Tâche bloquée → la marquer `[!] cause` et tenter le plus petit correctif à
l'itération suivante avant de continuer.

- [x] T01 — Dépôt git à la racine si absent (`.gitignore` : node_modules, dist,
      release, app/src/corpus/, .MISSION_TERMINEE, boucle.log) ; projet Vite +
      React (JS) dans `app/` ; gabarit nettoyé ; commit.
- [x] T02 — Lecture du design : inventorier `design/` (DESIGN_SYSTEM.md,
      maquettes, icône) et consigner dans le JOURNAL les tokens retenus ; si le
      dossier est vide, consigner l'usage de la DA de repli (§7 du cahier des
      charges). Créer `app/src/styles/tokens.css` (variables CSS) à partir de
      cette source.
- [x] T03 — `app/scripts/sync-corpus.mjs` (+ hooks predev/prebuild) copiant les
      .md du corpus vers `app/src/corpus/` ; module `src/data/corpus.js` avec
      `import.meta.glob(..., { query: '?raw', eager: true })` ; vérifier qu'un
      sujet s'affiche brut dans l'app de dev.
- [x] T04 — Couche Electron : `electron/main.cjs` (fenêtre 1280×800, menu FR),
      `electron/preload.cjs` (pont `window.cgba`, contextIsolation), IPC
      progression charger/sauver vers `userData/progression.json` ; scripts
      `dev:app`, config `electron-builder` (appId, productName, mac) ; lancement
      dev vérifié.
- [ ] T05 — `programme.js` : manifeste complet PISCINE (J00→J10, RUSH01/02) —
      exercices/XP/bonus/seuils extraits des barèmes des sujets ; contrôle
      croisé avec le livret consigné au JOURNAL.
- [ ] T06 — `programme.js` : MISSIONS M01→M06 + PHASE3 ; `echelons.js`
      (9 échelons, seuils + conditions).
- [ ] T07 — `store/progression.js` (état, sélecteurs, actions, brancher la
      persistance IPC avec debounce + repli mémoire en dev navigateur) + tests
      vitest complets (XP, seuils, déblocage, échelons, unicité quiz,
      export→import identique).
- [ ] T08 — Gabarit d'app conforme au design : layout, navigation 6 écrans,
      thème appliqué (tokens), effets (scanlines désactivables).
- [ ] T09 — Écran LE TERMINAL branché sur le store.
- [ ] T10 — Écran LA CARTE (couloir piscine, bureaux missions, salle machine ;
      4 états de salle conformes aux maquettes ; navigation vers le lecteur).
- [ ] T11 — Écran LECTEUR DE SUJET : rendu markdown (code, tableaux), navigation
      précédent/suivant, largeur de lecture conforme au design.
- [ ] T12 — Feuille de route latérale : cases exercices + bonus, XP
      crédités/retirés, jauge et passage « VALIDÉ », encart commande BERTHA.
- [ ] T13 — Badges automatiques + « sur l'honneur » ; écran LE LIVRET (badges +
      échelons).
- [ ] T14 — Contenu des quiz J01→J05 (8 QCM/épreuve en JSON, fidèles aux mémos,
      ≥2 questions « sortie exacte / colonnes » chacun).
- [ ] T15 — Contenu des quiz J06→J09 + RUSH01 + RUSH02 (mêmes règles).
- [ ] T16 — Écran QUIZ DU SOIR : déroulé, correction commentée, +10 XP si ≥6/8,
      XP unique par épreuve.
- [ ] T17 — Écran RÉGLAGES : export/import via IPC (boîtes de dialogue natives),
      remise à zéro double confirmation, rythme, scanlines.
- [ ] T18 — Icône : `design/icone.png` si fourni, sinon dessin de repli ;
      `app/scripts/make-icon.sh` (sips + iconutil) → `app/build/icon.icns`.
- [ ] T19 — Empaquetage : `npm run dist:mac` produit `.dmg` + `.app` dans
      `app/release/` ; test de lancement de l'app empaquetée ; consigner au
      JOURNAL la taille et tout avertissement.
- [ ] T20 — Finitions : responsive ≥1280, états vides élégants, textes relus,
      `app/README.md` débutant complet (installation, `.dmg`, première ouverture
      d'une app non signée : clic droit → Ouvrir).
- [ ] T21 — Contrôle final : build + tests verts, parcours manuel complet décrit
      au JOURNAL (progression conservée après relance de l'app), `git tag
      v1.0.0`, puis créer `app/.MISSION_TERMINEE`.

## Notes d'itération
(la boucle ajoute ici une ligne datée par tâche : décisions, écarts, dettes)

- 2026-08-13 T01 : dépôt déjà initialisé, `.gitignore` posé, `app/` créé à la
  main (Vite 6 + React 18, JS pur) sans `npm create` ; scripts `dev`/`build`/
  `preview` seulement (les scripts `dev:app`, `test`, `dist:mac` viendront avec
  leurs tâches T03/T04/T07). `base: './'` dans `vite.config.js` pour le futur
  chargement `file://` sous Electron. Build vert, pas encore de tests.
- 2026-08-13 T02 : `design/` est fourni et complet (DESIGN_SYSTEM.md, maquette
  interactive `COBOL QUEST.dc.html` + `support.js`, `icone.png` 1024, notes
  d'integration) : pas de repli §7. `app/src/styles/tokens.css` transcrit les
  deux themes tels quels depuis la maquette (elle prime en cas de doute), plus
  la typographie, l'echelle 2..72, les largeurs de coque, rayons, ombres et
  durees. `base.css` importe les tokens, la racine porte `data-sombre="0"`.
  Ecarts de nommage tranches en faveur de la maquette (`--tete`,
  `--vert-survol`, `--lecture`). Build vert.
- 2026-08-13 T03 : `sync-corpus.mjs` recopie les 24 .md du corpus (5 dossiers
  sacres + 3 fichiers de racine) vers `app/src/corpus/`, destination purgee a
  chaque passage pour ne pas garder de sujet mort ; branche en `predev` et
  `prebuild` via `sync:corpus`. `src/data/corpus.js` les embarque avec
  `import.meta.glob('../corpus/**/*.md', { query: '?raw', eager: true })` et
  expose `sujets`, `cheminsSujets`, `lireSujet(chemin)`, `corpusPresent()`,
  clefs relatives a `src/corpus/`. A retenir pour T05 : J00 n'est pas dans
  `piscine/` mais a la racine (`02_J00_INSTALLATION.md`). Verification faite par
  le build (serveurs interdits) : bundle a 298 kB, sujet J01 present dans le
  JS emis et affiche brut par la coque provisoire. Build vert, tests pas encore
  en place (T07).
- 2026-08-13 T04 : couche Electron posee. `electron/main.cjs` (fenetre
  1280x800 min, `titleBarStyle: hiddenInset` + feux a x16/y20 pour la barre de
  52px du design, menu francais minimal, 4 handlers IPC en ecriture atomique
  vers `userData/progression.json`) et `electron/preload.cjs` (pont
  `window.cgba`, contextIsolation + sandbox). Les handlers `exporter` et
  `importer` sont livres ici avec les deux autres : le §4 du cahier des charges
  definit `main.cjs` avec les quatre ; l'ecran qui s'en sert arrive en T17.
  Le lancement dev par serveur etant interdit par le protocole, la verification
  passe par un mode `CQ_AUTOTEST=1` qui charge l'interface compilee, controle
  le pont et l'aller-retour IPC, puis quitte : sortie 0, `charger` renvoie
  `{ ok: true, progression: null }` (aucun fichier au premier lancement).
  4 dependances de developpement ajoutees, toutes prevues au §2 : electron,
  electron-builder, concurrently, wait-on. Build vert.
