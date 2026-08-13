# BERTHA — mode d'emploi de la moulinette

BERTHA compile votre rendu (`cobc -x -Wall`), exécute des tests, compare la sortie
**au caractère près** (seuls les espaces de fin de ligne sont pardonnés) et rend
son verdict. Comme la vraie moulinette d'école : elle n'explique pas, elle
constate. C'est vous qui expliquez.

## Installation
```
chmod +x bertha/bertha.sh
./bertha/bertha.sh --auto-test        # doit dire : BERTHA EST VIVANTE
```

## Arborescence de travail
```
cobol-quest/
├── bertha/bertha.sh
├── rendu/                 vos programmes    rendu/J03/ex05/statut.cob
└── tests/                 vos jeux de tests tests/J03/ex05/test01/...
```

## Écrire un test (2 minutes, et c'est LE geste du métier)
Chaque exemple `$>` d'un sujet est une **spécification exécutable**. Pour le
transformer en test :
```
tests/J03/ex05/test01/
├── expected.txt      la sortie attendue, recopiée du sujet, EXACTEMENT
├── in.txt            ce que vous auriez tapé au clavier (une saisie par ligne)
├── args              (optionnel) les arguments de ligne de commande
├── fixtures/         (optionnel) les fichiers d'entrée (clients.dat, ...)
└── check_extrait.dat (optionnel) contenu attendu du fichier extrait.dat produit
```
Exemple complet pour J03 ex05 (le distributeur, retrait de 180) :
- `in.txt` contient : `180`
- `expected.txt` contient les 5 lignes de l'exemple du sujet, à l'identique.

Puis : `./bertha/bertha.sh J03/ex05`

## Les règles du verdict
1. La compilation échoue → KO immédiat, le message du compilateur est votre seul
   indice (c'est voulu : apprendre à LIRE le compilateur est un objectif).
2. Un avertissement `-Wall` s'affiche → toléré par le script, interdit par la
   Norme : corrigez avant de vous déclarer "fini".
3. La sortie diffère → BERTHA montre le diff. La ligne `<` est la vôtre, `>` est
   l'attendu.
4. Tous les tests passent → les XP de l'exercice sont acquis. Notez-les dans
   `progression/` (ou l'app le fera pour vous à l'Étape 2).

## Étalonner ses propres tests
Le sujet ne donne pas TOUS les cas — ajoutez les vôtres (`test02`, `test03`...) :
cas limites, zéro, montant énorme, saisie folle. Un exercice mérite au moins 3
tests personnels. À la CGBA, on dit : « un test que tu n'écris pas aujourd'hui est
un réveil à 3h du matin dans dix ans ».

## Cas particuliers
- **Exercices à fichiers** (J07+) : mettez les fichiers d'entrée dans `fixtures/`
  — BERTHA les copie dans un bac à sable vierge à chaque test, votre programme
  tourne donc toujours dans un monde propre.
- **Exercices indexés** (J08+) : ajoutez dans `fixtures/` le `clients.dat` et
  faites de votre test01 un test qui commence par recharger la base (ou incluez
  le rechargement dans `in.txt`/scénario, selon l'exercice).
- **Dates du jour** dans les sorties (J01 ex03, J07 ex04...) : générez
  `expected.txt` par un petit script qui insère la date courante, ou excluez la
  ligne de date de votre comparaison manuelle — BERTHA de l'Étape 2 (l'app) saura
  le faire toute seule.
