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

## 2026-08-13 - T02 : lecture du design et tokens CSS

Tâche : inventorier `design/`, consigner les tokens retenus, créer
`app/src/styles/tokens.css`.

Inventaire de `design/` (dossier fourni et complet, la direction artistique de
repli du §7 du cahier des charges ne s'applique donc PAS) :
- `DESIGN_SYSTEM.md` (17 ko) : la version v2 « Dossier CGBA ». Couleurs des deux
  thèmes, typographie, espacements, composants, règles d'usage.
- `COBOL QUEST.dc.html` (66 ko) + `support.js` : la maquette interactive de
  référence, avec les blocs `:root` et `[data-sombre="1"]` complets.
- `icone.png` (1024x1024) : servira en T18.
- `NOTES_INTEGRATION.md` : ce qui est sacré et ce qui est sacrifiable.
- `A_LIRE.md`, `COBOL Quest Design System.zip` (archive du même contenu).

Décisions :
- La direction artistique retenue n'est pas le « terminal 1987 » du repli mais la
  coque macOS claire sur papier crème : le sombre `#16160F` est réservé à la
  console BERTHA, aux blocs de code, au bandeau Salle machine et au toast. Le
  cahier des charges le prévoit explicitement : `design/` fait loi.
- Tokens transcrits depuis la maquette plutôt que depuis le tableau du
  DESIGN_SYSTEM.md : les notes d'intégration précisent que la maquette prime en
  cas de doute, et elle est plus complète (surfaces dérivées, traits fins,
  opacités). Écarts de nommage tranchés en sa faveur : `--tete` (et non
  `--carte-tete`), `--vert-survol` (et non `--vert-fonce`), `--lecture` (et non
  `--encre-lecture`).
- Un seul fichier `tokens.css` : bloc `:root, [data-sombre="0"]` pour le clair,
  bloc `[data-sombre="1"]` en surcharge pour le sombre, puis un bloc `:root`
  invariant pour la typographie, l'échelle d'espacement (2 · 5 · 7 · 9 · 11 · 14
  · 18 · 22 · 26 · 30 · 40 · 52 · 72), les largeurs de coque (barre 248,
  toolbar 52, contenus 1020/1080/720/680, colonne de lecture 68ch), les rayons,
  les trois ombres et les durées d'animation.
- Le phosphore n'est pas redéclaré dans le bloc sombre : il est identique dans
  les deux thèmes, c'est le point fixe de l'identité.
- `data-sombre="0"` posé sur `<html>` dans `index.html` : l'attribut existe dès
  maintenant pour que la bascule de thème (T17) n'ait qu'à le changer.
- `base.css` réécrit pour ne plus contenir aucune couleur en dur : fond, encre,
  familles, barres de défilement et coque provisoire passent par les variables.
- Aucune dépendance ajoutée.

Fichiers touchés : `app/src/styles/tokens.css` (nouveau),
`app/src/styles/base.css`, `app/index.html`, `ETAT_APP.md`,
`JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (27 modules, CSS 5,79 ko). Vérifié que les
variables sont bien présentes dans le CSS produit et `data-sombre="0"` dans le
`dist/index.html`. Pas encore de tests : vitest arrive en T07.

Commits créés :
- `design: poser les tokens CSS du design system`
- `doc: consigner l'iteration T02`

## 2026-08-13 - T03 : synchronisation et embarquement du corpus

Tâche : rendre les sujets lisibles par l'application sans aucune lecture disque à
l'exécution, conformément à la section 3 du cahier des charges (le piège
`fetch()` en `file://` dans une app empaquetée).

Décisions :
- `app/scripts/sync-corpus.mjs` recopie les `.md` de `piscine/`, `missions/`,
  `phase3/`, `progression/`, `bertha/` et des trois fichiers de racine
  (`00_PLAN_MAITRE.md`, `01_NORME_CGBA.md`, `02_J00_INSTALLATION.md`) vers
  `app/src/corpus/`, arborescence conservée. Soit 24 fichiers.
- La destination est purgée au début de chaque passage : un sujet supprimé du
  corpus ne doit pas survivre dans une copie périmée. Le corpus source n'est
  jamais touché, le script ne fait que lire.
- Un dossier ou un fichier absent est signalé en avertissement sans faire échouer
  le build ; en revanche zéro fichier copié est une erreur (code de sortie 1),
  parce que cela signifie que le corpus n'est pas à la racine attendue.
- Branchement npm : `sync:corpus` porte la commande, `predev` et `prebuild`
  l'appellent. La copie est donc toujours fraîche, en dev comme au build, et
  `app/src/corpus/` reste ignoré par git (vérifié : `git status` ne le voit pas).
- `app/src/data/corpus.js` embarque le tout avec
  `import.meta.glob('../corpus/**/*.md', { query: '?raw', import: 'default',
  eager: true })`. Les clés du glob sont normalisées en chemins relatifs à
  `src/corpus/` (« piscine/J01_les_quatre_divisions.md »), c'est-à-dire la forme
  exacte que `programme.js` utilisera comme « chemin du sujet » en T05/T06.
  L'API exposée : `sujets`, `cheminsSujets`, `lireSujet(chemin)` et
  `corpusPresent()`.
- Relevé pour T05 : J00 ne se trouve pas dans `piscine/` mais à la racine du
  corpus (`02_J00_INSTALLATION.md`). La piscine contient J01 à J10 plus RUSH01 et
  RUSH02, ce qui correspond au manifeste attendu.
- Aucune dépendance ajoutée (le script n'utilise que `node:fs/promises`,
  `node:path` et `node:url`).

Vérification de l'affichage : les serveurs de développement sont interdits par le
protocole, la preuve passe donc par le build. La coque provisoire affiche le
nombre de sujets embarqués et les 600 premiers caractères de J01 dans un bloc de
console (tokens `--console` / `--phosphore-3`, aucune couleur en dur). Le JS
produit contient bien le texte des sujets : la chaîne « IDENTIFICATION DIVISION »
y apparaît 4 fois et les noms de fichiers du corpus y figurent. Ce témoin sera
retiré avec la coque en T08.

Fichiers touchés : `app/scripts/sync-corpus.mjs` (nouveau),
`app/src/data/corpus.js` (nouveau), `app/package.json`, `app/src/App.jsx`,
`app/src/styles/base.css`, `ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (52 modules, JS 298,84 ko, CSS 6,11 ko). La taille
du bundle triple, c'est le corpus embarqué et c'est le comportement voulu. Pas
encore de tests : vitest arrive en T07.

Commits créés :
- `app: synchroniser le corpus vers src/corpus avant dev et build`
- `app: embarquer le corpus a la compilation et afficher un sujet brut`
- `doc: consigner l'iteration T03`

## 2026-08-13 - T04 : couche Electron, IPC de progression et empaquetage

Tâche : poser le processus principal, le pont `preload`, la persistance IPC vers
`userData/progression.json`, les scripts `dev:app` / `dist:mac` et la
configuration `electron-builder`.

Décisions :
- **Coque macOS conforme au design.** La fenêtre est en `titleBarStyle:
  'hiddenInset'` avec `trafficLightPosition: { x: 16, y: 20 }` : les feux
  systèmes tombent ainsi exactement dans la barre de 52px en haut de la barre
  latérale, telle que la maquette la dessine (padding 16px, pastilles de 12px).
  Les faux feux HTML de la maquette ne seront donc pas repris en T08.
  `backgroundColor: '#EFE9DC'` (valeur du token `--canevas`) évite le flash
  blanc à l'ouverture ; c'est le seul endroit du projet où une couleur est
  écrite en dur, le CSS n'ayant pas la main sur la fenêtre native.
- **Sécurité.** `contextIsolation: true`, `nodeIntegration: false`,
  `sandbox: true`. L'application étant hors-ligne, `will-navigate` est bloqué
  hors de l'URL attendue et `setWindowOpenHandler` refuse toute fenêtre.
- **Quatre handlers, pas deux.** La tâche T04 ne cite que `charger` et `sauver`,
  mais le §4 du cahier des charges décrit `main.cjs` avec les quatre handlers.
  `exporter` et `importer` (boîtes natives « Enregistrer sous » et « Ouvrir »,
  plus validation) sont donc livrés ici, en même temps que le fichier qui les
  porte ; l'écran Réglages qui les appellera reste pour T17.
- **Écriture atomique.** Chaque écriture passe par un `.tmp` puis un renommage :
  une coupure en pleine sauvegarde ne peut pas laisser une progression tronquée.
- **Validation d'import volontairement structurelle** : objet, `version`
  numérique, `epreuves` objet, `quiz` / `badges` typés s'ils sont présents. Le
  store affinera à la lecture en T07 ; refuser trop tôt un fichier au schéma
  légèrement plus riche serait pire que l'accepter.
- **Sauvegarde au quit.** `before-quit` diffère la fermeture, envoie
  `app:avant-fermeture` au rendu et attend son accusé `app:tampon-vide`
  (plafond 1200 ms). C'est la moitié « principal » de la règle de debounce du
  §4 ; la moitié « rendu » viendra avec le store en T07.
- **Menu français minimal** : COBOL Quest, Édition, Affichage, Fenêtre. Les
  outils de développement n'apparaissent que hors application empaquetée. Pas de
  menu Fichier : l'export et l'import ont leur place dans Réglages.
- **Dépendances** : `electron`, `electron-builder`, `concurrently`, `wait-on`,
  toutes les quatre listées au §2 du cahier des charges. Aucune dépendance hors
  liste, `cross-env` évité en passant la variable en préfixe de commande (la
  cible est macOS uniquement).

Vérification : le protocole interdit de lancer un serveur ou `dev:app`, qui ne
rendent pas la main. Le processus principal embarque donc un mode de contrôle,
`CQ_AUTOTEST=1 npx electron .` : il charge l'interface compilée exactement comme
le fera le `.app`, évalue `window.cgba.charger()` dans le rendu, journalise le
résultat et quitte avec 0 si le pont répond. Sortie observée :
`autotest : pont actif { ok: true, progression: null }`, code 0. Cela couvre le
démarrage, le chargement de `dist/index.html` en `file://`, le preload et
l'aller-retour IPC. Restent non vérifiés à ce stade : le chemin `CQ_URL_DEV`
(serveur Vite interdit) et l'empaquetage lui-même, qui est la tâche T19.

Fichiers touchés : `app/electron/main.cjs` (nouveau),
`app/electron/preload.cjs` (nouveau), `app/package.json` (champ `main`, scripts
`electron:dev` / `dev:app` / `dist:mac`, bloc `build` electron-builder),
`app/package-lock.json`, `app/src/App.jsx`, `ETAT_APP.md`,
`JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (52 modules, JS 298,98 ko, CSS 6,11 ko), contrôle
de démarrage Electron vert (code 0). Pas encore de tests : vitest arrive en T07.

Commits créés :
- `electron: poser la fenetre, le menu francais et l'IPC de progression`
- `app: afficher l'etat du pont cgba dans la coque provisoire`
- `doc: consigner l'iteration T04`

## T05 - Le manifeste de la piscine

Tâche : `app/src/data/programme.js`, manifeste complet de la PISCINE (J00 à J10,
RUSH01 et RUSH02) : exercices, XP, bonus et seuils extraits des barèmes des
sujets, contrôle croisé avec le livret `progression/XP_ET_BADGES.md`.

**Le contrôle croisé (barèmes des sujets contre livret) : aucun écart de
chiffre.** Les treize lignes du tableau 1 du livret tombent exactement sur la
somme des tableaux « BARÈME DU JOUR » : 30 / 95+30 / 120+40 / 120+30 / 130+30 /
135+30 / 120+30 (RUSH01) / 130+25 / 120+20 / 130+20 / 130+20 / 150+30 (RUSH02) /
200. Total : 1 610 XP de base et 305 XP de bonus, soit les « environ 1 900 XP de
piscine » annoncés par le livret.

Décisions et écarts tranchés :
- **Badge COLONNE 7** : le sujet J00 le donne à la fin de son exercice 00, le
  livret le rattache à J01. Le livret fait foi (§6 du cahier des charges) : il
  est déclaré sur J01, et J00 ne porte que PREMIÈRE COMPILE.
- **Seuil des rushs** : ni RUSH01 ni RUSH02 ne portent de ligne
  « Validation : ≥ N XP ». Les dix journées de piscine posent leur seuil entre
  69 % et 74 % de leur barème ; les rushs reçoivent donc 70 % du leur, soit 84
  (sur 120) et 105 (sur 150). C'est une convention de l'application, signalée en
  commentaire dans le fichier ; elle sera révisée si un sujet la contredit.
- **Découpage des rushs et de J10** : leurs barèmes sont des critères, pas des
  exercices numérotés. Ils sont modélisés comme des `exercices` (`c1`, `c2`...
  pour les rushs, `a1`/`a2`/`a3`/`b1`/`b2`/`c` pour l'examen) afin que la feuille
  de route de T12 ait des cases à cocher homogènes partout.
- **Cible BERTHA** : chaque exercice porte son argument de moulinette
  (`J03/ex05`, `RUSH01`, `J10/c`), tel que `bertha.sh` l'attend d'après son
  message d'usage. `commandeBertha()` en fabrique la ligne pour l'encart du
  lecteur.
- **J00 hors `piscine/`** : son sujet est `02_J00_INSTALLATION.md`, à la racine
  du corpus ; le chemin du manifeste le reflète.
- Les missions M01 à M06, la phase 3 et `echelons.js` sont la tâche T06 :
  `epreuves` est déjà l'agrégat qui les accueillera.

Dépendance ajoutée : **vitest**, prévue au §2 du cahier des charges, avec le
script `test` (`vitest run`) exigé par ce même §2. Elle arrive une tâche plus tôt
que prévu parce qu'un manifeste de données se vérifie par un test, pas à l'œil :
`src/data/programme.test.js` rejoue le tableau du livret, contrôle que la somme
des barèmes tombe juste, que les seuils sont atteignables sans bonus, que la
chaîne de prérequis est continue, que chaque `chemin` existe vraiment dans le
corpus embarqué, que les identifiants sont uniques et qu'aucun tiret cadratin ne
s'est glissé dans les libellés.

Fichiers touchés : `app/src/data/programme.js` (nouveau),
`app/src/data/programme.test.js` (nouveau), `app/package.json` (script `test`,
devDependency vitest), `app/package-lock.json`, `app/src/App.jsx` (la coque
provisoire affiche le sommaire de la piscine, ce qui met le manifeste dans le
bundle et le fait donc contrôler par le build), `ETAT_APP.md`,
`JOURNAL_CONSTRUCTION.md`.

Verdict : `npx vitest run` vert (1 fichier, 12 tests), `npm run build` vert
(53 modules, JS 309,32 ko, CSS 6,11 ko).

Commits créés :
- `app: poser le manifeste de la piscine dans programme.js`
- `tests: controler le bareme de la piscine contre le livret`
- `app: afficher le sommaire de la piscine dans la coque provisoire`
- `doc: consigner l'iteration T05`

## T06 - Les missions, la phase 3 et les échelons

Tâche : compléter `src/data/programme.js` avec les missions M01 à M06 et la
phase 3, puis écrire `src/data/echelons.js` (les 9 échelons, seuils et
conditions). Le manifeste passe de 13 à 20 épreuves.

Contrôle croisé du barème des missions contre le livret : aucun écart. Chaque
tableau « BARÈME (/N) » tombe exactement sur le total annoncé (300, 400, 350,
350, 400, 800) et chaque ligne de bonus sur le sien (+55, +40, +40, +40, +40,
+80). Total missions : 2 600 XP de base et 295 de bonus, soit 2 895, ce que le
livret arrondit en « environ 2 900 ».

Décisions prises :
- **Découpage des missions.** Comme pour les rushs et J10, les critères du
  tableau de barème tiennent lieu d'exercices : une mission se rend d'un bloc,
  elle n'a pas d'exercices numérotés. Les bonus, en revanche, sont éclatés ligne
  par ligne quand le sujet leur donne des XP séparés (M01, M02, M04, M06), parce
  que l'apprenti peut en tenir un sans l'autre.
- **Seuils de validation.** Aucune mission ne porte de ligne
  « Validation : >= N XP ». On applique la règle écrite au §6 du cahier des
  charges, 70 % du barème : 210, 280, 245, 245, 280 et 560. Le test fait le
  calcul en entiers, `(xpBase * 7) / 10` : en flottants, 350 x 0,7 donne
  244,999... et le contrôle tombe à côté.
- **La phase 3 est une épreuve à part.** Le livret ne lui accorde aucun XP et
  BERTHA ne la juge pas (elle se joue chez IBM). Elle entre donc au manifeste
  avec `xpBase: 0`, `surLHonneur: true` et `bertha: null` sur ses exercices, qui
  reprennent le plan de campagne en quatre semaines du sujet. `commandeBertha()`
  renvoie désormais `null` au lieu de fabriquer une commande qui n'existe pas.
- **Le neuvième échelon.** Le livret laisse sa case XP vide : `xpRequis: null`,
  et la condition passe par les deux badges (`premier-jcl`, `dompteur-de-vsam`),
  ce qui referme la boucle avec les badges portés par PHASE3.
- **`echelons.js` décrit, il ne calcule pas.** Chaque barreau porte son plancher
  d'XP, ses épreuves requises et ses badges requis ; la détermination de
  l'échelon courant vit dans le store (T07). Le module fournit tout de même les
  trois fonctions d'affichage dont le tableau de bord aura besoin
  (`echelonSuivant`, `xpAvantEchelonSuivant`, `progressionVersEchelonSuivant`).

Le test des échelons vérifie en plus que les épreuves citées existent bien au
manifeste et que, PHASE3 exclue, elles le couvrent toutes sans doublon : aucun
barreau ne peut donc oublier une épreuve ni la compter deux fois.

Fichiers touchés : `app/src/data/programme.js`, `app/src/data/programme.test.js`,
`app/src/data/echelons.js` (nouveau), `app/src/data/echelons.test.js` (nouveau),
`ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`. Aucune dépendance ajoutée.

Verdict : `npx vitest run` vert (2 fichiers, 30 tests), `npm run build` vert
(53 modules, JS 316,15 ko, CSS 6,11 ko).

Commits créés :
- `app: etendre le manifeste aux missions M01 a M06 et a la phase 3`
- `app: poser les neuf echelons de carriere dans echelons.js`
- `doc: consigner l'iteration T06`

## T07 - Le store de progression et sa persistance

La tâche demandait l'état, les sélecteurs, les actions, le branchement IPC et
les tests. Elle est livrée en trois modules aux responsabilités disjointes,
pour que le module testé reste pur (cahier des charges, §8) :

- `app/src/store/progression.js` : l'état, ses sélecteurs et ses actions. Aucune
  dépendance à React, à Electron ni au DOM. Une action prend l'état et en rend
  un nouveau ; quand elle ne change rien, elle rend l'état reçu tel quel, ce qui
  permet à la persistance de ne pas écrire pour rien.
- `app/src/store/persistance.js` : le pont `window.cgba`, l'amortissement des
  écritures, le vidage à la fermeture, l'export/import (les boîtes natives
  arrivent en T17) et le repli mémoire du navigateur de développement.
- `app/src/store/useProgression.js` : le raccord React, un seul appel à la
  racine. Le contexte qui le distribuera aux six écrans vient avec T08.

Décisions tranchées :

- **Les XP du quiz ne valident pas l'épreuve.** Le livret compte le quiz du soir
  dans les XP cumulés (+10 par épreuve), mais le seuil du jour est un barème
  d'exercices : `xpExercices()` décide de la validation, `xpParEpreuve()` ajoute
  le quiz pour le total de carrière. Sans cette séparation, deux quiz réussis
  feraient franchir un seuil sans avoir écrit une ligne de COBOL.
- **Les +10 XP tombent une seule fois.** L'état du quiz garde `tentatives`,
  `meilleurScore` et `xpCredite` : les re-tentatives restent libres (§5.4), le
  meilleur score ne redescend jamais, et le crédit ne se rejoue pas.
- **La phase 3 se valide sur l'honneur.** Elle n'a ni XP ni moulinette : son
  seuil à 0 la déclarerait validée d'emblée. `epreuveValidee()` bascule donc sur
  « tous les jalons obligatoires cochés » quand l'épreuve porte `surLHonneur`.
- **Une fiche d'épreuve vide n'est jamais conservée.** Cocher puis décocher rend
  exactement l'état de départ. L'état reste canonique, et l'aller-retour
  export/import rend un objet strictement égal, ce que le test exige.
- **La remise à zéro garde les réglages.** Rythme, scanlines et thème sont de
  l'ergonomie, pas de la carrière : les effacer punirait l'apprenti deux fois.
- **Les identifiants de badges ne sont pas filtrés.** Le catalogue complet (dont
  DOMPTEUR DE BERTHA, qui n'appartient à aucune épreuve) arrive en T13 ; le
  store se contente de stocker la source, `auto` ou `honneur`.
- **Le déblocage reste séquentiel.** Une épreuve s'ouvre quand la précédente est
  validée. Les conditions d'échelon du livret sont des conséquences de ces
  validations, pas des verrous supplémentaires : les cumuler fermerait des
  salles que le corpus déclare ouvertes.
- **`etatEpreuve()` rend les quatre états de salle** de La Carte (verrouillée,
  disponible, en cours, validée) : ouvrir un sujet suffit à passer « en cours »,
  ce que le design attend des salles visitées.

Constat relevé par les tests, à garder pour T13 : le septième échelon exige
4 500 XP alors que la somme de tous les barèmes de base ne pèse que 4 210 XP. Ce
barreau n'est donc atteignable qu'avec des bonus ou des quiz du soir. Ce n'est
pas un écart du manifeste (les deux tableaux du livret sont recopiés fidèlement)
mais une exigence du livret lui-même, à afficher clairement au Livret.

Vérification. Aux tests unitaires s'ajoute une vérification de bout en bout :
l'autotest Electron (`CQ_AUTOTEST=1`, le protocole interdit les serveurs) charge
l'interface compilée, lit le fichier de progression, clique le témoin de la
coque, attend l'amortissement, relit le fichier et compare. Deux passages
consécutifs sortent en 0 : la progression est écrite puis relue au lancement
suivant, ce qui est exactement le parcours exigé au §10. Le fichier d'essai a
été retiré du dossier utilisateur après contrôle.

Aucun test de `useProgression.js` : il faudrait `@testing-library/react`, hors
de la liste du §2. Le crochet est mince et sans logique propre ; la logique est
dans les deux modules testés, et son intégration réelle est couverte par
l'autotest Electron.

Fichiers touchés : `app/src/store/progression.js` (nouveau),
`app/src/store/progression.test.js` (nouveau), `app/src/store/persistance.js`
(nouveau), `app/src/store/persistance.test.js` (nouveau),
`app/src/store/useProgression.js` (nouveau), `app/src/data/programme.js`
(recensement des épreuves à quiz), `app/src/data/programme.test.js`,
`app/src/App.jsx`, `app/src/styles/base.css`, `app/electron/main.cjs`,
`ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`. Aucune dépendance ajoutée.

Verdict : `npx vitest run` vert (4 fichiers, 93 tests), `npm run build` vert
(57 modules, JS 323,44 ko, CSS 6,07 ko), autotest Electron vert (sortie 0).

Commits créés :
- `app: recenser dans le manifeste les epreuves a quiz du soir`
- `app: poser le store de progression (etat, selecteurs, actions)`
- `tests: couvrir XP, seuils, deblocage, echelons, quiz et export/import`
- `app: brancher la progression sur l'IPC (debounce 500 ms, repli memoire)`
- `tests: couvrir la persistance amortie et son repli memoire`
- `app: montrer echelon, XP et epreuve du moment dans la coque provisoire`
- `electron: verifier le rendu et l'aller-retour de progression dans l'autotest`
- `doc: consigner l'iteration T07`

## T08 - Le gabarit de la coque et les 6 écrans

La coque provisoire disparaît au profit du gabarit défini par `design/` : barre
latérale de 248 px à gauche, barre d'outils unifiée de 52 px en haut, contenu
défilant entre les deux. C'est le point 7 des notes d'intégration (« sacré : la
coque macOS »), et c'est ce qui fait « app » plutôt que « page web ».

**La barre latérale.** De haut en bas : une bande de 52 px laissée vide, puis le
bloc d'identité (CGBA · 1962 / Cobol Quest / Opération Marcel), les 6 items de
navigation et la carte de profil ancrée en bas. La bande du haut est vide à
dessein : `titleBarStyle: 'hiddenInset'` (posé en T04) fait dessiner les vrais
feux par macOS à cet endroit, on leur réserve la place et on rend la zone
déplaçable. Les compteurs mono des items sont tous dérivés du store : nombre de
salles débloquées pour La carte, identifiant de l'épreuve du moment pour Le
sujet, nombre de décorations pour Le livret. La carte de profil affiche le titre
de l'échelon courant, la jauge vers l'échelon suivant et les XP en ambre ;
l'avatar porte le numéro d'échelon plutôt que des initiales, le corpus ne
nommant pas l'apprenti. Le matricule (4417) est repris de la maquette.

**La navigation.** Elle vit dans `src/ui/ecrans.js`, un module pur : le même
tableau fixe l'ordre de la barre latérale, les titres de la barre d'outils, les
largeurs de contenu et les raccourcis Cmd+1 à Cmd+6. Un seul endroit à corriger
si l'ordre bouge, et il se teste sans DOM (8 tests). L'état de navigation reste
en mémoire, il n'est pas persisté : c'est `epreuveOuverte` qui porte la mémoire
utile, et elle est déjà dans le fichier.

**Le thème et les effets.** La racine pose deux attributs sur `<html>` :
`data-sombre` et `data-effets`, tous deux lus dans les réglages du store. Tout le
reste est du CSS, conformément à la règle sacrée du design (aucune couleur en
dur dans un composant). Le bouton lune/soleil de la barre d'outils écrit dans le
réglage, donc dans le fichier de l'utilisateur.

**Arbitrage : les « scanlines ».** Le §5.6 du cahier des charges exige un
interrupteur scanlines, hérité de la direction artistique de repli (§7) ; le
design déposé, qui fait loi pour tout le visuel, interdit au contraire « aucun
dégradé, aucun néon, aucun fond animé » et cantonne le phosphore aux objets
sombres. Les deux se concilient ainsi : l'interrupteur existe et gouverne les
effets de phosphore, mais il ne touche **que** les objets sombres, jamais la
page - clignotement du curseur de console (1060 ms), pulsation de la pastille
BERTHA (2400 ms) et fin balayage horizontal à l'intérieur des blocs `.console`.
`prefers-reduced-motion` coupe les deux animations d'office. Le câblage est
complet ; l'écran qui expose l'interrupteur arrive en T17.

**Les 6 écrans.** Chacun a son fichier dans `src/ecrans/` avec son en-tête
définitive (label mono, titre en casse de phrase, chapô) et un bloc de chantier
qui nomme la tâche qui le remplira. Le bloc n'est pas un carré vide : il montre
la commande BERTHA de l'épreuve du moment dans une vraie console, ce qui met à
l'épreuve dès maintenant l'objet sombre et son curseur.

**Vérification.** Les serveurs étant interdits par le protocole, le rendu réel
passe par l'autotest Electron, réécrit pour la nouvelle coque : il compte les 6
items de navigation, clique sur le deuxième et vérifie que le titre de la barre
d'outils passe de « Le terminal » à « La carte », lit la carte de profil, puis
bascule le thème et contrôle que ce réglage descend jusqu'au fichier. Un second
clic remet le thème comme il était : contrairement à la version T07, l'autotest
ne laisse plus de trace dans la progression de l'utilisateur.

Fichiers touchés : `app/src/ui/ecrans.js`, `app/src/ui/ecrans.test.js`,
`app/src/ui/contexte.js`, `app/src/ui/Coque.jsx`, `app/src/ui/BarreLaterale.jsx`,
`app/src/ui/BarreOutils.jsx`, `app/src/ui/Ecran.jsx`, `app/src/ui/Console.jsx`
(tous nouveaux), `app/src/ecrans/Chantier.jsx`, `Terminal.jsx`, `Carte.jsx`,
`Lecteur.jsx`, `Quiz.jsx`, `Livret.jsx`, `Reglages.jsx` (tous nouveaux),
`app/src/styles/coque.css` et `app/src/styles/composants.css` (nouveaux),
`app/src/App.jsx` (réécrit), `app/src/styles/base.css` (styles provisoires
retirés, halo de focus ajouté), `app/src/styles/tokens.css` (un token ajouté :
`--puce-active`, la puce de l'item de nav actif), `app/electron/main.cjs`
(autotest), `ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`. Aucune dépendance ajoutée.

Verdict : `npm run build` vert (46 modules, JS 176,19 ko, CSS 11,80 ko - le JS
maigrit parce que le corpus n'est plus importé par la coque, il reviendra avec
le lecteur en T11), `npx vitest run` vert (5 fichiers, 101 tests), autotest
Electron vert (sortie 0).

Commits créés :
- `app: poser le gabarit de la coque et les 6 ecrans`
- `tests: verrouiller le registre des ecrans et les raccourcis clavier`
- `electron: controler la coque et la bascule de theme dans l autotest`
- `doc: consigner l'iteration T08`

## T09 - L'écran LE TERMINAL branché sur le store

**La tâche.** Remplir le tableau de bord du §5.1 : échelon et titre CGBA, barre
d'XP vers l'échelon suivant, épreuve en cours avec bouton « reprendre », trois
derniers badges, citation de Marcel piochée dans les sujets, rappel de la
commande BERTHA du moment.

**Le principe tenu.** L'écran ne calcule rien. Un module pur de plus,
`src/ui/tableauDeBord.js`, dérive tout de l'état (comme `ui/ecrans.js` pour la
navigation) et se teste sans monter un seul composant : `epreuveDuMoment`,
`dernieresDecorations`, `salles`, `releveDeService`, `carriere`. `Terminal.jsx`
n'est plus que de la mise en page.

**Trois arbitrages.**
1. *Où mettre la barre d'XP.* Le cahier des charges l'exige sur le Terminal, la
   maquette ne la dessine que dans la carte de profil de la barre latérale. Elle
   entre donc dans la carte de service de droite, en tête du « relevé de
   service » que les notes d'intégration déclarent sacrifiable : même idiome de
   carte, aucun composant inventé, échelon + jauge + XP + ce qu'il reste à
   gagner avant le barreau suivant.
2. *Comment jauger l'épreuve en cours.* En XP d'exercices contre le seuil du
   jour (le quiz, lui, ne fait pas franchir un seuil : règle tranchée en T07).
   La phase 3, que BERTHA ne juge pas, se compte en jalons cochés, et sa console
   affiche qu'elle se valide sur l'honneur au lieu d'une commande.
3. *Le glyphe des médailles.* Le design donne un glyphe par badge ; le catalogue
   des badges est le sujet de T13. En attendant, un signe unique
   (`GLYPHE_DECORATION`) plutôt qu'un signe faux. Le nom, lui, est exact :
   `src/data/badges.js` le reconstruit à partir de l'identifiant, et son test
   vérifie les 25 badges du manifeste contre le livret.

**La commande BERTHA du moment** est celle du premier exercice non coché de
l'épreuve en cours, ou du dernier de la liste quand tout est fait : il y a
toujours quelque chose à copier. Le bouton « COPIER » de la console passe à
« COPIE » pendant 2 secondes.

**États vides.** Aucune décoration au départ : au lieu de trois tuiles grises,
une phrase dans un encart pointillé. L'épreuve du moment, elle, n'est jamais
vide (le store rend J00 sur un état neuf).

**Vérification.** L'autotest Electron lit le tableau de bord avant de quitter
l'écran : code de l'épreuve, libellé du bouton de reprise, commande BERTHA, mémo
de Marcel, relevé de service. Il ne clique sur rien dans cet écran, précisément
pour ne rien écrire dans la progression de l'utilisateur (un clic sur
« Reprendre » retiendrait l'épreuve ouverte).

Fichiers touchés : `app/src/data/citations.js` et `citations.test.js`,
`app/src/data/badges.js` et `badges.test.js`, `app/src/ui/tableauDeBord.js` et
`tableauDeBord.test.js`, `app/src/ui/format.js` et `format.test.js` (tous
nouveaux), `app/src/ecrans/Terminal.jsx` (réécrit),
`app/src/styles/terminal.css` (nouveau), `app/src/styles/composants.css`
(boutons primaire, lien et console), `app/src/styles/base.css` (import),
`app/src/ui/BarreLaterale.jsx` (son séparateur de milliers part dans
`format.js`), `app/electron/main.cjs` (autotest), `ETAT_APP.md`,
`JOURNAL_CONSTRUCTION.md`. Aucune dépendance ajoutée.

Verdict : `npm run build` vert (75 modules, JS 337,67 ko, CSS 15,94 ko - le
corpus revient dans le bundle avec les citations), `npx vitest run` vert
(9 fichiers, 135 tests), autotest Electron vert (sortie 0).

Commits créés :
- `app: piocher les citations des sujets dans le corpus`
- `app: nommer les badges d apres le livret`
- `app: partager le formatage des milliers`
- `app: derouler les donnees du tableau de bord`
- `app: brancher l ecran LE TERMINAL sur le store`
- `electron: lire le tableau de bord dans l autotest`
- `doc: consigner l'iteration T09`

## T10 - L'écran LA CARTE, le plan des sous-sols

**La tâche.** Dessiner le §5.2 : le couloir de la piscine (J00 à J10, les deux
rushs en salles latérales), les bureaux des missions (M01 à M06), la salle
machine IBM de la phase 3, les quatre états de salle des maquettes, et le clic
qui ouvre le lecteur.

**Le principe tenu.** Comme pour le Terminal, l'écran ne décide rien. Un module
pur de plus, `src/ui/carte.js`, dérive de l'état ce qu'est une salle (état,
étiquette, tampon, XP, annonce, ouvrable) et range les 19 épreuves en quatre
groupes : `couloirPiscine`, `sallesRush`, `bureauxMissions`, `salleMachine`.
`Carte.jsx` ne fait que poser des tuiles. Les quatre états, sacrés selon la note
d'intégration 6, tiennent dans un seul attribut `data-etat` porté aussi bien par
une tuile que par la puce de la légende : fond, bordure et étiquette se lisent
au même endroit, une seule source de vérité visuelle. Le store fournissait déjà
`etatEpreuve` depuis T07, rien n'a été réinventé.

**Trois arbitrages.**
1. *Ce que porte le tampon.* La maquette écrit « VALIDE +180 », c'est-à-dire le
   barème de la salle. Le tampon porte ici les XP RÉELLEMENT gagnés, quiz du
   soir compris : c'est ce qui rend la progression tangible, et deux apprentis
   n'ont pas le même chiffre sur la même salle. Conséquence traitée : la phase 3
   ne rapporte aucun XP, son tampon se contente de « VALIDE » sans chiffre.
2. *Ce que fait un clic sur une salle fermée.* La maquette répond par un toast
   « BERTHA DIT NON ». Le toast (design 6.6) n'existe pas encore et n'est le
   sujet d'aucune tâche avant la feuille de route : une salle verrouillée est
   donc un bouton `disabled` dont l'infobulle, qui est aussi son `aria-label`,
   dit quelle épreuve l'ouvre (« validez d'abord J01 »). L'information est là,
   sans inventer un composant hors design.
3. *Une salle validée reste cliquable.* La maquette y répond « DEJA VALIDEE » ;
   le cahier des charges dit « Clic → lecteur ». Le cahier des charges tranche :
   on peut toujours revenir relire un sujet.

**Deux ajouts partagés.** `EnteteEcran` gagne un emplacement `aside` (aligné sur
le bas du titre) pour la légende des quatre états ; `tokens.css` gagne le rayon
de tuile `--r-tuile: 9px` et `--console-glyphe: #5f7a63`, le gris-vert du glyphe
de la salle machine, qui manquait à la famille phosphore. Aucune couleur en dur
n'entre dans un composant.

**Le découpage du plan.** Les 13 épreuves de la piscine se lisent en 11 journées
dans le couloir et 2 rushs dans la colonne latérale de 148px bordée de
pointillés, exactement comme la maquette. Un test vérifie que les quatre groupes
couvrent les 19 épreuves du programme sans doublon : aucune salle ne peut être
oubliée en chemin.

**Vérification.** L'autotest Electron lit le plan après avoir navigué dessus :
19 tuiles, 4 puces de légende, des états tous connus, au moins une salle
ouvrable, et le bandeau « PHASE 3 · ». Il ne clique sur aucune salle, pour la
même raison qu'en T09 : ouvrir une salle retiendrait l'épreuve ouverte dans la
progression de l'utilisateur.

Fichiers touchés : `app/src/ui/carte.js` et `carte.test.js` (nouveaux),
`app/src/ecrans/Carte.jsx` (réécrit), `app/src/styles/carte.css` (nouveau),
`app/src/styles/base.css` (import), `app/src/ui/Ecran.jsx` et
`app/src/styles/coque.css` (l'emplacement `aside`), `app/src/styles/tokens.css`
(deux tokens), `app/electron/main.cjs` (autotest), `ETAT_APP.md`,
`JOURNAL_CONSTRUCTION.md`. Aucune dépendance ajoutée.

Verdict : `npm run build` vert (76 modules, JS 341,66 ko, CSS 20,59 ko),
`npx vitest run` vert (10 fichiers, 150 tests), autotest Electron vert
(sortie 0, « plan 19 salles »).

Commits créés :
- `app: derouler le plan des sous-sols`
- `app: poser un complement a droite de l entete d ecran`
- `design: ajouter le rayon de tuile et le glyphe de console`
- `app: brancher l ecran LA CARTE sur le store`
- `electron: lire le plan des sous-sols dans l autotest`
- `doc: consigner l'iteration T10`

## T11 - L'écran LE SUJET, le lecteur de markdown

**La tâche.** Rendre lisible le §5.3 : le texte du sujet dans une colonne de
lecture conforme au design (68ch, corps 17px, interligne 1.75), le code sur
fond sombre, les tableaux propres, et la navigation vers la salle précédente ou
suivante. La feuille de route latérale reste pour T12.

**Deux dépendances, prévues au contrat.** `react-markdown` et `remark-gfm` sont
tous deux dans la liste autorisée du §2 : aucune justification supplémentaire
n'était requise, l'installation s'est faite telle quelle. Le rendu se fait donc
sans HTML brut interprété (défaut de react-markdown) et le corpus n'en contient
d'ailleurs pas.

**Le principe tenu.** Un module pur de plus, `src/ui/lecteur.js` : il détache
l'en-tête du markdown (`decouperSujet`), écrit l'adresse de la salle
(`adresseEpreuve`), compose les repères de la ligne grise (`reperesEpreuve`),
assemble la fiche à lire (`ficheLecture`) et désigne les deux épreuves voisines
(`voisines`). L'écran ne fait que poser le résultat, et `src/ui/Markdown.jsx` ne
fait qu'habiller chaque élément d'une classe : toute la mise en forme est dans
`styles/lecteur.css`, où les couleurs viennent des tokens.

**Trois arbitrages.**
1. *L'en-tête du sujet.* Les vingt sujets du corpus commencent par la même
   paire : un titre de niveau 1 puis une ligne de niveau 3 qui annonce la durée
   et les XP. Le lecteur repose ces deux lignes dans sa propre typographie
   (label mono, titre 32px, repères, précision) ; les laisser dans le corps les
   afficherait deux fois. Le sous-titre n'est retiré que si le titre l'a été, et
   un niveau 1 qui resterait dans le corps redescend en niveau 2 : le titre de
   la page est celui de l'écran, pas celui du fichier.
2. *L'enveloppe.* Les cinq autres écrans passent par `ui/Ecran.jsx` et sa
   colonne centrée. Le lecteur a deux volets (1fr + 340px) et ses propres marges
   (44px / 48px / 80px, §3 du design) : il pose sa grille lui-même. Le registre
   `ui/ecrans.js` l'annonçait déjà avec `largeur: null` depuis T08 ; seul le
   commentaire de `Ecran.jsx` a été corrigé.
3. *Le bord verrouillé.* La salle suivante peut ne pas être ouverte. Comme sur
   La Carte, elle reste annoncée (identifiant, titre, et l'épreuve à valider
   d'abord dans l'infobulle qui sert aussi d'`aria-label`) mais son bouton est
   `disabled`, gris et en pointillés, jamais un vert atténué (règle 6 du §7).

**Le sombre reste rare.** Note d'intégration 3 : dans le sujet, seul le bloc de
code passe sur `--console`. Le code en ligne est une puce claire, le mémo de
Marcel une citation sur la surface d'en-tête (design 6.11), les tableaux un
cadre clair zébré de vert (6.12). react-markdown ne dit pas si un `code` est en
ligne ou en bloc : les deux reçoivent la même classe de puce, que le CSS
neutralise à l'intérieur du bloc sombre. Sous 1180px de large, la feuille de
route passe sous la colonne de lecture (note 10).

**Vérification.** Deux fichiers de tests. `lecteur.test.js` contrôle le
découpage sur les vingt sujets du corpus, les repères, la fiche et les voisines.
`Markdown.test.jsx` rend le markdown par `renderToStaticMarkup` (pas de DOM
nécessaire) : classes du bloc de code, de la puce, du cadre de tableau, de la
citation, ouverture des liens hors de la fenêtre, puis rendu des vingt sujets
sans un mot sur `console.error`. L'autotest Electron lit ensuite l'écran réel :
adresse, titre, repères, paragraphes rendus, largeur de colonne bornée, deux
bords. Il ne clique que sur l'item de navigation, donc n'écrit rien dans la
progression de l'utilisateur.

**Dette assumée.** Le bundle passe de 342 ko à 505 ko (167 ko gzip) : c'est le
prix de react-markdown et de sa chaîne remark/rehype. Vite avertit au-delà de
500 ko ; pour une application hors-ligne chargée en `file://`, sans réseau,
l'avertissement est sans conséquence et le découpage en morceaux n'apporterait
rien. À revoir seulement si le démarrage devenait perceptible.

Fichiers touchés : `app/src/ui/lecteur.js`, `app/src/ui/lecteur.test.js`,
`app/src/ui/Markdown.jsx`, `app/src/ui/Markdown.test.jsx`,
`app/src/styles/lecteur.css` (nouveaux), `app/src/ecrans/Lecteur.jsx` (réécrit),
`app/src/styles/base.css` (import), `app/src/styles/tokens.css` (largeur du
volet et marges du lecteur), `app/src/ui/Ecran.jsx` (commentaire),
`app/electron/main.cjs` (autotest), `app/package.json` et
`app/package-lock.json` (deux dépendances), `ETAT_APP.md`,
`JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (330 modules, JS 504,69 ko, CSS 25,37 ko),
`npx vitest run` vert (12 fichiers, 172 tests), autotest Electron vert
(sortie 0, « sujet 11 paragraphes, 5 blocs de code »).

Commits créés :
- `app: ajouter react-markdown et remark-gfm`
- `app: derouler le sujet a lire dans un module pur`
- `app: rendre le markdown du corpus`
- `design: habiller la colonne de lecture et ses deux volets`
- `app: brancher l ecran LE SUJET sur le lecteur`
- `electron: lire le sujet du moment dans l autotest`
- `doc: consigner l iteration T11`

---

## T12 - La feuille de route, le volet qui se coche

**La tâche.** Remplir le volet de droite du lecteur : les cases des exercices
et des bonus, les XP crédités ou retirés, la jauge du seuil avec son passage
« VALIDÉ », et l'encart de la commande BERTHA (cahier des charges, §5.3).

**Un module pur de plus.** `src/ui/feuilleDeRoute.js` suit la règle posée
depuis T08 : tout ce que le volet affiche se dérive de l'état et du manifeste,
l'écran ne fait que poser des lignes. Il expose une ligne d'exercice, la jauge
du seuil, l'encart BERTHA, le verdict du toast, et l'objet complet.

**Quatre arbitrages.**

1. *La piste de la jauge vaut le barème des exercices obligatoires*, pas le
   barème total. Cocher tous les bonus de J01 rapporte bien 125 XP, mais la
   barre s'arrête à 100 % : le repère ambre du seuil reste ainsi à sa place
   (70 XP sur 95, soit 74 %, très près des 71 % de la maquette) au lieu d'être
   écrasé vers la gauche par des bonus facultatifs. La phase 3, qui n'a ni XP
   ni moulinette, se jauge en jalons cochés.
2. *Le remplissage est ambre tant que le seuil n'est pas franchi*, vert après :
   c'est la lecture du design 6.3 (« vert = progression validée, ambre =
   épreuve en cours ») appliquée à une seule et même barre.
3. *L'encart BERTHA porte la commande du prochain exercice à rendre*, et celle
   du dernier quand tout est coché. La maquette y montrait un compte rendu de
   compilation (« RC=0000, temps CPU 0,42 s ») que l'application ne peut pas
   inventer : elle ne parle pas à la vraie moulinette. La forme sombre est
   gardée, le contenu devient celui qu'exige le cahier des charges.
4. *Le toast arrive avec la feuille de route*, comme annoncé en T10. Le design
   l'impose à chaque bascule (6.2) : sans lui, cocher un exercice à 10 XP ne
   se voit pas, la jauge bougeant de trois pixels. Il vit dans la coque,
   `App.jsx` tient son état, et un numéro d'ordre force le remontage pour que
   l'animation reparte même sur deux verdicts identiques.

**Un défaut corrigé en chemin.** Le lecteur affichait `epreuveCourante`, qui
saute les épreuves validées pour le bouton « reprendre » du Terminal. Dès que
la feuille de route a su valider, cocher la dernière case remplaçait le texte
par le sujet suivant sous les yeux du lecteur. `ui/lecteur.js` gagne donc
`epreuveLue` : le sujet ouvert reste sur le pupitre tant qu'il est débloqué,
validé ou non, exactement comme sa salle reste cliquable sur La Carte. Et
comme ce verrou n'a de sens que si l'épreuve ouverte est retenue, l'écran
l'enregistre à l'arrivée : entrer par la barre latérale (Cmd+3) est une
ouverture de sujet comme une autre.

**Accessibilité.** La case dessinée est décorative ; la vraie case reste dans
le DOM, invisible mais focusable, et c'est la ligne qui porte le halo de
focus. La jauge est une `progressbar` avec son `aria-valuetext` en clair
(« 70 XP, seuil à 70 XP »), le toast un `role="status"` qui ne vole pas le
focus.

**L'autotest Electron** ne se contente plus de lire : il coche la première
case, relève le toast, la jauge et le total, puis décoche pour rendre la
progression exactement comme il l'a trouvée. Seule trace laissée : l'épreuve
ouverte, que l'écran enregistre désormais à l'arrivée.

Fichiers touchés : `app/src/ui/feuilleDeRoute.js`,
`app/src/ui/feuilleDeRoute.test.js`, `app/src/ui/Toast.jsx`,
`app/src/ecrans/FeuilleDeRoute.jsx` (nouveaux), `app/src/ecrans/Lecteur.jsx`,
`app/src/ui/lecteur.js`, `app/src/ui/lecteur.test.js`, `app/src/App.jsx`,
`app/src/ui/Coque.jsx`, `app/src/ui/contexte.js`,
`app/src/styles/lecteur.css`, `app/src/styles/composants.css`,
`app/electron/main.cjs`, `ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (JS 509,85 ko, CSS 29,66 ko),
`npx vitest run` vert (13 fichiers, 200 tests), autotest Electron vert
(sortie 0, « feuille de route 1 case dont 0 bonus, cochee puis rendue »).

Commits créés :
- `app: deriver la feuille de route dans un module pur`
- `app: annoncer les verdicts de BERTHA par un toast`
- `design: habiller la feuille de route du lecteur`
- `app: garder le lecteur sur le sujet ouvert une fois valide`
- `app: brancher la feuille de route sur le store`
- `app: retenir le sujet ouvert depuis la barre laterale`
- `electron: cocher la feuille de route dans l autotest`
- `doc: consigner l iteration T12`

## T13 - Les décorations et le livret de carrière

**La tâche.** Les badges automatiques et ceux « sur l'honneur » (§5.5), puis
l'écran LE LIVRET : la grille des décorations et le tableau des neuf échelons
avec l'état courant.

**Le catalogue.** `app/src/data/badges.js` ne portait qu'une règle de nommage ;
il devient le catalogue des 26 décorations du livret, dans son ordre : nom,
glyphe de médaille, épreuve qui la met en jeu, condition affichée, et la règle
que l'application sait mesurer. Le contrôle croisé est fait avec la fin de
barème de chaque sujet, qui est plus précise que le livret : `MAÎTRE DES
REGISTRES` vaut pour J05 ex04+ex05+ex06, `GARDIEN DES CLÉS` pour J08 ex00 à
ex05, `L'ARCHITECTE` pour J09 ex04+ex05, et ainsi de suite. Un seul badge,
`DOMPTEUR DE BERTHA`, n'appartient à aucune épreuve : il couronne la piscine
entière, et aucune ligne du manifeste ne le portait.

**L'arbitrage central : qui accorde le badge.** Un badge est automatique quand
sa condition s'exprime ENTIÈREMENT dans ce que l'application observe, c'est-à-
dire des exercices cochés (donc passés par BERTHA) et des XP. Dès que le sujet
ajoute un critère que seul l'apprenti peut constater, la case reste à cocher à
la main. Cinq badges tombent de ce côté : `COLONNE 7` (une erreur de colonne
comprise), `CHASSEUR DE TRONCATURES` (les prédictions justes à l'intérieur de
l'ex01), `LA VOIE DU 88` (aucun littéral dans la PROCEDURE), `TUEUR DE GO TO`
(une journée sans un seul GO TO) et `DOMPTEUR DE BERTHA` (dix exercices verts
du premier coup). Les vingt et un autres se mesurent.

**L'arbitrage technique : un badge mesurable ne s'écrit pas.** Le store ne
stocke plus que les badges DÉCLARÉS. `badgeMerite(etat, id)` évalue la règle du
catalogue, `badgeObtenu` répond « déclaré OU mérité ». La progression reste
donc canonique (rien à réconcilier, aucun état périmé) et la décoration se
reprend d'elle-même si la case de l'exercice retombe. Conséquence assumée : il
n'y a plus de chronologie d'attribution, donc « les 3 dernières décorations »
du Terminal se lisent maintenant dans l'ordre du livret, qui dit à peu près la
même chose puisque le programme est séquentiel. `basculerBadge` refuse un badge
mesurable : la souris ne s'accorde pas ce que BERTHA doit donner.

**L'écran.** Un module pur de plus, `app/src/ui/livret.js` (tuiles, compte,
lignes d'échelon, verdict du toast) ; `app/src/ecrans/Livret.jsx` pose deux
colonnes comme la maquette, le mur des médailles à gauche en trois par rangée
et la grille des échelons à droite dans sa carte de 360 px. Trois décisions de
mise en page : la tuile inerte est un `div` et la tuile « sur l'honneur » un
`button` (même boîte, mais seul ce qui se clique est un bouton et porte son
`aria-pressed`) ; chaque tuile porte une mention en bas qui dit QUI accorde la
décoration, sans quoi rien ne distingue une case cochable d'une case qui
attend BERTHA ; la colonne des seuils passe au vert quand les XP sont tenus,
pour qu'un barreau qui n'attend plus que sa condition de passage se voie. Sous
1200 px, la grille des échelons passe sous le mur.

Fichiers touchés : `app/src/data/badges.js`, `app/src/data/badges.test.js`,
`app/src/store/progression.js`, `app/src/store/progression.test.js`,
`app/src/ui/livret.js`, `app/src/ui/livret.test.js` (nouveaux),
`app/src/ecrans/Livret.jsx`, `app/src/styles/livret.css` (nouveau),
`app/src/styles/base.css`, `app/src/ui/tableauDeBord.js`,
`app/src/ui/tableauDeBord.test.js`, `app/src/ecrans/Terminal.jsx`,
`app/electron/main.cjs`, `ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (JS 518,22 ko, CSS 32,85 ko),
`npx vitest run` vert (14 fichiers, 222 tests), autotest Electron vert
(sortie 0, « livret 26 medailles dont 0 obtenues, 9 echelons, decoration
accordee puis rendue »).

Commits créés :
- `app: le catalogue des 26 decorations du livret`
- `app: attribuer les badges mesurables sans les stocker`
- `app: l ecran LE LIVRET, decorations et echelons`
- `electron: verifier le livret dans l autotest`
- `app: donner au terminal les medailles du catalogue`
- `doc: consigner l iteration T13`

## T14 - Les cinq premiers quiz du soir

Tâche : rédiger le contenu des quiz de J01 à J05, 8 QCM par épreuve, quatre
choix, correction commentée, au moins deux questions par quiz sur les sorties
exactes ou les colonnes (cahier des charges, §5.4). L'écran qui les fera passer
arrive en T16 : cette itération ne livre que la matière et le module qui la
sert.

Forme retenue : un fichier JSON par épreuve dans `app/src/data/quiz/`, nommé par
l'identifiant de l'épreuve, contenant `epreuve`, `titre` et huit questions
`{ id, categorie, enonce, choix, bonne, commentaire }`. `bonne` est le rang du
bon choix (0 à 3) plutôt que son texte : une seule source de vérité, et une
copie se note par comparaison d'entiers. `data/quiz.js` les embarque par
`import.meta.glob('./quiz/*.json', { eager: true })`, exactement comme le corpus
en T03 : aucune lecture disque à l'exécution, donc un comportement identique en
dev et dans le `.app`.

Trois décisions. La première : chaque question porte une `categorie`, `sortie`
pour celles qui interrogent une sortie exacte ou une largeur de colonne, `memo`
pour les autres. Le quota du cahier des charges devient ainsi mesurable, et le
test le fait respecter ; les quiz livrés en portent trois chacun, quatre pour
J02. La deuxième : aucune question ne sort d'une culture générale du COBOL,
toutes se répondent avec le mémo du jour ou une sortie attendue du sujet, et le
commentaire de correction dit d'où vient la réponse (les 14 espaces d'une
`PIC X(20)` qui reçoit MARCEL, les 120 caractères du FILLER des 8 agences, le
`DEPASSEMENT DE CAPACITE A N = 21` de la factorielle). La troisième : la
notation vit ici, dans `noterCopie`, et non dans le futur écran, pour être
testée sans React ; une case laissée vide compte comme une erreur, ce qui rend
le score honnête même sur une copie abandonnée en route.

Fichiers touchés : `app/src/data/quiz/J01.json` à `J05.json` (nouveaux),
`app/src/data/quiz.js` (nouveau), `app/src/data/quiz.test.js` (nouveau),
`ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (JS 518,22 ko, CSS 32,85 ko),
`npx vitest run` vert (15 fichiers, 257 tests).

Commits créés :
- `quiz: les huit QCM du soir de J01 a J05`
- `app: embarquer les quiz du soir et noter les copies`
- `tests: controler la forme des quiz du soir`
- `doc: consigner l iteration T14`

## T15 - Les six derniers quiz du soir

Tâche : rédiger les quiz de J06, J07, J08, J09, RUSH01 et RUSH02, aux mêmes
règles qu'en T14 (8 QCM, quatre choix, correction commentée, au moins deux
questions par quiz sur les sorties exactes ou les colonnes). Avec eux, les onze
épreuves que `programme.js` déclare à quiz sont couvertes ; l'écran qui les fera
passer reste à T16.

Rien de nouveau côté code : les six fichiers rejoignent `app/src/data/quiz/` et
le glob de `data/quiz.js` les prend sans une ligne de plus. La matière vient des
mémos et des sorties attendues, comme en T14. Les cinq journées se révisent sur
ce qu'elles ont d'irréductible : la tranche `WS-IBAN(5:19)` et le `07` du
compteur de voyelles pour J06 ; les 400 octets de `clients.dat` (8 x 49 plus 8
fins de ligne), la décimale implicite de `001234550` et le statut 35 pour J07 ;
le `0 COMPTES A LAGOS` TRIMé et le chargeur rejouable par OPEN OUTPUT pour J08 ;
l'ordre du tri multi-clés et la moyenne 167792.33 pour J09.

Trois décisions. La première : les deux rushs n'ont pas de mémo, donc leur quiz
se construit sur leur barème et sur leurs cas pièges officiels. RUSH01 fait
recalculer les deux pièges du sujet (secret 1123 contre essai 1211, secret 2416
contre essai 4444), qui sont exactement ce que la table de marquage vient
régler ; RUSH02 fait retrouver les trois chiffres que Josiane demande de
vérifier avant BERTHA (la semaine 04 de Marcel à 1856.25, sa prime plafonnée à
675.00, la cotisation de Josiane arrondie à 895.36). La deuxième : les questions
de sortie ne se contentent pas de demander la bonne ligne, leurs distracteurs
sont les erreurs réelles du sujet (la semaine entièrement majorée à 2250.00, la
prime non plafonnée à 1080.00, la troncature à 895.35, le sous-total du dernier
groupe oublié). Une réponse fausse apprend donc quelque chose. La troisième :
le test de couverture ne compare plus les fichiers présents à une liste de
commodité, il exige l'égalité avec `idsAvecQuiz` ; si une épreuve gagne un quiz
au programme sans que le JSON suive, la suite tombe.

Fichiers touchés : `app/src/data/quiz/J06.json`, `J07.json`, `J08.json`,
`J09.json`, `RUSH01.json`, `RUSH02.json` (nouveaux), `app/src/data/programme.js`
(le commentaire d'`idsAvecQuiz`, qui annonçait un contenu à venir),
`app/src/data/quiz.test.js`, `ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (JS 518,22 ko, CSS 32,85 ko),
`npx vitest run` vert (15 fichiers, 287 tests).

Commits créés :
- `quiz: les six QCM du soir de J06 a RUSH02`
- `tests: etendre le controle des quiz aux onze epreuves`
- `doc: consigner l iteration T15`

## T16 - L'écran du quiz du soir

Tâche : la seizième d'`ETAT_APP.md`, l'écran LE QUIZ DU SOIR (cahier des
charges, §5.4) : le déroulé des 8 QCM, la correction commentée après chaque
réponse, les +10 XP au seuil de 6/8, crédités une seule fois par épreuve alors
que les re-tentatives restent libres. Le contenu des onze quiz était écrit en
T14 et T15 ; il ne manquait que la salle où on les passe.

Le partage est celui des cinq écrans précédents. Un module pur de plus,
`src/ui/quiz.js`, décide tout : la copie et son remplissage, le sommaire des
onze séances avec leur état, la question à l'écran (quatre choix, quatre états
de choix, la correction), le relevé final et les deux toasts.
`src/ecrans/Quiz.jsx` ne fait que poser le résultat, tenir la copie en cours et
rendre la note au store.

Cinq décisions.

La première : la copie ne se sauvegarde pas. Elle vit en état local, le temps
de la visite. Une séance abandonnée à la quatrième question ne laisse donc rien
au dossier ; seule une copie menée au bout compte. C'est ce que dit le cahier
des charges en ne stockant qu'un `meilleurScore` et un `xpCredite`, pas une
copie en cours, et c'est cohérent avec l'objet : le quiz du soir est une
révision, pas un examen à surveiller.

La deuxième : la note part au dossier dès la huitième réponse posée, et non au
clic sur « Voir le résultat ». Une séance menée au bout compte même si l'écran
se ferme avant le relevé. Le store, lui, ne crédite les 10 XP qu'une fois
(`enregistrerQuiz`), donc rien à protéger de ce côté.

La troisième : une réponse posée ne se corrige plus. Le clic révèle la bonne
réponse et le commentaire ; revenir en arrière viderait la correction de son
sens. Les quatre boutons passent en `disabled`, la bonne réponse se marque en
vert, celle qu'on a prise en rouge si elle est fausse, les deux autres
s'éteignent.

La quatrième : le sommaire des onze séances est ajouté à la maquette. Elle
montre un quiz déjà choisi, mais l'écran s'atteint par la barre latérale et par
Cmd+4, sans passer par un sujet : il faut donc pouvoir dire de quelle journée
on révise le mémo. Le sommaire est une ligne de pastilles mono aux codes
d'épreuve, avec les couleurs de statut du design (verte pour une séance
réussie, ambre pour une séance à repasser, grisée et pointillée pour une séance
verrouillée). La séance proposée en arrivant est celle du sujet posé sur le
pupitre quand il a un quiz, sinon la première séance ouverte non réussie.

La cinquième : cette séance se fige dès que la progression est lue. Sans cela,
réussir le quiz de J03 ferait basculer l'écran sur J04 au moment même où le
relevé s'affiche, le quiz changeant sous les doigts de l'apprenti.

Un ajout au passage : le bouton secondaire du design 6.1, qui manquait au
catalogue (`composants.css`). Le relevé s'en sert pour « Retenter », à côté de
la primaire « Retour au terminal » ; Réglages le reprendra en T17.

L'autotest Electron a été réordonné. La case de la feuille de route se coche
maintenant AVANT la visite du quiz et ne se rend qu'après : sur un dossier
vierge, c'est elle qui valide la journée du pupitre et ouvre la séance du soir.
L'autotest répond donc à une vraie question, lit la correction, passe à la
suivante, puis rend la case ; il s'arrête à la deuxième question, la huitième
réponse portant une tentative au dossier qui, elle, ne se reprend pas. Si
aucune séance n'est ouverte, il contrôle l'écran verrouillé à la place.

Fichiers touchés : `app/src/ui/quiz.js`, `app/src/ui/quiz.test.js`,
`app/src/styles/quiz.css` (nouveaux), `app/src/ecrans/Quiz.jsx`,
`app/src/styles/composants.css`, `app/src/styles/base.css`,
`app/electron/main.cjs`, `ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (JS 578,82 ko, CSS 38,12 ko),
`npx vitest run` vert (16 fichiers, 315 tests), autotest Electron vert
(11 séances, question corrigée puis suivante, progression rendue à l'identique).

Commits créés :
- `app: deriver le quiz du soir dans un module pur`
- `tests: couvrir le deroule et le releve du quiz du soir`
- `design: habiller l ecran du quiz du soir`
- `app: l ecran LE QUIZ DU SOIR, correction commentee et XP unique`
- `electron: passer une question du quiz dans l autotest`
- `doc: consigner l iteration T16`

## T17 - L'écran des réglages

Tâche : la dix-septième d'`ETAT_APP.md`, l'écran RÉGLAGES (cahier des charges,
§5.6) : l'export et l'import de la progression par les boîtes natives de macOS,
la remise à zéro à double confirmation, le choix du rythme et l'interrupteur des
effets. Les quatre handlers IPC existaient depuis T04, la persistance savait
déjà les appeler depuis T07 : il ne manquait que le poste de travail d'où on
s'en sert.

Le partage reste celui des six écrans précédents. Un module pur de plus,
`src/ui/reglages.js`, décide tout : les trois lignes de rythme, les deux
interrupteurs, le poids de la carrière (XP, décorations, salles validées), le
texte des deux boîtes de confirmation et les comptes rendus d'export, d'import
et d'effacement. `src/ecrans/Reglages.jsx` ne tient que deux choses : le rang
de la boîte ouverte et le relevé du dernier mouvement de fichier.

Quatre arbitrages.

Le premier : la double confirmation exigée par le §5.6 est faite de DEUX boîtes
successives, dans la même coque du design 6.7. La première annonce ce qui part
(« 1 240 XP, 3 décorations et 4 salles validées partent au broyeur ») et son
bouton rouge porte trois points de suspension, puisqu'il ouvre encore quelque
chose ; la seconde demande le dernier mot et porte seul le bouton
« Effacer définitivement ». À chaque étape, « Échap » annule et c'est le bouton
de repli qui prend le focus : l'action destructrice n'est jamais celle par
défaut.

Le deuxième : la maquette montre trois interrupteurs (thème sombre, console
BERTHA en phosphore, curseur clignotant), l'application n'en pose que deux. Le
cahier des charges ne prévoit qu'un « interrupteur scanlines », et T08 en avait
déjà fait l'interrupteur des effets de phosphore ; les deux dernières lignes de
la maquette sont donc réunies en une, « Effets de phosphore », qui gouverne le
curseur, la pastille BERTHA et le balayage des consoles. Rien n'est ajouté au
schéma de la progression, qui reste à trois réglages.

Le troisième : les noms des rythmes viennent de la maquette (Tranquille,
Soutenu, Marcel en 1987) et leur ordre aussi, du plus calme au plus dur ; leurs
identifiants restent ceux du cahier des charges (`tranquille`, `soutenu`,
`intensif`), et ce sont eux qui partent dans le fichier. Une note sous le bloc
rappelle que le rythme est indicatif : il n'ouvre ni ne ferme aucune salle.

Le quatrième : la maquette réserve un coin du bloc « progression » à un
« Dernier export : 11 août 2026 ». Rien de tel n'est stocké (une date d'export
n'est pas de la progression), donc cette ligne devient le relevé du dernier
mouvement de la session : le nom du fichier écrit ou relu, un import annulé qui
n'a rien changé, ou la raison complète d'un échec, que le toast en mono ne peut
pas porter. Hors application (navigateur de développement), les deux boutons
sont désactivés et la ligne dit pourquoi.

Deux ajouts au catalogue partagé (`composants.css`), tous deux du design : le
bouton danger (6.1) avec ses états désactivés, l'interrupteur (6.9) et la boîte
de confirmation (6.7), montée en composant `src/ui/Modale.jsx`. Le bloc de
chantier, lui, disparaît : les six écrans sont posés, plus personne ne
l'importe.

Fichiers touchés : `app/src/ui/reglages.js`, `app/src/ui/reglages.test.js`,
`app/src/ui/Modale.jsx`, `app/src/styles/reglages.css` (nouveaux),
`app/src/ecrans/Reglages.jsx`, `app/src/styles/composants.css`,
`app/src/styles/base.css`, `app/src/ecrans/Chantier.jsx` (supprimé),
`app/electron/main.cjs`, `ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (JS 585,53 ko, CSS 42,40 ko),
`npx vitest run` vert (17 fichiers, 344 tests), autotest Electron vert
(3 rythmes, 2 interrupteurs, rythme changé puis rendu, boîte d'effacement
ouverte, première confirmation passée, seconde annulée par « Échap » : rien
n'est effacé).

Commits créés :
- `app: deriver les reglages dans un module pur`
- `tests: couvrir les reglages, l export et la remise a zero`
- `design: habiller l ecran des reglages, l interrupteur et la boite de confirmation`
- `app: l ecran REGLAGES, export/import et remise a zero a double confirmation`
- `app: retirer le bloc de chantier, les six ecrans sont poses`
- `electron: passer les reglages et la double confirmation dans l autotest`
- `doc: consigner l iteration T17`

## T18 - L'icône de l'application

`design/icone.png` est bien fournie (1024x1024 RGBA, coins déjà arrondis et
marges déjà ménagées) : c'est elle qui sert, sans retouche. Le cahier des
charges (§2) exige la fabrication par les outils macOS natifs :
`app/scripts/make-icon.sh` recopie la source dans un dossier de travail
temporaire, la normalise à 1024 par `sips`, en tire les dix tailles de
l'`iconset` (16 à 1024, avec les variantes `@2x`), puis appelle `iconutil -c
icns`. Résultat : `app/build/icon.icns`, 264 ko, les dix représentations
vérifiées par le chemin inverse (`iconutil -c iconset`).

Le dessin de repli, prévu par le cahier des charges si `design/` ne fournit
rien, existe quand même : `app/scripts/icone-repli.mjs`. Écart assumé sur la
lettre du texte, qui dit « SVG converti en PNG » : `sips` ne sait pas
rastériser un SVG et la liste des dépendances autorisées ne contient aucun
convertisseur. Le module peint donc la toile lui-même (carte de papier crème
arrondie, écran de console `#16160F`, « CQ » en phosphore `#4FBF7B`, formes
décrites par des prédicats et adoucies à quatre sous-échantillons par pixel)
et encode le PNG à la main (IHDR, IDAT compressé par le `zlib` de Node, IEND,
CRC32 maison). Zéro dépendance ajoutée. Il s'appelle aussi en ligne de
commande : `node scripts/icone-repli.mjs <sortie.png> [taille]`.

L'icône est committée bien qu'elle soit un produit dérivé : `electron-builder`
la réclame au moment de l'empaquetage (T19), et la règle du dépôt propre
interdit de la laisser non suivie. Sa fabrication est reproductible à
l'identique (regénérée après commit, `git status` reste propre). Deux fils
tirés côté `package.json` : le script `icon`, et `predist:mac` qui l'appelle
pour que `npm run dist:mac` ne parte jamais sans icône fraîche. `mac.icon`
pointe explicitement `build/icon.icns` plutôt que de compter sur la
convention `buildResources`.

Fichiers touchés : `app/scripts/make-icon.sh`, `app/scripts/icone-repli.mjs`,
`app/scripts/icone-repli.test.mjs`, `app/build/icon.icns` (nouveaux),
`app/package.json`, `ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (JS 585,53 ko, CSS 42,40 ko),
`npx vitest run` vert (18 fichiers, 350 tests), `npm run icon` vert et
reproductible. Pas d'autotest Electron cette fois : la tâche ne touche pas
l'interface, l'icône se vérifie à l'empaquetage (T19).

Commits créés :
- `app: le script make-icon.sh et le dessin de repli de l icone`
- `tests: le dessin de repli de l icone`
- `app: l icone icon.icns fabriquee depuis design/icone.png`
- `doc: consigner l iteration T18`

## 2026-08-14 - T19 : empaquetage macOS, les deux disques d'installation

Tâche : produire le `.dmg` et le `.app` par `npm run dist:mac`, lancer l'app
empaquetée, consigner tailles et avertissements.

Blocage rencontré et levé (l'essentiel de l'itération) : le premier
`npm run dist:mac` est resté suspendu vingt minutes à l'étape `signing`.
`electron-builder` découvre tout seul les certificats du trousseau ; il a
trouvé une identité de développement sans rapport avec ce projet
(`identityName=CopyDraft Dev`) et `codesign` attendait le déverrouillage du
trousseau, qu'aucune interface ne pouvait donner. Deux corrections, dans le
même commit parce qu'elles ne se tiennent pas l'une sans l'autre :

- `mac.identity: null` coupe la découverte automatique. C'est la position
  juste pour ce projet : COBOL QUEST se distribue non signée, aucun certificat
  Apple n'y entre, et le cahier des charges prévoit déjà l'ouverture par clic
  droit sous Gatekeeper.
- `afterPack: scripts/signature-adhoc.cjs` pose ensuite `codesign --force
  --deep --sign -` puis vérifie le résultat. Sans cette signature ad-hoc (qui
  n'exige ni certificat ni trousseau), une application non signée est tuée au
  démarrage sur Apple Silicon : `identity: null` seul aurait produit un `.dmg`
  qui ne s'ouvre pas.

Résultats de l'empaquetage, dans `app/release/` :

| Livrable | Taille |
| --- | --- |
| COBOL Quest-1.0.0-arm64.dmg | 114,9 Mio (120 468 613 octets) |
| COBOL Quest-1.0.0.dmg (Intel) | 119,5 Mio (125 262 661 octets) |
| release/mac-arm64/COBOL Quest.app | 282 Mio |
| release/mac/COBOL Quest.app | 285 Mio |

Test de lancement : les deux applications empaquetées passent l'autotest
(`CQ_AUTOTEST=1 "COBOL Quest.app/Contents/MacOS/COBOL Quest"`, sortie 0),
la version Intel exécutée sous Rosetta. Le rapport est identique à celui du
mode développement : pont actif, 6 écrans, 19 salles, sujet rendu, feuille de
route cochée puis rendue, 11 séances de quiz, 26 médailles, 9 échelons,
réglages complets, thème écrit dans le fichier puis repris. Le `.dmg` arm64 a
été monté pour contrôle : il porte l'app et le lien vers `/Applications`,
identifiant `cgba.cobolquest`, `Signature=adhoc`.

Avertissements consignés :
- `spctl -a` répond `rejected`. Attendu, et non corrigeable sans compte
  développeur Apple : c'est exactement le cas que le README de T20 doit
  expliquer (première ouverture par clic droit puis « Ouvrir »).
- Vite signale un lot JS de 585,53 ko, au-dessus de son seuil d'alerte de
  500 ko. Sans conséquence ici : l'application est hors-ligne et charge son
  bundle depuis le disque, pas depuis le réseau. Le corpus embarqué (24 sujets)
  en est le principal poids. Pas de découpage : il ferait payer un aller-retour
  de chargement pour rien.
- `electron-builder` liste des `duplicate dependency references` (l'arbre de
  `react-markdown`). Diagnostic informatif, aucune action.
- Les deux `.app` empaquetées héritent d'un message
  `Most NODE_OPTIONs are not supported in packaged apps` quand le terminal
  exporte `NODE_OPTIONS` ; il vient de l'environnement de la machine, pas de
  l'application, et disparaît au lancement normal depuis le Finder.

Rien de tout cela n'entre dans le dépôt : `release/` est ignoré depuis T01.

Fichiers touchés : `app/scripts/signature-adhoc.cjs` (nouveau),
`app/package.json`, `ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run dist:mac` vert (deux `.dmg`, deux `.app`), `npm run build`
vert, `npx vitest run` vert (18 fichiers, 350 tests), autotest vert sur les
deux applications empaquetées.

Commits créés :
- `electron: empaqueter sans identite du trousseau, avec signature ad-hoc`
- `doc: consigner l iteration T19`

## 2026-08-14 - T20 : finitions, états vides, relecture et README

Tâche : la dernière ligne droite avant le contrôle final. Quatre sujets
distincts, donc quatre commits de code plus un de documentation.

**La mise en page au-dessus de 1280 px.** Elle ne se relit plus à l'oeil :
l'autotest Electron la sonde désormais à 1280, 1440 et 1680 px de large, sur
les six écrans, et refuse le moindre débordement horizontal. Deux mesures
complémentaires : la zone de contenu ne doit rien avoir à faire défiler en
largeur (elle est en `overflow-x: hidden`, un débordement s'y couperait en
silence), et aucun élément ne doit voir son contenu déborder sa propre boîte
sans défilement pour l'absorber. Un bloc de code ou un cadre de tableau, eux,
ont le droit : ils défilent seuls. Verdict : rien ne débordait. La sonde a
levé un seul signal, le repère de seuil de la feuille de route, un trait de
2 px posé PAR-DESSUS la jauge : une étiquette en surimpression ne serre rien,
la sonde les excuse explicitement.

Écart corrigé au passage, celui-là bien réel : le design donne 1020, 1080, 720
et 680 px comme largeurs de CONTENU, marges de 28 px autour. La boîte portait
ces valeurs marges comprises (`box-sizing: border-box`), donc chaque écran se
lisait 56 px trop étroit dès que la fenêtre dépassait 1332 px. La largeur du
registre s'ajoute maintenant aux deux marges (`--marge-ecran`), et rien ne
change au plancher de 1280 px, où la place manque de toute façon.

**Les états vides.** Trois endroits pouvaient rendre du blanc : le mur des
décorations d'un dossier neuf (il avait déjà sa phrase, dans un style à lui),
l'écran du quiz et le volet de la feuille de route quand une progression
importée désigne une épreuve qui n'existe plus au programme (`return null`,
donc écran ou volet vide, sans un mot d'explication). `ui/EtatVide.jsx` leur
donne une forme commune : le même pointillé que les salles verrouillées et les
bonus facultatifs, c'est-à-dire « pas encore », une phrase qui dit ce qui
remplira la place, et un geste facultatif. Aucune illustration, aucun carré
gris : le design n'en prévoit pas.

**Les textes relus.** Deux corrections de fond. Le terminal annonçait
« EPREUVE EN COURS » même quand la dernière salle du programme était validée :
il dit maintenant « SALLE VALIDEE », et l'ambre passe au vert, la sémantique
des couleurs du design voulant l'ambre pour ce qui est en cours et le vert
pour ce qui est acquis. Les onze quiz passent à l'apostrophe typographique.
Arbitrage tranché : ce que l'application ÉCRIT prend l'apostrophe courbe,
ce qu'elle REPREND du corpus (titres d'exercices de `programme.js`, conditions
d'échelon) garde la sienne, droite, comme les sujets. La conversion épargne
les extraits de code entre accents graves, où une apostrophe est un délimiteur
COBOL et non une apostrophe.

`src/ui/textes.test.js` remplace la vigilance par un test : aucun tiret
cadratin dans les sources ni dans les quiz, aucune chaîne tout en capitales
avec des accents, aucune étiquette mono écrite en dur qui ne soit en
majuscules non accentuées, aucune apostrophe droite dans les quiz hors code.

**Le README.** `app/README.md` s'adresse à quelqu'un qui n'a jamais installé
une application autrement qu'en cliquant dessus : quel `.dmg` prendre selon la
puce (et comment le savoir), l'installation dans Applications, et surtout la
première ouverture d'une application non signée (clic droit puis « Ouvrir »,
une seule fois), avec le recours `xattr -dr com.apple.quarantine` si Gatekeeper
parle d'application endommagée. Suivent les six écrans et leurs raccourcis, le
déroulé d'une journée type, le chemin réel de la progression
(`~/Library/Application Support/cobol-quest/progression.json`, vérifié sur la
machine), l'export et l'import, la construction depuis les sources, un tableau
de dépannage et ce que l'application ne fait pas (elle ne juge rien : BERTHA
fait foi).

Fichiers touchés : `app/electron/main.cjs`, `app/src/ui/Ecran.jsx`,
`app/src/styles/coque.css`, `app/src/styles/tokens.css`,
`app/src/ui/EtatVide.jsx` (nouveau), `app/src/ui/EtatVide.test.jsx` (nouveau),
`app/src/ecrans/Quiz.jsx`, `app/src/ecrans/FeuilleDeRoute.jsx`,
`app/src/ecrans/Terminal.jsx`, `app/src/styles/composants.css`,
`app/src/styles/terminal.css`, `app/src/ui/tableauDeBord.js` et son test,
les onze `app/src/data/quiz/*.json`, `app/src/ui/textes.test.js` (nouveau),
`app/README.md` (nouveau), `ETAT_APP.md`, `JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert, `npx vitest run` vert (20 fichiers, 358 tests),
autotest Electron vert, mise en page sans débordement à 1280, 1440 et 1680 px.

Commits créés :
- `electron: l autotest sonde la mise en page a 1280, 1440 et 1680 px`
- `app: les largeurs du design sont des largeurs de contenu, marges en plus`
- `app: un etat vide commun, la ou l ecran restait blanc`
- `app: le terminal n annonce plus « en cours » une salle deja validee`
- `quiz: l apostrophe typographique dans les onze seances du soir`
- `tests: les regles d ecriture (cadratin, capitales, apostrophes) tenues par un test`
- `doc: le README de l app, ecrit pour un debutant complet`
- `doc: consigner l iteration T20`

## 2026-08-14 - T21 : le contrôle final

Tâche : build et tests verts, parcours manuel complet consigné ici, `git tag
v1.0.0`, puis `app/.MISSION_TERMINEE`.

**Blocage levé d'abord.** La boucle tournait à vide depuis plusieurs tours :
`boucle.log` ne contient plus, sur ses douze dernières tentatives, que
« You've hit your session limit ». Le quota de session était épuisé, chaque
tour relançait l'agent, se faisait refuser aussitôt, dormait 30 secondes et
recommençait, sans jamais produire une ligne. Rien à corriger dans
l'application : T21 n'a jamais commencé. À noter pour l'avenir, un défaut du
script de boucle qui a masqué la panne : `CODE=$?` est lu après un `| tee`,
donc il relève le code de `tee` (0) et jamais celui de l'agent. Le script
appartient au périmètre en lecture seule (protocole, point 6), il n'a pas été
touché : la correction est proposée à l'utilisateur, pas appliquée.

**Le parcours du §10 ne se raconte plus, il se joue.** Le cahier des charges
demande un parcours manuel « cocher J00, XP, J01 débloqué, quiz J01, badge,
export/import, relance de l'app : progression conservée ». Le raconter en prose
n'aurait rien prouvé, et l'autotest d'Electron ne pouvait pas s'en charger : il
est bâti pour ne RIEN laisser derrière lui (chaque case cochée est rendue),
alors que ce parcours-ci ne vaut que par ce qu'il écrit. D'où deux fichiers
nouveaux :

- `app/electron/parcours.cjs` : les deux scénarios, joués dans la fenêtre.
- `app/scripts/parcours.mjs` : le pilote, qui enchaîne DEUX lancements de
  l'application sur un même dossier utilisateur, et lit le fichier de
  progression avec ses propres yeux entre les deux.

L'aller, sur un dossier neuf : le plan montre J00 disponible et J01
verrouillée, dossier à 0 XP ; on ouvre J00, on coche sa feuille de route, la
jauge passe le seuil et le tampon VALIDE tombe, la barre latérale affiche
30 XP ; au livret, la décoration PREMIERE COMPILE s'est accrochée toute seule
(elle se déduit de l'exercice coché, T13) ; le plan a bougé, J00 est validée et
J01 s'est ouverte ; la séance du soir de J01 est menée au bout, huit bonnes
réponses, 8/8, tampon « VALIDE +10 XP », total à 40 XP ; on repasse la même
séance, encore 8/8, et le total reste à 40 XP (les XP du quiz ne se gagnent
qu'une fois, §5.4) ; enfin l'export écrit le fichier. L'application se ferme
par le vrai chemin de fermeture, celui qui vide le tampon d'écriture amorti.

Le retour, application relancée de zéro sur le même dossier : 40 XP toujours
là, J00 validée, J01 en cours (ses 10 XP de quiz l'ont mise en route), la
décoration au mur, la séance de J01 marquée réussie ; puis l'import du fichier
exporté à l'aller, qui rend exactement le même dossier. Le pilote compare
lui-même, hors application : progression après l'aller, fichier exporté et
progression après l'import sont trois fois le même JSON.

Verdict du parcours : 11 étapes à l'aller, 5 au retour, 8 contrôles de fichiers
du pilote, tous tenus. Et deux fois plutôt qu'une : sur les sources, puis sur
`release/mac-arm64/COBOL Quest.app`, l'application empaquetée que l'apprenti
installera vraiment (`npm run parcours -- "release/mac-arm64/COBOL Quest.app"`).

**Trois précautions.** Le dossier de l'apprenti n'est jamais touché :
`CQ_USER_DATA` détourne `userData` vers un dossier temporaire, effacé à la fin.
Les deux boîtes natives de macOS ne peuvent pas s'ouvrir sans quelqu'un pour
cliquer : `CQ_PARCOURS_FICHIER` leur impose un fichier, et c'est la seule
entorse, les quatre handlers IPC restant exactement ceux de la vraie
application. Enfin la question du quiz se reconnaît à son RANG et non à son
texte : un énoncé de J01 aligne quatorze espaces pour montrer le remplissage
d'une `PIC X(20)`, et le HTML les replie en un seul ; l'énoncé sert quand même
de garde-fou, blancs repliés des deux côtés.

**L'empaquetage refait** avec les sources d'aujourd'hui (T20 avait modifié
l'interface après le `dist:mac` de T19) :

| Livrable | Taille |
| --- | --- |
| COBOL Quest-1.0.0-arm64.dmg | 114,9 Mio (120 472 698 octets) |
| COBOL Quest-1.0.0.dmg (Intel) | 119,5 Mio (125 266 518 octets) |
| release/mac-arm64/COBOL Quest.app | 282 Mio |
| release/mac/COBOL Quest.app | 285 Mio |

Les deux applications empaquetées repassent l'autotest (sortie 0, la x64 sous
Rosetta), avec les mêmes avertissements qu'en T19 et pour les mêmes raisons :
`spctl` répond `rejected` (application non signée, cas Gatekeeper expliqué au
README), lot JS au-dessus du seuil d'alerte de Vite (application hors-ligne),
`duplicate dependency references` de l'arbre de `react-markdown`.

Fichiers touchés : `app/electron/parcours.cjs`, `app/scripts/parcours.mjs`
(nouveaux), `app/electron/main.cjs`, `app/package.json`, `ETAT_APP.md`,
`JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert (JS 587,39 ko, CSS 42,63 ko),
`npx vitest run` vert (20 fichiers, 358 tests), autotest Electron vert,
`npm run parcours` vert sur les sources et sur le `.app` empaqueté,
`npm run dist:mac` vert. Toutes les cases d'`ETAT_APP.md` sont cochées.

Commits créés :
- `electron: le parcours de controle de bout en bout, en deux lancements`
- `app: le pilote du parcours et son script npm run parcours`
- `app: le parcours sait aussi juger l application empaquetee`
- `doc: consigner l iteration T21 et clore la feuille de route`

Tag `v1.0.0` posé sur ce dernier commit, `app/.MISSION_TERMINEE` créé.

## 2026-08-14 - Après T21 : la sonde fonctionnelle

Le contrôle final (T21) prouve que le parcours nominal du §10 marche. Restait à
savoir ce que fait l'application quand l'apprenti se trompe. D'où une troisième
phase au harnais, `npm run parcours -- --sonde`, qui prend les chemins que le
parcours ne prend pas, et d'abord les chemins d'échec :

- le déblocage séquentiel dans les deux sens : J01 et J02 fermées au départ,
  J00 validée n'ouvre que J01, et une case rendue reprend ses XP et REFERME
  J01 (la salle qu'on vient de quitter reste « en cours », c'est le sujet posé
  sur le pupitre, même à zéro XP) ;
- un quiz raté : huit mauvaises réponses, 0/8, aucun tampon, aucun XP, et la
  séance repasse à « à repasser » ;
- l'échelon, qui ne se gagne pas qu'avec des XP : à 155 XP sans J02 validée on
  reste Candidat, conformément au livret (« J00 à J02 validés »), et c'est J02
  cochée qui fait passer Stagiaire ;
- une décoration sur l'honneur, qui se coche et qui reste ;
- un import de fichier invalide : refusé, message « Ce fichier n'est pas une
  progression COBOL Quest », progression inchangée ;
- la remise à zéro menée jusqu'au bout des deux confirmations : 315 XP,
  3 décorations et 2 salles partent au broyeur, le plan se reverrouille, le mur
  des médailles se vide, et les réglages restent (le thème sombre survit, le
  fichier le montre).

13 étapes à l'écran, 3 contrôles de fichier, tous tenus, sur les sources comme
sur l'application empaquetée.

Un défaut de MESURE corrigé en chemin, pas un défaut de l'application : l'étape
d'import s'accordait 400 ms fixes après le clic, ce qui passait sur les sources
et échouait une fois sur trois sur l'application empaquetée, plus lente à
répondre. Le harnais attend maintenant que le relevé CHANGE, jusqu'à quatre
secondes, pour l'export, l'import et la remise à zéro. Trois tours consécutifs
verts après correction.

Fichiers touchés : `app/electron/parcours.cjs`, `app/scripts/parcours.mjs`,
`JOURNAL_CONSTRUCTION.md`.

Verdict : `npm run build` vert, `npx vitest run` vert (20 fichiers, 358 tests),
autotest Electron vert, `npm run parcours` et `npm run parcours -- --sonde`
verts sur les sources et sur le `.app` empaqueté, `npm run dist:mac` vert.
Le tag `v1.0.0` reste où il est : ces commits sont de l'outillage de test.

Commits créés :
- `tests: une sonde fonctionnelle pour les chemins d echec de l app`
- `tests: attendre le releve plutot qu un delai fixe dans le harnais`
- `doc: consigner la sonde fonctionnelle`
