# COBOL QUEST 1.1.0, Opération Marcel

Un septième écran : **Le guide**, le mode d'emploi de l'application, qui ne
raconte pas un parcours imaginaire mais lit votre dossier et parle de celui-là.

Tout le reste est inchangé depuis la 1.0.0. Votre progression est conservée :
le fichier n'a pas changé de forme, la 1.1.0 relit celui de la 1.0.0 tel quel.

---

## Télécharger

| Votre Mac | Fichier | Taille |
|---|---|---|
| Puce Apple (M1, M2, M3, M4...) | `COBOL Quest-1.1.0-arm64.dmg` | 114,9 Mio |
| Processeur Intel | `COBOL Quest-1.1.0.dmg` | 119,5 Mio |

Menu Pomme puis « À propos de ce Mac » vous dit lequel vous avez.

### Empreintes SHA-256

```
20ff9203686bd785b8183f5008eeaec1e08d9ce30383b2706363effa6f1bc4b9  COBOL Quest-1.1.0-arm64.dmg
eeecd2b6655baf144a8f725f8c21e3e9827e194920d0e99cb95a702c53895245  COBOL Quest-1.1.0.dmg
```

Pour vérifier après téléchargement :

```bash
shasum -a 256 ~/Downloads/"COBOL Quest-1.1.0-arm64.dmg"
```

---

## Installer, et la première ouverture

1. Double-cliquez sur le `.dmg`, glissez **COBOL Quest** dans **Applications**,
   éjectez le disque. Si une version précédente est déjà là, remplacez-la : la
   progression vit ailleurs, dans votre dossier utilisateur, et ne bouge pas.
2. **La première fois seulement** : clic droit (ou Contrôle + clic) sur
   l'application, puis **Ouvrir**, puis **Ouvrir** dans la boîte qui s'affiche.

L'application est distribuée **non signée** (signature ad-hoc, identifiant
`cgba.cobolquest`, aucun certificat Apple) : macOS demande donc un accord
explicite, une fois. Si le message parle d'application « endommagée », c'est la
quarantaine des téléchargements :

```bash
xattr -dr com.apple.quarantine "/Applications/COBOL Quest.app"
```

---

## Nouveau dans la 1.1.0 : l'écran LE GUIDE (Cmd + 7)

Il s'adresse à quelqu'un qui vient d'installer l'application et ne sait pas par
où commencer. Ce qui le distingue d'un mode d'emploi ordinaire : **il lit la
progression réelle**. Il ne dit pas « cliquez sur la salle disponible », il dit
« ouvrez J01, les quatre divisions », et le bouton l'ouvre.

En tête, un bloc **OU VOUS EN ETES** : ce qu'il y a à faire maintenant, en une
phrase et un bouton. Puis six chapitres dépliables, un seul ouvert à la fois,
celui qui correspond à votre situation s'ouvrant tout seul à l'arrivée.

| Chapitre | Ce qu'il dit de votre dossier |
|---|---|
| Le plan des sous-sols | La salle où vous en êtes, nommée, et combien sont déjà validées |
| Cocher un exercice | Les XP qui manquent avant le seuil du jour, et la commande BERTHA exacte de l'exercice qui vient |
| Le quiz du soir | La séance ouverte, celle encore verrouillée et ce qui l'ouvrira, ou les 10 XP déjà acquis |
| Décorations et échelons | Combien vous en avez, et ce qui manque avant le grade suivant |
| La progression est un fichier | Où il est, ce qu'il contient en ce moment, comment le déplacer |
| Raccourcis et dépannage | Les raccourcis, tirés du registre des écrans : ils ne peuvent pas mentir |

Chaque chapitre finit par un bouton qui emmène à l'écran dont il parle.

Le guide est posé en **dernier** dans la barre latérale : les raccourcis Cmd + 1
à Cmd + 6 ne bougent pas d'un cran, et le guide prend Cmd + 7.

---

## Ce que contient l'application

**Les sept écrans** (Cmd + 1 à Cmd + 7) : Le terminal (tableau de bord), La
carte (le plan des sous-sols), Le sujet (lecteur et feuille de route), Le quiz
du soir, Le livret (décorations et échelons), Réglages, Le guide.

**Le programme complet** : 20 épreuves, soit les 11 journées de la piscine
(J00 à J10), les 2 rushs, les 6 missions et la phase 3. Exercices, barèmes et
seuils extraits fidèlement des sujets.

**Les quiz du soir** : 11 séances rédigées, 8 questions à 4 choix, correction
commentée. Six bonnes réponses sur huit rapportent 10 XP, une seule fois par
épreuve, les tentatives restant libres.

**La carrière** : 26 décorations, dont 21 attribuées automatiquement et 5
laissées sur l'honneur. 9 échelons, qui demandent des XP **et** des épreuves
validées.

**La progression** vit dans un vrai fichier,
`~/Library/Application Support/cobol-quest/progression.json`. Export et import
par les boîtes de dialogue de macOS ; un fichier étranger est refusé. Remise à
zéro à double confirmation, qui conserve vos réglages.

**Hors ligne, sans compte, sans réseau.**

---

## Vérifications passées par cette version

| Harnais | Résultat |
|---|---|
| Tests unitaires (`npm test`) | 376 tests, 21 fichiers, verts |
| Autotest Electron | 7 écrans, 19 salles, 26 médailles, le guide et ses 6 chapitres, mise en page sans débordement à 1280, 1440 et 1680 px |
| Parcours de bout en bout (`npm run parcours`) | 16 étapes et 8 contrôles de fichiers, **relance de l'application comprise** |
| Sonde des chemins d'échec (`npm run parcours -- --sonde`) | 13 étapes et 3 contrôles : quiz raté sans XP, case décochée qui reverrouille la suite, échelon qui exige plus que des XP, import invalide refusé, remise à zéro complète |

Les trois derniers ont été joués **sur l'application empaquetée**, pas seulement
sur les sources.

---

## Limites connues

- **Application non signée** : `spctl` la rejette, d'où le clic droit de la
  première ouverture. Aucun compte développeur Apple n'entre dans ce projet.
- **macOS seulement.**
- **L'application ne juge rien** : BERTHA fait foi, dans votre Terminal.
- La fenêtre ne descend pas sous 1280 x 800 points.

---

## Construire depuis les sources

```bash
cd app
npm install
npm run dist:mac     # les deux .dmg sortent dans app/release/
```

Node.js 20 ou plus récent, macOS. Le détail est dans [`README.md`](README.md),
le guide d'installation pas à pas dans [`app/README.md`](app/README.md), et les
notes de la version précédente dans [`RELEASE_v1.0.0.md`](RELEASE_v1.0.0.md).
