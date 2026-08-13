# CDC DESIGN — Brief pour Claude Design
### À copier-coller dans Claude Design tel quel. Les livrables reviendront dans le dossier `design/`.

## Le produit
**COBOL QUEST — Opération Marcel** : une application macOS d'apprentissage du
COBOL par projet. L'univers : la CGBA, banque fictive fondée en 1962, dont le
système tourne sur un mainframe surnommé BERTHA. Le mentor : Marcel Dubois,
développeur COBOL depuis 1984, qui part à la retraite et forme sa relève —
l'utilisateur. Le ton : sérieux bancaire + tendresse rétro + humour pince-sans-
rire. L'app est le « campus » : on y lit des sujets d'exercices, on coche ses
victoires, on gagne des XP, on débloque des salles, on collectionne des badges.

## L'utilisateur et l'usage
Adulte francophone, débutant complet en programmation, sessions longues (30 min
à 3 h) alternant LECTURE de sujets denses et manipulation de cases à cocher. La
lisibilité prolongée prime sur l'effet de style. App de bureau macOS, fenêtre
1280×800 minimum, redimensionnable, sombre par défaut, 100% hors-ligne (aucune
webfont distante : prévoir une pile de polices système, base monospace).

## La direction artistique demandée
**« Rétro-terminal premium »** : l'âme d'un terminal CRT de salle machine 1987
(phosphore vert, ambre, scanlines discrètes, bordures ASCII `╔═╗║`), exécutée
avec la rigueur d'un produit moderne (hiérarchie claire, espacements généreux,
états visibles, micro-animations sobres). Éviter absolument : le « rétro cheap »
illisible, les néons criards, les fonds animés fatigants. Palette de départ
(ajustable si mieux justifié) : fond `#0A0F0A`, texte `#33FF66`, accent `#FFB000`,
danger `#FF5555`, succès tampon « VALIDÉ » façon encre. Interface 100% en
FRANÇAIS, titres en MAJUSCULES SANS ACCENTS (clin d'œil aux sorties COBOL),
corps de texte accentué normalement. Contraste AA minimum partout.

## Les 6 écrans à concevoir
1. **LE TERMINAL** (tableau de bord) : en-tête CGBA, échelon et titre de carrière
   (« Pupitreur »), barre d'XP vers le prochain échelon, carte « épreuve en
   cours » avec bouton REPRENDRE, 3 derniers badges, encart « citation de
   Marcel », rappel de commande (`./bertha/bertha.sh J03/ex05`).
2. **LA CARTE** : le sous-sol de la banque vu comme un plan — un couloir « LA
   PISCINE » avec les salles J00→J10 et deux salles latérales RUSH, un étage
   « LES MISSIONS » avec 6 bureaux (M01→M06), au fond « LA SALLE MACHINE »
   (Phase 3). Quatre états de salle à designer : verrouillée (porte grise +
   cadenas), disponible (porte verte, liseré clignotant), en cours (badge « EN
   COURS »), validée (tampon VALIDÉ + XP inscrits). C'est l'écran signature :
   soignez-le.
3. **LE LECTEUR DE SUJET** : colonne de lecture markdown confortable (~70-80
   caractères), blocs de code mono sur cartouche sombre, tableaux nets ; panneau
   latéral « FEUILLE DE ROUTE » : liste d'exercices avec cases à cocher, XP par
   ligne, section bonus, jauge du seuil de validation du jour, encart BERTHA.
4. **LE QUIZ DU SOIR** : carte de question (1/8), 4 réponses, feedback bonne/
   mauvaise avec explication d'une phrase, écran de score final (≥6/8 → +10 XP,
   tampon), bouton retenter.
5. **LE LIVRET** : grille de badges nommés (ex. « TUEUR DE GO TO »,
   « NÉCROMANCIEN ») en deux états obtenus/grisés avec leur condition ; tableau
   des 9 échelons de carrière avec position actuelle.
6. **RÉGLAGES** : export/import de progression, remise à zéro (danger),
   choix du rythme, interrupteur scanlines.

## Composants transverses à spécifier
Boutons (normal/hover/désactivé), case à cocher « registre », barre d'XP, badge,
tampon VALIDÉ, toast « BERTHA DIT OUI » / « BERTHA DIT NON », fenêtre modale de
confirmation, navigation principale entre les 6 écrans, curseur clignotant
décoratif, en-tête de fenêtre.

## Livrables attendus (à déposer dans le dossier `design/` du projet)
1. `DESIGN_SYSTEM.md` : tokens (couleurs, typo, tailles, espacements, rayons,
   ombres/effets, animations) + règles d'usage + spécification des composants.
2. Les 6 écrans en maquettes HTML/CSS statiques autonomes (un fichier par écran,
   sans dépendance réseau) — à défaut, des images haute définition.
3. `icone.png` : icône d'application 1024×1024 (thème terminal/CGBA, lisible en
   64 px).
4. `NOTES_INTEGRATION.md` : 10 lignes maximum de consignes aux développeurs
   (ce qui est essentiel, ce qui est sacrifiable).

Ces fichiers seront implémentés à l'identique par une équipe de développement
automatisée : soyez précis sur les valeurs (hex, px, ms), pas seulement sur les
intentions.
