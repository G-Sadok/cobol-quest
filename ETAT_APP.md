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
- [x] T05 — `programme.js` : manifeste complet PISCINE (J00→J10, RUSH01/02) —
      exercices/XP/bonus/seuils extraits des barèmes des sujets ; contrôle
      croisé avec le livret consigné au JOURNAL.
- [x] T06 — `programme.js` : MISSIONS M01→M06 + PHASE3 ; `echelons.js`
      (9 échelons, seuils + conditions).
- [x] T07 — `store/progression.js` (état, sélecteurs, actions, brancher la
      persistance IPC avec debounce + repli mémoire en dev navigateur) + tests
      vitest complets (XP, seuils, déblocage, échelons, unicité quiz,
      export→import identique).
- [x] T08 — Gabarit d'app conforme au design : layout, navigation 6 écrans,
      thème appliqué (tokens), effets (scanlines désactivables).
- [x] T09 — Écran LE TERMINAL branché sur le store.
- [x] T10 — Écran LA CARTE (couloir piscine, bureaux missions, salle machine ;
      4 états de salle conformes aux maquettes ; navigation vers le lecteur).
- [x] T11 — Écran LECTEUR DE SUJET : rendu markdown (code, tableaux), navigation
      précédent/suivant, largeur de lecture conforme au design.
- [x] T12 — Feuille de route latérale : cases exercices + bonus, XP
      crédités/retirés, jauge et passage « VALIDÉ », encart commande BERTHA.
- [x] T13 — Badges automatiques + « sur l'honneur » ; écran LE LIVRET (badges +
      échelons).
- [x] T14 — Contenu des quiz J01→J05 (8 QCM/épreuve en JSON, fidèles aux mémos,
      ≥2 questions « sortie exacte / colonnes » chacun).
- [x] T15 — Contenu des quiz J06→J09 + RUSH01 + RUSH02 (mêmes règles).
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
- 2026-08-13 T05 : `src/data/programme.js` porte les 13 epreuves de la piscine
  dans l'ordre obligatoire (J00..J05, RUSH01, J06..J09, RUSH02, J10), soit
  1 610 XP de base + 305 de bonus (le livret annonce « environ 1 900 »). XP,
  exercices et seuils repris des tableaux « BAREME DU JOUR » ; controle croise
  avec le livret sans aucun ecart. Deux ecarts tranches : le badge COLONNE 7 est
  rattache a J01 (le livret fait foi, le sujet J00 le cite en passant), et les
  deux rushs, qui n'ont pas de ligne « Validation : >= N XP », recoivent 70 % de
  leur bareme (84 et 105) comme les journees. Les rushs et J10 sont decoupes
  selon leurs criteres de bareme, pas en exercices numerotes. vitest installe
  (prevu au §2) avec le script `test` : 12 tests verts, build vert.
- 2026-08-13 T06 : le manifeste passe de 13 a 20 epreuves (6 missions + la
  phase 3), soit 2 600 XP de base + 295 de bonus pour les missions (le livret
  annonce « environ 2 900 »). Les criteres des tableaux « BAREME (/N) » tiennent
  lieu d'exercices : une mission se rend d'un bloc, pas en exercices numerotes.
  Aucune mission ne porte de ligne « Validation : >= N XP » : seuils a 70 % du
  bareme (§6 du cahier des charges), soit 210, 280, 245, 245, 280 et 560. La
  phase 3 n'a ni XP ni moulinette : `xpBase: 0`, `surLHonneur: true`,
  `bertha: null`, ses 4 exercices reprennent le plan de campagne en 4 semaines,
  et ses 2 badges ouvrent le neuvieme echelon. `echelons.js` transcrit le
  tableau 2 du livret ; le barreau 8 a une case XP vide (`xpRequis: null`). Le
  calcul de l'echelon courant reste au store (T07). Build vert, 30 tests verts.
- 2026-08-13 T07 : le store est coupe en trois. `store/progression.js` est le
  module pur (etat, selecteurs, actions, serialisation) ; `store/persistance.js`
  porte le pont IPC, l'amortissement a 500 ms, le vidage a la fermeture et le
  repli memoire ; `store/useProgression.js` raccorde le tout a React. Regles
  tranchees : les XP du quiz comptent au total mais PAS dans la validation d'une
  epreuve (le seuil du jour se gagne aux exercices) ; la phase 3, sans XP ni
  moulinette, se valide en cochant ses jalons ; la remise a zero garde les
  reglages ; une fiche d'epreuve vide n'est jamais conservee, ce qui rend
  l'aller-retour export/import exact. Constat a garder pour T13 : l'echelon 7
  demande 4 500 XP alors que tous les baremes de base ne pesent que 4 210 XP, il
  exige donc des bonus ou des quiz. Build vert, 93 tests verts, autotest Electron
  vert (clic dans la coque, ecriture amortie, relecture apres relance).
- 2026-08-13 T08 : la coque est posee (barre laterale 248px, barre d'outils
  translucide 52px, contenu defilant aux largeurs 1020/1080/720/680). La
  navigation vit dans `src/ui/ecrans.js`, module pur teste : c'est lui qui fixe
  l'ordre de la barre laterale ET des raccourcis Cmd+1 a Cmd+6. Les 6 ecrans
  existent avec leur entete definitive et un bloc de chantier qui nomme la tache
  qui les remplira. Arbitrage tranche : le reglage « scanlines » du cahier des
  charges devient l'interrupteur des effets de phosphore et ne touche QUE les
  objets sombres (curseur de console, pastille BERTHA, fin balayage des
  consoles), le design interdisant tout fond anime a l'echelle de la page ;
  l'ecran qui l'expose arrive en T17, le cablage est deja fait. La bande des
  feux de la barre laterale est vide a dessein : macOS y dessine les vrais
  boutons de fenetre. Build vert, 101 tests verts, autotest Electron vert
  (6 ecrans, passage terminal vers carte, bascule de theme ecrite puis reprise).
- 2026-08-13 T09 : le terminal est branche. Tout ce qu'il affiche sort d'un
  module pur de plus, `src/ui/tableauDeBord.js` (epreuve du moment, dernieres
  decorations, releve de service, carriere) : l'ecran n'est plus que de la mise
  en page. Trois arbitrages : la barre d'XP vers l'echelon suivant, exigee par
  le §5.1, se pose dans la carte de service a droite (la maquette ne la montre
  qu'en barre laterale, et elle declare son releve de service sacrifiable) ;
  l'epreuve du moment se jauge en XP d'exercices contre le seuil du jour, sauf
  la phase 3 qui se compte en jalons faute de moulinette ; la medaille des
  decorations porte un glyphe unique en attendant le catalogue de T13. La
  citation vient de `citations.js`, piochee dans les sujets. Build vert,
  135 tests verts, autotest Electron vert (tableau de bord lu sans rien
  cliquer, donc sans rien ecrire dans la progression).
- 2026-08-13 T10 : le plan des sous-sols est pose. Un module pur de plus,
  `src/ui/carte.js`, decide l'etat de chaque salle, son etiquette, son tampon
  et son annonce ; l'ecran ne fait que poser 19 tuiles. Trois arbitrages : le
  tampon porte les XP REELLEMENT gagnes (quiz compris) et non le bareme, ce qui
  le rend nul pour la phase 3 (« VALIDE » sans chiffre) ; une salle verrouillee
  est un bouton `disabled` qui dit dans son infobulle quelle epreuve l'ouvre,
  faute de toast (design 6.6) qui n'arrivera qu'avec la feuille de route ; une
  salle validee reste cliquable, pour revoir le sujet. `EnteteEcran` gagne un
  emplacement `aside` (la legende des 4 etats). Build vert, 150 tests verts,
  autotest Electron vert (plan lu sans rien cliquer : ouvrir une salle
  ecrirait l'epreuve retenue dans la progression).
- 2026-08-13 T11 : le sujet se lit. `react-markdown` et `remark-gfm` installes
  (paragraphe 2 du cahier des charges) ; un module pur de plus,
  `src/ui/lecteur.js`, detache l'en-tete du markdown, compose les reperes et
  designe les deux epreuves voisines ; `src/ui/Markdown.jsx` habille chaque
  element du corpus. Trois arbitrages : le titre et le sous-titre du sujet sont
  retires du corps et reposes dans la typographie du lecteur (sinon ils
  s'affichent deux fois), un niveau 1 restant redescend en niveau 2 ; le lecteur
  n'emprunte pas l'enveloppe `ui/Ecran.jsx`, il pose sa grille a deux volets ;
  une salle suivante verrouillee reste annoncee mais ne s'ouvre pas, comme sur
  La Carte. Le volet de droite garde son bloc de chantier jusqu'a T12. Build
  vert, 172 tests verts, autotest Electron vert (sujet lu sans rien cliquer
  d'autre que l'item de navigation).
- 2026-08-13 T12 : le volet de droite se coche. Un module pur de plus,
  `src/ui/feuilleDeRoute.js` (lignes, jauge, encart BERTHA, verdict du toast) ;
  `src/ecrans/FeuilleDeRoute.jsx` ne fait que poser le resultat et rendre les
  clics au store. Quatre arbitrages : la piste de la jauge vaut le bareme des
  exercices OBLIGATOIRES, pour que le repere ambre du seuil ne soit pas ecrase
  par des bonus facultatifs (la phase 3, sans XP, se jauge en jalons) ; le
  remplissage est ambre avant le seuil et vert apres, comme les deux etats du
  design 6.3 ; l'encart BERTHA garde la forme sombre de la maquette mais porte
  la commande exigee par le cahier des charges, l'application ne pouvant pas
  inventer un compte rendu de compilation ; le toast (design 6.2 et 6.6),
  annonce en T10, arrive ici car sans lui un exercice a 10 XP ne se voit pas
  bouger. Defaut corrige en chemin : le lecteur suivait `epreuveCourante`, qui
  saute les epreuves validees, donc cocher la derniere case changeait le texte
  sous les yeux ; `epreuveLue` garde le sujet ouvert sur le pupitre, et l'ecran
  retient l'epreuve des l'arrivee pour que ce verrou tienne aussi par Cmd+3.
  Build vert, 200 tests verts, autotest Electron vert (case cochee, toast et
  jauge releves, case rendue : la progression revient a l'identique).
- 2026-08-14 T13 : les decorations tombent toutes seules. `data/badges.js`
  devient le catalogue des 26 badges du livret (nom, glyphe, epreuve,
  condition, regle) ; le store evalue la regle (`badgeMerite`) et n'ecrit plus
  rien : un badge mesurable se DEDUIT de l'etat, seuls les 5 badges que BERTHA
  ne peut pas juger restent stockes. Regle de partage tranchee : automatique
  quand la condition tient entierement dans des exercices coches ou des XP,
  sur l'honneur des qu'un critere qualitatif s'y ajoute (predictions justes,
  aucun GO TO, aucun litteral, premier coup). `ui/livret.js` (module pur de
  plus) compose le mur des medailles et la grille des echelons ;
  `ecrans/Livret.jsx` ne fait que poser le resultat. Le terminal prend au
  passage les vrais glyphes et compte 26 decorations au lieu de 25. Build vert,
  222 tests verts, autotest Electron vert (26 medailles, 9 echelons dont un
  seul tenu, decoration accordee sur l'honneur puis rendue).
- 2026-08-14 T14 : les cinq premiers quiz du soir sont ecrits. Un fichier JSON
  par epreuve dans `app/src/data/quiz/` (J01 a J05), 8 questions a 4 choix,
  chacune avec sa correction commentee ; `data/quiz.js` les embarque par
  `import.meta.glob` comme le corpus et sait noter une copie. Chaque question
  porte une `categorie` : 'sortie' pour les questions de sortie exacte ou de
  colonnes (3 par quiz, 4 pour J02, jamais moins des 2 exigees), 'memo'
  sinon ; le test refuse un quiz qui descendrait sous le quota. Rien n'est
  invente : chaque reponse se retrouve dans le memo ou dans une sortie
  attendue du sujet. Build vert, 257 tests verts.
- 2026-08-14 T15 : les six derniers quiz sont ecrits (J06 a J09, RUSH01,
  RUSH02) : les onze epreuves a quiz du programme sont couvertes. Meme forme
  qu'en T14, avec 3 ou 4 questions de categorie 'sortie' par quiz (quota de 2
  exige, jamais atteint par le bas). Les rushs se revisent sur leurs cas
  pieges officiels (secret 1123 contre essai 1211, secret 2416 contre essai
  4444) et sur les trois chiffres que Josiane fait verifier avant BERTHA
  (1856.25, 675.00 plafonnee, 895.36 arrondie). Le test de couverture ne se
  contente plus d'une liste de fichiers presents : il exige l'egalite avec
  `idsAvecQuiz`, donc un futur quiz ajoute au programme fera echouer la suite
  tant qu'il n'est pas redige. Build vert, 287 tests verts.
