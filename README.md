# COBOL QUEST, Opération Marcel

Le campus virtuel de la CGBA, sur votre Mac : une application de bureau en
français qui accompagne le cursus COBOL de la Compagnie Générale de Banque et
d'Assurance. Vous y lisez les sujets, vous cochez les exercices que la
moulinette BERTHA a validés, vous gagnez des XP, vous ouvrez les salles
suivantes, vous passez les quiz du soir et vous suivez votre carrière.

**Entièrement hors ligne.** Les 24 sujets sont embarqués dans l'application au
moment de la compilation : rien n'est téléchargé, rien n'est envoyé nulle part,
aucun compte n'est demandé. Votre progression vit dans un fichier, sur votre
disque, à vous.

| | |
|---|---|
| Version | 1.1.0 |
| Plateforme | macOS (Apple Silicon et Intel) |
| Pile | Electron + React 18 + Vite, JavaScript, CSS vanilla |
| Langue | français |
| Réseau | aucun |

---

## 1. Installer

### 1.1 Télécharger

Les disques d'installation sont sur la
[page des versions](../../releases/latest). Deux fichiers, un par famille de
Mac :

| Votre Mac | Le fichier à prendre | Taille |
|---|---|---|
| Puce Apple (M1, M2, M3, M4...) | `COBOL Quest-1.1.0-arm64.dmg` | 115 Mo |
| Processeur Intel | `COBOL Quest-1.1.0.dmg` | 120 Mo |

Si vous ne savez pas lequel vous avez : menu Pomme, en haut à gauche, puis
« À propos de ce Mac ». La ligne « Puce » ou « Processeur » vous le dit.

### 1.2 Installer

1. Double-cliquez sur le fichier `.dmg` téléchargé.
2. Faites glisser l'icône **COBOL Quest** dans le dossier **Applications**.
3. Éjectez le disque d'installation.

### 1.3 La toute première ouverture, une seule fois

L'application n'est **pas signée** auprès d'Apple : elle est distribuée telle
quelle, sans certificat de développeur payant. macOS s'en méfie par principe,
et un double-clic direct affiche « le développeur ne peut pas être vérifié ».

La marche à suivre, une seule fois :

1. Ouvrez le dossier **Applications**.
2. **Clic droit** (ou Contrôle + clic) sur **COBOL Quest**.
3. Choisissez **Ouvrir**.
4. Dans la boîte qui s'affiche, cliquez sur le bouton **Ouvrir**.

macOS retient votre accord : les fois suivantes, un double-clic suffit.

Si le message dit plutôt « COBOL Quest est endommagé et ne peut pas être
ouvert », c'est la mise en quarantaine des fichiers téléchargés qui parle. Dans
le Terminal :

```bash
xattr -dr com.apple.quarantine "/Applications/COBOL Quest.app"
```

Le guide d'installation pas à pas, écrit pour quelqu'un qui n'a jamais rien
installé, est dans [`app/README.md`](app/README.md).

---

## 2. Les sept écrans

| Raccourci | Écran | À quoi il sert |
|---|---|---|
| Cmd + 1 | Le terminal | Le tableau de bord : où vous en êtes, quoi faire maintenant |
| Cmd + 2 | La carte | Le plan des sous-sols : les 19 salles et leur état |
| Cmd + 3 | Le sujet | Le texte de l'épreuve et la feuille de route à cocher |
| Cmd + 4 | Le quiz | Les huit questions du soir sur la journée écoulée |
| Cmd + 5 | Le livret | Les 26 décorations et la grille des neuf échelons |
| Cmd + 6 | Réglages | Progression, rythme et affichage |
| Cmd + 7 | Le guide | Le mode d'emploi, écrit à partir de votre dossier |

### Le guide (Cmd + 7)

C'est la porte d'entrée pour quelqu'un qui ouvre l'application la première
fois, et il ne raconte pas un parcours imaginaire : il lit la progression réelle
et parle de celle-là. En tête, ce qu'il y a à faire maintenant, en une phrase et
un bouton. Puis six chapitres dépliables :

| Chapitre | Ce qu'il dit de vous |
|---|---|
| Le plan des sous-sols | La salle où vous en êtes, nommée, et le bouton qui l'ouvre |
| Cocher un exercice | Les XP qui manquent avant le seuil, et la commande BERTHA exacte de l'exercice qui vient |
| Le quiz du soir | La séance ouverte, celle encore verrouillée et ce qui l'ouvrira, ou les 10 XP déjà acquis |
| Décorations et échelons | Combien vous en avez, et ce qui manque avant le grade suivant |
| La progression est un fichier | Où il est, ce qu'il contient en ce moment, comment le déplacer |
| Raccourcis et dépannage | Les raccourcis, tirés du registre des écrans : ils ne peuvent pas mentir |

Chaque chapitre finit par un bouton qui emmène à l'écran dont il parle, et le
guide s'ouvre tout seul sur le chapitre qui correspond à votre situation.

Le déroulé d'une journée : ouvrir la salle disponible sur **La carte**, lire le
sujet, faire les exercices sur sa machine, les faire juger par BERTHA
(`./bertha/bertha.sh J01/ex01`), cocher dans la feuille de route **ce que
BERTHA a accepté**, atteindre le seuil du jour, puis passer le quiz du soir.
Six bonnes réponses sur huit rapportent 10 XP, une seule fois par épreuve, mais
les tentatives sont libres.

Les décorations que l'application sait mesurer tombent toutes seules ; les cinq
qui demandent un jugement humain se cochent sur l'honneur.

---

## 3. Votre progression

Un vrai fichier, écrit une demi-seconde après chaque changement et au moment de
quitter :

```
~/Library/Application Support/cobol-quest/progression.json
```

Dans **Réglages** : **Exporter...** en fait une copie où vous voulez (c'est la
façon de passer d'un Mac à un autre), **Importer...** la relit et remplace la
progression en cours (un fichier étranger à l'application est refusé), **Tout
effacer...** remet le dossier à zéro après deux confirmations, en gardant vos
réglages.

---

## 4. Construire depuis les sources

Utile seulement pour recompiler soi-même : pour se servir de l'application, le
`.dmg` suffit.

Il faut macOS et **Node.js 20 ou plus récent**. Toutes les commandes se lancent
depuis `app/` :

```bash
cd app
npm install          # une seule fois
npm run build        # recopie le corpus puis compile l'interface
npm test             # la suite de tests
npm run dist:mac     # fabrique l'icône, compile, produit les deux .dmg
```

Les livrables sortent dans `app/release/`. Pour développer :
`npm run dev` (interface seule) ou `npm run dev:app` (interface et fenêtre
Electron ensemble) ; ces deux commandes ne rendent pas la main.

---

## 5. Comment l'application est vérifiée

Quatre harnais, du plus unitaire au plus proche de l'usage réel. Les trois
derniers valent aussi bien sur les sources que sur le `.app` empaqueté.

| Commande | Ce qu'elle prouve |
|---|---|
| `npm test` | La logique pure : XP, seuils, déblocage séquentiel, échelons, unicité des XP de quiz, aller-retour export/import. 376 tests. |
| `CQ_AUTOTEST=1 npx electron .` | L'application démarre, les sept écrans se posent, le pont IPC répond, la mise en page tient à 1280, 1440 et 1680 px. Ne laisse aucune trace. |
| `npm run parcours` | Le parcours complet, **relance comprise** : J00 cochée, XP crédités, décoration accordée, J01 ouverte, quiz réussi, export, puis l'application est relancée de zéro et la progression est toujours là. |
| `npm run parcours -- --sonde` | Les chemins d'échec : quiz raté, case décochée qui reprend ses XP et reverrouille la suite, échelon qui exige plus que des XP, import invalide refusé, remise à zéro menée au bout. |

Les deux derniers acceptent un chemin d'application en argument, pour juger le
livrable plutôt que les sources :

```bash
npm run parcours -- "release/mac-arm64/COBOL Quest.app"
npm run parcours -- --sonde "release/mac-arm64/COBOL Quest.app"
```

Ils travaillent toujours dans un dossier utilisateur temporaire : votre propre
progression n'est jamais touchée.

---

## 6. Le contenu du dépôt

```
piscine/  missions/  phase3/          les sujets du cursus
progression/  bertha/                 le livret et la moulinette
00_PLAN_MAITRE.md                     le plan de formation
01_NORME_CGBA.md                      la norme de codage maison
02_J00_INSTALLATION.md                le sujet du premier jour
design/                               le design system et les maquettes
app/                                  l'application (tout le code)
CAHIER_DES_CHARGES.md                 la spécification qui fait loi
ETAT_APP.md                           la feuille de route, tâche par tâche
JOURNAL_CONSTRUCTION.md               le journal de bord de la construction
```

Le corpus (les sujets, le livret, la moulinette) est **en lecture seule** :
l'application le recopie dans `app/src/corpus/` et l'embarque à la
compilation, elle ne le modifie jamais.

Dans `app/` : `src/data/` porte le manifeste des 20 épreuves, les 9 échelons,
les 26 décorations et les 11 quiz du soir ; `src/store/` la progression et sa
persistance ; `src/ui/` les modules purs qui décident quoi afficher, tous
testés ; `src/ecrans/` les sept écrans, qui ne font que poser le résultat ;
`electron/` le processus principal, le pont IPC et les harnais de vérification.

---

## 7. Ce que l'application ne fait pas

- Elle ne compile pas votre COBOL et ne juge pas vos exercices : **BERTHA fait
  foi**, dans votre Terminal. L'application enregistre son verdict, rien de
  plus.
- Elle ne va sur aucun réseau : ni mise à jour, ni statistiques, ni compte.
- Elle ne touche ni à vos programmes, ni à vos dossiers de travail, ni aux
  sujets.
