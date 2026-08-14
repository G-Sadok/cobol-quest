# COBOL QUEST, Opération Marcel

Le campus virtuel de la CGBA, sur votre Mac. Une application de bureau, en
français, qui fonctionne **entièrement hors ligne** : les sujets de la piscine,
des missions et de la phase 3 sont embarqués dans l'application, rien n'est
téléchargé, rien n'est envoyé nulle part.

Vous y lisez les sujets, vous cochez les exercices que la moulinette BERTHA a
validés, vous gagnez des XP, vous ouvrez les salles suivantes, vous passez les
quiz du soir et vous suivez votre carrière (échelons et décorations).

Ce document s'adresse à quelqu'un qui n'a jamais installé une application
autrement qu'en cliquant dessus. Rien n'est supposé connu.

---

## 1. Installer l'application

### 1.1 Choisir le bon disque d'installation

Deux fichiers `.dmg` sont produits, un par famille de Mac :

| Votre Mac | Le fichier à prendre |
|---|---|
| Puce Apple (M1, M2, M3, M4...) | `COBOL Quest-1.0.0-arm64.dmg` |
| Processeur Intel | `COBOL Quest-1.0.0.dmg` |

Si vous ne savez pas lequel vous avez : menu Pomme (en haut à gauche) puis
« À propos de ce Mac ». La ligne « Puce » ou « Processeur » vous le dit.

### 1.2 Installer

1. Double-cliquez sur le fichier `.dmg`. Une fenêtre s'ouvre avec l'icône de
   COBOL Quest.
2. Faites glisser l'icône **COBOL Quest** dans votre dossier
   **Applications**.
3. Fermez la fenêtre, puis éjectez le disque d'installation (le petit triangle
   à côté de son nom, dans la barre latérale du Finder).

### 1.3 La toute première ouverture (important)

L'application n'est **pas signée** auprès d'Apple : elle est distribuée telle
quelle, sans certificat de développeur payant. macOS s'en méfie par principe.
Un double-clic direct affiche donc un message du genre « impossible d'ouvrir,
le développeur ne peut pas être vérifié ».

La marche à suivre, **une seule fois** :

1. Ouvrez le dossier **Applications**.
2. **Clic droit** (ou Contrôle + clic) sur **COBOL Quest**.
3. Choisissez **Ouvrir** dans le menu qui apparaît.
4. Une boîte s'affiche avec, cette fois, un bouton **Ouvrir**. Cliquez dessus.

C'est tout : macOS retient votre accord. Les fois suivantes, un simple
double-clic suffit.

> Si le message dit « COBOL Quest est endommagé et ne peut pas être ouvert »,
> c'est la mise en quarantaine des fichiers téléchargés qui parle, pas
> l'application. Ouvrez le Terminal et collez cette ligne, puis Entrée :
>
> ```bash
> xattr -dr com.apple.quarantine "/Applications/COBOL Quest.app"
> ```
>
> Relancez ensuite l'application normalement.

La fenêtre s'ouvre en 1280 x 800 points. Elle se redimensionne librement au
dessus de cette taille, jamais en dessous.

---

## 2. Se servir de l'application

Sept écrans, toujours accessibles par la barre latérale de gauche ou par les
raccourcis clavier :

| Raccourci | Écran | À quoi il sert |
|---|---|---|
| Cmd + 1 | Le terminal | Le tableau de bord : où vous en êtes, quoi faire maintenant |
| Cmd + 2 | La carte | Le plan des sous-sols : toutes les salles et leur état |
| Cmd + 3 | Le sujet | Le texte de l'épreuve, avec la feuille de route à cocher |
| Cmd + 4 | Le quiz | Les huit questions du soir sur la journée écoulée |
| Cmd + 5 | Le livret | Les décorations et la grille des neuf échelons |
| Cmd + 6 | Réglages | Progression, rythme et affichage |
| Cmd + 7 | Le guide | Le mode d'emploi, qui parle de votre dossier à vous |

**Si vous ne savez pas par où commencer, ouvrez Le guide (Cmd + 7).** Il n'est
pas un texte figé : il lit votre progression et vous dit quelle salle ouvrir,
quelle commande BERTHA taper, quelle séance du soir vous devez encore, et ce
qu'il vous manque avant l'échelon suivant. Chaque chapitre porte un bouton qui
vous emmène directement à l'endroit dont il parle.

Le déroulé d'une journée type :

1. **La carte** : la salle disponible est cerclée de vert. Cliquez dessus.
2. **Le sujet** : lisez, faites les exercices sur votre machine, et faites
   juger chacun par BERTHA. La commande exacte est rappelée en bas du volet de
   droite, par exemple `./bertha/bertha.sh J01/ex01`.
3. **La feuille de route** (volet de droite) : cochez un exercice **quand
   BERTHA l'a accepté**, pas avant. Les XP tombent, la jauge avance, et un
   message noir passe en bas de la fenêtre pour annoncer le verdict. Décocher
   rend les XP.
4. Au seuil du jour, la salle passe **VALIDE**, la suivante s'ouvre.
5. **Le quiz du soir** : huit questions, quatre réponses, une correction
   commentée après chaque clic. À partir de 6 bonnes réponses sur 8, la séance
   rapporte 10 XP, une seule fois par épreuve. Vous pouvez la repasser autant
   de fois que vous voulez.
6. **Le livret** : les décorations que l'application sait mesurer tombent
   toutes seules. Les cinq autres se cochent sur l'honneur.

Le bouton lune ou soleil, en haut à droite, bascule le thème clair et sombre.

---

## 3. Où est rangée votre progression

Dans un vrai fichier, sur votre disque, à cet emplacement :

```
~/Library/Application Support/cobol-quest/progression.json
```

Il est écrit à chaque changement (une demi-seconde après, pour ne pas écrire
cent fois de suite) et au moment de quitter l'application. Rien n'est stocké
ailleurs, rien ne part sur un serveur.

Dans **Réglages** :

- **Exporter...** enregistre une copie de ce fichier où vous voulez (une clé
  USB, un dossier de sauvegarde). C'est la façon de passer votre progression
  d'un Mac à un autre.
- **Importer...** relit un fichier exporté et remplace la progression en
  cours. Un fichier qui n'a pas été produit par l'application est refusé.
- **Tout effacer...** remet le dossier à zéro. Deux confirmations sont
  demandées, et vos réglages (thème, rythme) survivent à l'effacement.

---

## 4. Construire l'application depuis les sources

Cette partie ne sert que si vous voulez recompiler l'application vous-même.
Pour vous en servir, le `.dmg` de la partie 1 suffit.

### 4.1 Ce qu'il faut avoir

- macOS (l'application ne cible que le Mac).
- **Node.js 20 ou plus récent**, avec `npm`. Pour vérifier, dans le Terminal :
  `node --version`.

### 4.2 Les commandes

Toutes se lancent depuis le dossier `app/` :

```bash
cd app
npm install          # une seule fois : installe les dépendances
npm run build        # recopie le corpus puis compile l'interface
npm test             # la suite de tests
npm run dist:mac     # fabrique l'icône, compile, et produit les .dmg
```

Les disques d'installation sortent dans `app/release/`, avec les deux `.app`
correspondantes dans `app/release/mac-arm64/` et `app/release/mac/`.

Pour développer :

```bash
npm run dev          # l'interface seule, dans un navigateur
npm run dev:app      # l'interface et la fenêtre Electron ensemble
```

Ces deux dernières commandes ne rendent pas la main : elles tournent tant que
vous ne les arrêtez pas par Contrôle + C.

### 4.3 Le corpus

Les sujets vivent à la racine du projet (`piscine/`, `missions/`, `phase3/`,
`progression/`, `bertha/` et les trois fichiers de tête). Ils sont **en
lecture seule** : l'application ne les modifie jamais.

`npm run sync:corpus` les recopie dans `app/src/corpus/`, d'où ils sont
embarqués dans l'application à la compilation. Cette recopie est automatique
avant `npm run dev` et avant `npm run build`. Si un sujet s'affiche comme
introuvable dans le lecteur, c'est cette commande qu'il faut relancer, suivie
d'un `npm run build`.

---

## 5. En cas de pépin

| Ce que vous voyez | Ce qu'il faut faire |
|---|---|
| « Le développeur ne peut pas être vérifié » | Clic droit sur l'application puis « Ouvrir » (partie 1.3) |
| « COBOL Quest est endommagé » | La commande `xattr` de la partie 1.3 |
| L'application s'ouvre sur une fenêtre vide | Quittez et relancez ; si cela persiste, recompilez avec `npm run build` |
| Un sujet manque dans le lecteur | `npm run sync:corpus` puis `npm run build` |
| La progression semble perdue | Réglages, « Importer... », et reprenez votre dernier export |
| Un bandeau rouge s'affiche en haut | Il donne la raison exacte : le fichier de progression n'a pas pu être lu, la sauvegarde continue en mémoire |

---

## 6. Ce que l'application ne fait pas

- Elle ne compile pas votre COBOL et ne juge pas vos exercices : **BERTHA fait
  foi**, dans votre Terminal. L'application ne fait qu'enregistrer son verdict.
- Elle ne va sur aucun réseau : ni mise à jour, ni statistiques, ni compte.
- Elle ne modifie pas le corpus. Vos programmes, vos dossiers de travail et vos
  sujets ne risquent rien.
