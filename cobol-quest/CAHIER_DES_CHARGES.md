# CAHIER DES CHARGES — COBOL QUEST, application macOS
### Document maître · Fait foi pour toute la construction (la boucle Claude Code l'applique)

## 1. Objet
Construire **COBOL QUEST — Opération Marcel** : une application de bureau
**macOS** (fichier `.app` distribué en `.dmg`), 100% hors-ligne et en français,
qui sert de campus virtuel pour le corpus pédagogique présent à la racine de ce
dossier. L'apprenant y lit les sujets, coche ses exercices validés par la
moulinette BERTHA, gagne des XP, débloque la carte de la CGBA, passe les quiz du
soir et suit sa carrière (échelons, badges).

Le corpus (`piscine/`, `missions/`, `phase3/`, `progression/`, `bertha/`,
`00_PLAN_MAITRE.md`, `01_NORME_CGBA.md`, `02_J00_INSTALLATION.md`) est **SACRÉ et
EN LECTURE SEULE**. Toute l'application vit dans `app/`.

## 2. Pile technique (imposée — ne pas improviser)
- **Electron + Vite + React 18**, JavaScript (pas de TypeScript), CSS vanilla.
- Dépendances autorisées : `react`, `react-dom`, `react-markdown`, `remark-gfm`,
  `electron`, `electron-builder`, `vite`, `@vitejs/plugin-react`, `vitest`,
  `concurrently`, `wait-on`. Toute autre dépendance doit être justifiée dans le
  JOURNAL avant installation.
- Empaquetage : `electron-builder` cible mac → `app/release/` contient le `.dmg`
  et le `.app`. `appId: cgba.cobolquest`, `productName: COBOL Quest`. Icône :
  `app/build/icon.icns` généré depuis un PNG 1024×1024 avec les outils macOS
  natifs (`sips` + `iconutil`) par un script `app/scripts/make-icon.sh`
  (si `design/` fournit une icône, l'utiliser ; sinon en dessiner une sobre en
  SVG — écran de terminal vert avec « CQ » — convertie en PNG).
- Scripts npm : `dev` (vite seul), `dev:app` (vite + electron via
  concurrently/wait-on), `build` (sync corpus + vite build), `test`
  (`vitest run`), `dist:mac` (build + `electron-builder --mac`).

## 3. Accès au corpus — méthode imposée (piège Electron connu)
`fetch()` de fichiers en `file://` échoue dans une app empaquetée. Donc :
un script `app/scripts/sync-corpus.mjs` (branché en `predev`/`prebuild`) copie
tous les `.md` du corpus vers `app/src/corpus/` en conservant l'arborescence,
et un module `app/src/data/corpus.js` les embarque À LA COMPILATION :
`import.meta.glob('../corpus/**/*.md', { query: '?raw', import: 'default',
eager: true })`. Aucune lecture disque à l'exécution pour les sujets : ils sont
DANS l'application. Identique en dev et en `.app`.

## 4. Persistance — fichier réel, pas localStorage
La progression est un JSON écrit dans le dossier utilisateur
(`app.getPath('userData')/progression.json`) via IPC :
- `electron/main.cjs` : fenêtre 1280×800 min (redimensionnable), menu français
  minimal, handlers `progression:charger`, `progression:sauver`,
  `progression:exporter` (boîte « Enregistrer sous »), `progression:importer`
  (boîte « Ouvrir » + validation du schéma).
- `electron/preload.cjs` : expose `window.cgba` (contextIsolation activée,
  nodeIntegration désactivée).
- Sauvegarde automatique à chaque changement (debounce 500 ms) + au quit.

## 5. Fonctionnel — les 6 écrans
1. **LE TERMINAL (tableau de bord)** : échelon + titre CGBA, barre d'XP vers le
   prochain échelon, épreuve en cours avec bouton « reprendre », 3 derniers
   badges, citation de Marcel (piochée dans les sujets), rappel de la commande
   BERTHA du moment.
2. **LA CARTE** : le sous-sol de la CGBA — couloir de la piscine (J00→J10, rushs
   en salles latérales), bureaux des missions (M01→M06), salle machine IBM
   (Phase 3). États : verrouillé / disponible / en cours / validé. Clic → lecteur.
3. **LE LECTEUR DE SUJET** : rendu markdown soigné (code mono sur fond sombre,
   tableaux propres, largeur de lecture confortable) + panneau « Feuille de
   route » : cases à cocher exercices et bonus, XP crédités/retirés, passage
   « VALIDÉ » au seuil du jour, encart « BERTHA fait foi :
   `./bertha/bertha.sh Jxx/exYY` ».
4. **LE QUIZ DU SOIR** (J01→J09, RUSH01, RUSH02) : 8 QCM par épreuve, 4 choix,
   correction commentée. ≥ 6/8 → +10 XP, crédités UNE seule fois par épreuve
   (re-tentatives libres). **Le contenu des quiz est à RÉDIGER** (fidèle aux
   Mémos du jour, en français, avec au moins 2 questions par quiz sur les
   sorties exactes ou les colonnes), stocké en JSON dans `app/src/data/quiz/`.
5. **LE LIVRET** : grille des badges (obtenus/grisés + condition affichée ;
   attribution automatique quand mesurable, case « sur l'honneur » sinon) et
   tableau des 9 échelons avec l'état courant.
6. **RÉGLAGES** : exporter / importer la progression (via IPC), remise à zéro
   (double confirmation), choix du rythme (intensif/soutenu/tranquille,
   indicatif), interrupteur scanlines.

## 6. Le manifeste du programme — `app/src/data/programme.js`
Pour chaque épreuve (J00→J10, RUSH01/02, M01→M06, PHASE3) : id, titre, chemin du
sujet, xpBase, xpBonusMax, seuilValidation (ligne « Validation : ≥ N XP » du
sujet ; J10 : 120 ; missions : 70% du barème), exercices[] (id, titre, xp,
estBonus — **extraits fidèlement des tableaux de barème de chaque sujet**),
badges[], règle de déblocage (séquentiel + conditions d'échelon du livret).
`app/src/data/echelons.js` : les 9 échelons de `progression/XP_ET_BADGES.md`.
Contrôle croisé exercices ↔ livret consigné dans le JOURNAL ; en cas d'écart, le
livret fait foi.

## 7. Le design — `design/` fait loi
Le dossier `design/` contient les livrables de Claude Design (voir
`CDC_DESIGN.md`) : `DESIGN_SYSTEM.md` (tokens), maquettes des écrans, icône.
**L'implémentation doit être fidèle au design déposé** : couleurs, typographies,
espacements, composants. Les maquettes HTML servent de référence visuelle, pas de
code à recopier aveuglément (le code final est du React propre).
**Repli** si `design/` est vide : thème « terminal CGBA 1987 » — fond `#0A0F0A`,
vert phosphore `#33FF66`, ambre `#FFB000`, rouge `#FF5555`, pile mono système
(`"IBM Plex Mono", "SF Mono", Menlo, monospace`), bordures ASCII, scanlines
subtiles désactivables, titres en MAJUSCULES, contraste AA.

## 8. Logique testée
`app/src/store/progression.js` : module pur (état, sélecteurs xpTotal /
xpParEpreuve / epreuveValidee / epreuvesDebloquees / echelonCourant, actions).
**Tests vitest obligatoires** : cumul et retrait d'XP, seuils, déblocage
séquentiel, échelons, unicité de l'XP quiz, export→import identique.

## 9. Git — chaque évolution est un commit (exigence contractuelle)
- Dépôt initialisé à la racine du dossier (`.gitignore` : `node_modules`, `dist`,
  `release`, `app/src/corpus/`, `.MISSION_TERMINEE`, `boucle.log`).
- **Un commit par évolution** : jamais deux tâches dans un commit ; une tâche qui
  touche plusieurs aspects distincts = plusieurs commits atomiques. Messages en
  français, préfixés : `app:`, `design:`, `quiz:`, `electron:`, `tests:`, `doc:`.
- La boucle vérifie après chaque tour qu'il ne reste rien de non committé.
- **Signature** : les commits sont au nom de l'utilisateur, exclusivement. Aucune
  mention d'un outil dans les messages ni les métadonnées (pas de ligne
  « Co-Authored-By », pas de « Generated with Claude Code », pas d'emoji robot).
  Le fichier `.claude/settings.json` (attribution vide) et le hook
  `.git/hooks/commit-msg` posés par la boucle garantissent cette règle : ne pas
  y toucher, ne pas modifier `git config`.
- **Aucune auto-attribution ailleurs** : l'outil de construction ne s'ajoute
  nulle part comme auteur ou contributeur (champs `author`/`contributors` de
  package.json, README, LICENSE, en-têtes de fichiers, crédits de l'interface).
- À la fin : tag `v1.0.0`.

## 9 bis. Règle typographique (contractuelle)
Le caractère « — » (tiret cadratin) est interdit dans tout fichier produit :
code, commentaires, chaînes de l'interface, JSON des quiz, messages de commit,
README, JOURNAL, notes d'état. Utiliser le tiret simple « - », les deux-points,
les parenthèses, ou reformuler. Les fichiers du corpus et les cahiers des
charges (lecture seule) ne sont pas concernés.

## 10. Définition de FINI
Toutes les cases d'`ETAT_APP.md` cochées ; `npm run build` et `npm test` verts ;
`npm run dist:mac` produit un `.dmg` fonctionnel ; parcours manuel décrit dans le
JOURNAL (cocher J00 → XP → J01 débloqué → quiz J01 → badge → export/import →
relance de l'app : progression conservée) ; `app/README.md` pour débutant
complet, incluant l'ouverture d'une app non signée (première fois : clic droit
sur l'app → « Ouvrir » → confirmer — Gatekeeper) ; tag `v1.0.0` posé. Alors,
créer `app/.MISSION_TERMINEE` (date + nombre d'itérations).
