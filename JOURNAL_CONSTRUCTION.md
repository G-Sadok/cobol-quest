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
