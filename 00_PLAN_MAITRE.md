# COBOL QUEST — OPÉRATION MARCEL
## Plan maître de la plateforme interactive d'apprentissage du COBOL
### Pédagogie par projet façon Epitech — Version 1.0

---

## 1. LA VISION

**COBOL Quest** est une plateforme d'apprentissage complète qui transpose la pédagogie
Epitech (zéro cours magistral, 100% projet, moulinette impitoyable, droit à l'échec,
peer-learning) à l'apprentissage du COBOL, de zéro jusqu'au niveau "employable junior
mainframe".

**Le principe fondateur :** on n'apprend pas le COBOL en lisant, on l'apprend en se
battant avec le compilateur, en lisant des dumps, en respectant une norme, et en
livrant des batchs qui tournent. La plateforme fournit le cadre, les sujets, les
données, les tests automatiques et la narration. L'apprenant fournit la sueur.

---

## 2. LA NARRATION (le fil ludique)

> **Année 2026. La CGBA — Compagnie Générale de Banque de l'Atlantique — fondée en
> 1962, fait tourner toute son informatique sur 4,2 millions de lignes de COBOL.**
>
> **Marcel Dubois, 64 ans, dernier développeur COBOL de la banque, part à la retraite
> dans 6 mois. La panique règne à la DRH. Vous êtes la recrue. Marcel a accepté de
> vous former — à sa manière : pas de cours, des missions, des mémos griffonnés, et
> BERTHA, le vieux système de validation batch de la banque, qui ne pardonne RIEN.**
>
> **Votre objectif : devenir, en 6 mois, le prochain Gardien du Mainframe.**

Tout le parcours est habillé par cette histoire :
- Chaque journée de piscine commence par un **Mémo de Marcel** (le contexte + la fiche
  technique du jour).
- La moulinette s'appelle **BERTHA** : elle compile, exécute, compare au caractère
  près. Sortie exacte ou zéro. Comme en vrai.
- La progression se fait par **habilitations** (échelons) et **badges** aux noms tirés
  du folklore mainframe (S0C7, COMP-3, JCL...).
- Les projets sont des **missions** confiées par des personnages récurrents de la
  banque (Marcel, Mme Kerbrat la DRH, M. Fall le directeur des risques, Josiane de la
  paie...).

---

## 3. LES PRINCIPES PÉDAGOGIQUES (transposition Epitech → COBOL Quest)

| Principe Epitech | Mécanique COBOL Quest |
|---|---|
| Pas de cours magistral | Pas de "leçons" : des **sujets** + des **Mémos de Marcel** (fiches de référence denses, à consulter, jamais à réciter) |
| La Piscine | **10 journées J01→J10** + 2 **rushs** de week-end + 1 **examen final** (J10) |
| Projets à deadline | **6 missions** de 2 à 6 semaines avec livrables, barème et bonus |
| La moulinette | **BERTHA** : script `bertha.sh`, compile avec `cobc -Wall`, exécute, `diff` strict (espaces de fin ignorés, tout le reste est exact) |
| La norme Epitech | **La Norme CGBA** : format fixe colonnes 7/8/12, nommage, GO TO interdit, un verbe par ligne, en-tête obligatoire (voir `01_NORME_CGBA.md`) |
| Le droit à l'échec | Les sujets ne donnent JAMAIS la solution. Indices progressifs déblocables (coût en XP). Recommencer est normal et gratuit |
| Peer-learning / AER | **Marcel-IA** (v2 de la plateforme) : un mentor IA qui répond UNIQUEMENT par des questions et des pistes, jamais par du code — comme un AER Epitech |
| Soutenances | Chaque mission se conclut par un **rapport de mission** (template fourni) : ce que j'ai fait, comment, ce qui a cassé, ce que je referais autrement |
| Le trial & error | Les exercices "pièges" sont assumés (troncatures, an 2000, arrondis) : on tombe dedans, PUIS on comprend |

---

## 4. ARCHITECTURE DU CURSUS (vue d'ensemble)

### PHASE 0 — L'EMBAUCHE (1 jour)
- `02_J00_INSTALLATION.md` : environnement (GnuCOBOL 3.2+, VS Code, git), premier
  programme, premier passage de BERTHA. Alternative zéro-installation : compilateur
  COBOL en ligne pour les 3 premiers jours.

### PHASE 1 — LA PISCINE (2 semaines intensives, ou 4-5 semaines à temps partiel)
| Jour | Titre | Compétences |
|---|---|---|
| J01 | Les Quatre Divisions | Structure d'un programme, format fixe, DISPLAY, ACCEPT, compilation |
| J02 | La Mémoire de BERTHA | PIC (9/X/A/V/S), VALUE, MOVE, troncatures, arithmétique, COMPUTE, ROUNDED, édition d'affichage, COMP-3 |
| J03 | Les Décisions | IF/EVALUATE, conditions de classe, niveaux 88, SET |
| J04 | Les Boucles du Batch | Paragraphes, PERFORM (TIMES/UNTIL/VARYING), NO ADVANCING, GO TO (et pourquoi il est interdit) |
| J05 | Les Registres | Structures, REDEFINES, OCCURS, indices, SEARCH / SEARCH ALL, tri à bulles, tables 2D |
| **RUSH 01** | BERTHA-MIND | Mastermind en COBOL — synthèse J01→J05 (week-end 1) |
| J06 | Le Langage des Chaînes | STRING, UNSTRING, INSPECT, modification de référence, fonctions intrinsèques |
| J07 | Les Fichiers Séquentiels | SELECT/FD, OPEN/READ/WRITE/CLOSE, FILE STATUS, décimale implicite, filtres, rapports |
| J08 | Les Fichiers Indexés | ORGANIZATION INDEXED, clés, READ/REWRITE/DELETE/START, accès dynamique, CRUD |
| J09 | SORT, Ruptures & Sous-programmes | SORT/MERGE, procédures d'E/S, ruptures de contrôle, CALL/LINKAGE, copybooks |
| **RUSH 02** | La Paie de la CGBA | Mini-chaîne de paie complète (week-end 2) |
| J10 | L'Examen de BERTHA | Examen final de piscine (4h, conditions réelles) |

### PHASE 2 — LES MISSIONS (3 à 4 mois)
| Mission | Titre | Durée | Cœur technique |
|---|---|---|---|
| M01 | GUICHET-3000 | 2 sem | Application de guichet interactive, fichiers indexés, CRUD complet, journal d'audit |
| M02 | PAYE-MASTER | 3 sem | Chaîne de paie industrielle : barèmes, tranches, bulletins, états, copybooks, sous-programmes |
| M03 | STOCKS & CO | 2 sem | Gestion de stock : mouvements batch, valorisation FIFO, alertes, réapprovisionnement |
| M04 | LA PASSERELLE | 2 sem | Interopérabilité : import/export CSV, génération JSON, COBOL dans un pipeline shell |
| M05 | S.O.S. LEGACY | 2 sem | **Maintenance d'un vrai code horrible fourni** : bugs à trouver, refactoring sans casser (golden master) |
| M06 | LE CŒUR BANCAIRE | 4-6 sem | Chef-d'œuvre final : chaîne batch bancaire complète (comptes, mouvements, intérêts, relevés, compta) |

### PHASE 3 — LE VRAI MAINFRAME (1 à 2 mois, en parallèle possible dès M03)
- IBM Z Xplore (gratuit, accès 24/7 à un vrai z/OS, badges Credly) : JCL, datasets,
  TSO/ISPF, COBOL sur z/OS, VSAM, Db2.
- Cours "COBOL Programming with VS Code" de l'Open Mainframe Project.
- Certificat professionnel "IBM Mainframe Developer" (Coursera) en option.
- Dossier : différences GnuCOBOL ↔ Enterprise COBOL, culture d'exploitation,
  préparation au marché de l'emploi.

---

## 5. LE SYSTÈME DE PROGRESSION

### 5.1 Les XP
- Chaque exercice de piscine : **10 à 25 XP** (indiqué sur le sujet).
- Bonus d'exercice : **+10 XP**. Rush : **100-150 XP**. Examen J10 : **200 XP**.
- Missions : **300 à 800 XP** selon barème.
- Débloquer un indice coûte **5 XP** (assumé : mieux vaut un indice qu'un abandon).

### 5.2 Les Habilitations (échelons)
| Échelon | Titre | Seuil XP | Se débloque avec |
|---|---|---|---|
| 0 | Stagiaire café | 0 | L'embauche (J00) |
| 1 | Pisciner | 150 | J01-J04 |
| 2 | Opérateur pupitreur | 400 | J05-J07 + Rush 01 |
| 3 | Programmeur junior | 800 | Piscine complète + examen |
| 4 | Analyste-programmeur | 1500 | M01 + M02 |
| 5 | Ingénieur d'exploitation | 2400 | M03 + M04 |
| 6 | Architecte batch | 3200 | M05 + Phase 3 entamée |
| 7 | **Gardien du Mainframe** | 4500 | M06 livré + rapport final |

### 5.3 Les Badges (extraits — liste complète dans `progression/XP_ET_BADGES.md`)
`PREMIÈRE COMPILE` · `COLONNE 7` (première erreur de format fixe corrigée) ·
`S0C7` (premier plantage sur donnée non numérique) · `SURVIVANT Y2K` ·
`L'AMI DE COMP-3` · `TUEUR DE GO TO` · `MAÎTRE DES RUPTURES` · `DOMPTEUR DE BERTHA`
(10 exercices validés du premier coup) · `GARDIEN DU MAINFRAME`.

---

## 6. LE CONTRAT BERTHA (règles de validation)

1. **Tout rendu vit dans `rendu/Jxx/exYY/`** (ou `rendu/Mxx/`). Nom de fichier imposé
   par le sujet.
2. **Compilation : `cobc -x -Wall -o prog prog.cob`**. Un warning = toléré en piscine,
   pénalisé en mission. Une erreur = 0.
3. **La sortie doit être EXACTE au caractère près** (majuscules sans accents — BERTHA
   date de 1987 et ne connaît pas UTF-8). Seule tolérance : les espaces en fin de
   ligne sont ignorés.
4. **La Norme CGBA s'applique dès J01.** Non-norme = -50% en piscine, 0 en mission.
5. **Interdits sauf mention contraire du sujet** : GO TO, ALTER, PERFORM THRU,
   bibliothèques externes.
6. Les exemples `$>` figurant dans les sujets **sont** la spécification de test.

---

## 7. LA PLATEFORME INTERACTIVE (spécification de l'application)

Le corpus (ce dossier) est le contenu. L'application est le véhicule. Elle sera
construite en **3 versions incrémentales** :

### V1 — Le Poste de Commandement (application web monopage, React)
- **Carte des missions** : parcours visuel façon carte de métro (Piscine → Missions →
  Mainframe), nœuds verrouillés/déverrouillés selon la progression.
- **Lecteur de sujets** : affichage des sujets jour par jour, exercice par exercice,
  avec les Mémos de Marcel repliables.
- **Suivi de progression persistant** : XP, badges, exercices cochés "validés par
  BERTHA", échelon courant (stockage persistant intégré à la plateforme).
- **Quiz éclair de fin de journée** (10 QCM/jour, générés depuis les mémos) : +10 XP.
- **Tableau de bord** : jauge XP, prochain déblocage, temps passé, streak.
- L'exécution du COBOL reste **locale** (GnuCOBOL + `bertha.sh`) — c'est un choix
  pédagogique : un vrai terminal, un vrai compilateur. Liens de secours vers un
  compilateur en ligne pour J01-J03.

### V2 — Marcel-IA (le mentor)
- Chat intégré propulsé par l'API Claude, avec un prompt système strict :
  **ne jamais donner de code-solution**, répondre par des questions socratiques,
  pointer vers le bon Mémo, célébrer les réussites, râler affectueusement.
- Mode "revue de code" : l'apprenant colle son code, Marcel-IA commente la norme et
  la conception (pas la solution).

### V3 — Les extensions
- Générateur de jeux d'essai supplémentaires par exercice.
- Mode "soutenance" : Marcel-IA pose 5 questions orales sur le projet livré.
- Classement/partage de badges.

---

## 8. RYTHMES PROPOSÉS

| Profil | Piscine | Missions | Phase 3 | Total |
|---|---|---|---|---|
| Intensif (35h/sem) | 2,5 sem | 12 sem | 4 sem (chevauché) | ~4 mois |
| Soutenu (15h/sem) | 5 sem | 18 sem | 6 sem | ~6,5 mois |
| Tranquille (8h/sem) | 8 sem | 26 sem | 8 sem | ~10 mois |

Règle piscine : **une journée Jxx = une journée de travail**, pas une journée
calendaire. On ne passe à Jxx+1 que quand BERTHA a validé au moins 70% des exercices.

---

## 9. CONTENU DU CORPUS (ce qui est livré, dossier par dossier)

```
cobol-quest/
├── 00_PLAN_MAITRE.md            ← ce document
├── 01_NORME_CGBA.md             ← la Norme (le document sacré)
├── 02_J00_INSTALLATION.md       ← Phase 0 : l'embauche
├── piscine/
│   ├── J01 ... J10              ← 10 sujets complets (mémo + exercices + barème)
│   ├── RUSH01_berthamind.md
│   └── RUSH02_la_paie.md
├── missions/
│   ├── M01_GUICHET3000.md ... M06_COEUR_BANCAIRE.md
├── phase3/
│   └── LE_VRAI_MAINFRAME.md
├── bertha/
│   ├── bertha.sh                ← la moulinette locale
│   └── README.md                ← convention des jeux de tests
└── progression/
    └── XP_ET_BADGES.md
```

## 10. FEUILLE DE ROUTE DE CONSTRUCTION

- **Étape 1 (livrée ici)** : plan + norme + les 10 journées complètes + 2 rushs +
  examen + 6 sujets de mission + phase 3 + moulinette + progression.
- **Étape 2** : construction de l'application V1 (carte, lecteur, progression, quiz).
- **Étape 3** : Marcel-IA (V2) + packs de tests BERTHA étendus pour chaque exercice.
- **Étape 4** : contenus Phase 3 approfondis (fiches JCL/VSAM/Db2) + mode soutenance.
