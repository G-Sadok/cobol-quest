# COBOL QUEST 1.0.0, Opération Marcel

Première version publique. Le campus virtuel de la CGBA devient une application
de bureau macOS, en français, qui fonctionne entièrement hors ligne.

Ce fichier est le texte de la page de version (GitHub Releases) : il décrit ce
que contient la 1.0.0, ce qu'il faut télécharger, et comment l'ouvrir la
première fois.

---

## Télécharger

| Votre Mac | Fichier | Taille |
|---|---|---|
| Puce Apple (M1, M2, M3, M4...) | `COBOL Quest-1.0.0-arm64.dmg` | 114,9 Mio |
| Processeur Intel | `COBOL Quest-1.0.0.dmg` | 119,5 Mio |

Menu Pomme puis « À propos de ce Mac » vous dit lequel vous avez.

### Empreintes SHA-256

```
1ebb7dbb5b72104e2ba4033d96f969869c1346fe9cb727fc4dbbe360bdb26f9b  COBOL Quest-1.0.0-arm64.dmg
14662b67153d0543e987f5e47129224e30f013a0005cd786411fc8d42265914d  COBOL Quest-1.0.0.dmg
```

Pour vérifier après téléchargement :

```bash
shasum -a 256 ~/Downloads/"COBOL Quest-1.0.0-arm64.dmg"
```

---

## Installer, et la première ouverture

1. Double-cliquez sur le `.dmg`, glissez **COBOL Quest** dans **Applications**,
   éjectez le disque.
2. **La première fois seulement** : clic droit (ou Contrôle + clic) sur
   l'application, puis **Ouvrir**, puis **Ouvrir** dans la boîte qui s'affiche.

Cette étape est nécessaire parce que l'application est distribuée **non signée**
(signature ad-hoc, identifiant `cgba.cobolquest`, aucun certificat Apple). macOS
demande donc un accord explicite, une fois. Si le message parle d'application
« endommagée », c'est la quarantaine des téléchargements :

```bash
xattr -dr com.apple.quarantine "/Applications/COBOL Quest.app"
```

---

## Ce que contient cette version

**Les six écrans** (Cmd + 1 à Cmd + 6) : Le terminal (tableau de bord), La
carte (le plan des sous-sols), Le sujet (lecteur et feuille de route), Le quiz
du soir, Le livret (décorations et échelons), Réglages.

**Le programme complet** : 20 épreuves, soit les 11 journées de la piscine
(J00 à J10), les 2 rushs, les 6 missions et la phase 3. Exercices, barèmes et
seuils de validation extraits fidèlement des sujets, contrôle croisé avec le
livret consigné dans le journal de construction.

**Les quiz du soir** : 11 séances rédigées (J01 à J09, RUSH01, RUSH02), 8
questions à 4 choix chacune, correction commentée, au moins deux questions par
séance sur une sortie exacte ou sur les colonnes. Six bonnes réponses sur huit
rapportent 10 XP, une seule fois par épreuve, les tentatives restant libres.

**La carrière** : 26 décorations, dont 21 attribuées automatiquement dès que la
condition se lit dans les exercices cochés ou les XP, et 5 laissées sur
l'honneur parce qu'elles demandent un jugement que l'application ne peut pas
porter. 9 échelons, qui demandent des XP **et** des épreuves validées.

**La progression** vit dans un vrai fichier,
`~/Library/Application Support/cobol-quest/progression.json`, écrit une
demi-seconde après chaque changement et au moment de quitter. Export et import
par les boîtes de dialogue de macOS ; un fichier étranger à l'application est
refusé. Remise à zéro à double confirmation, qui conserve vos réglages.

**Hors ligne, sans compte, sans réseau.** Les 24 sujets sont embarqués dans
l'application à la compilation. Rien n'est téléchargé, rien n'est envoyé.

---

## Ce que la version a passé comme vérifications

| Harnais | Résultat |
|---|---|
| Tests unitaires (`npm test`) | 358 tests, 20 fichiers, verts |
| Autotest Electron | 6 écrans, 19 salles, 26 médailles, mise en page sans débordement à 1280, 1440 et 1680 px |
| Parcours de bout en bout (`npm run parcours`) | 16 étapes et 8 contrôles de fichiers, **relance de l'application comprise** : la progression survit |
| Sonde des chemins d'échec (`npm run parcours -- --sonde`) | 13 étapes et 3 contrôles : quiz raté sans XP, case décochée qui reverrouille la suite, échelon qui exige plus que des XP, import invalide refusé, remise à zéro complète |

Les trois derniers ont été joués **sur l'application empaquetée**, pas seulement
sur les sources, et les deux applications (Apple Silicon et Intel, cette
dernière sous Rosetta) démarrent et répondent.

---

## Limites connues

- **Application non signée.** `spctl` la rejette : c'est attendu, aucun compte
  développeur Apple n'entre dans ce projet. D'où le clic droit de la première
  ouverture.
- **macOS seulement.** Aucune version Windows ou Linux n'est produite.
- **L'application ne juge rien.** Elle ne compile pas votre COBOL : BERTHA fait
  foi, dans votre Terminal. Vous cochez ce que BERTHA a accepté.
- La fenêtre ne descend pas sous 1280 x 800 points.

---

## Construire depuis les sources

```bash
cd app
npm install
npm run dist:mac     # les deux .dmg sortent dans app/release/
```

Node.js 20 ou plus récent, macOS. Le détail est dans
[`README.md`](README.md) et le guide pas à pas dans
[`app/README.md`](app/README.md).
