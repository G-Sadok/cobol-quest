# ETAT_APP — Feuille de route de construction (mise à jour par la boucle)

Règles : traiter les tâches DANS L'ORDRE. Une itération = une tâche menée au bout
(code + vérifications + commits atomiques), puis cocher ici avec une note d'une
ligne. Tâche bloquée → la marquer `[!] cause` et tenter le plus petit correctif à
l'itération suivante avant de continuer.

- [ ] T01 — Dépôt git à la racine si absent (`.gitignore` : node_modules, dist,
      release, app/src/corpus/, .MISSION_TERMINEE, boucle.log) ; projet Vite +
      React (JS) dans `app/` ; gabarit nettoyé ; commit.
- [ ] T02 — Lecture du design : inventorier `design/` (DESIGN_SYSTEM.md,
      maquettes, icône) et consigner dans le JOURNAL les tokens retenus ; si le
      dossier est vide, consigner l'usage de la DA de repli (§7 du cahier des
      charges). Créer `app/src/styles/tokens.css` (variables CSS) à partir de
      cette source.
- [ ] T03 — `app/scripts/sync-corpus.mjs` (+ hooks predev/prebuild) copiant les
      .md du corpus vers `app/src/corpus/` ; module `src/data/corpus.js` avec
      `import.meta.glob(..., { query: '?raw', eager: true })` ; vérifier qu'un
      sujet s'affiche brut dans l'app de dev.
- [ ] T04 — Couche Electron : `electron/main.cjs` (fenêtre 1280×800, menu FR),
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
