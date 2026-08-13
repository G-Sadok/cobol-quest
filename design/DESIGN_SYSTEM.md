# COBOL QUEST — DESIGN SYSTEM (v2 « Dossier CGBA »)
App macOS, fenêtre 1280×800 minimum, redimensionnable, 100 % hors-ligne, interface en français.
Toutes les valeurs sont normatives : hex, px, ms. Maquette de référence : `COBOL QUEST v2.dc.html`.

**Le principe** : la coque est une application macOS moderne (barre latérale, toolbar unifiée, matières claires, profondeur légère) ; le papier est celui des listings d'imprimante de 1987 (crème, filets, tampons à l'encre, vert de registre bancaire). Le terminal phosphore n'est pas l'interface — c'est un **objet dans l'interface** : la console BERTHA et les blocs de code. Il reste rare, donc précieux.

---

## 1. Couleurs

### Surfaces (quatre, pas plus)
| Token | Hex | Usage |
|---|---|---|
| `--canevas` | `#EFE9DC` | fond de la zone de contenu |
| `--carte` | `#FDFBF6` | cartes, panneaux, tuiles actives |
| `--carte-tete` | `#F7F3EA` | en-têtes de carte, en-têtes de tableau |
| `--panneau` | `#E9E3D5` | volet latéral droit (Feuille de route), pistes de jauge |
| `--barre` | `#E6E0D2` | barre latérale de navigation |
| `--console` | `#16160F` | console BERTHA, blocs de code, bandeau Salle machine, toast |

La toolbar est `rgba(239,233,220,.86)` + `backdrop-filter: blur(20px)`.

### Traits
| Token | Hex | Usage |
|---|---|---|
| `--trait` | `#D8D0BE` | bordure par défaut des cartes (1px) |
| `--trait-doux` | `#EAE4D6` / `#EDE7DA` | séparateurs internes de liste |
| `--trait-fort` | `#C3B9A2` | bordure de bouton secondaire, pointillés |
| `--trait-verrou` | `#BCB09A` | bordure `1px dashed` des salles verrouillées |
| `--trait-console` | `#2E3A2E` | bordures à l'intérieur des zones sombres |

### Encres — **toutes vérifiées AA (≥ 4,5:1) sur les quatre surfaces claires**
| Token | Hex | Usage |
|---|---|---|
| `--encre` | `#1B1915` | titres, texte fort |
| `--encre-lecture` | `#2A2721` | corps des sujets (17px) |
| `--encre-2` | `#5C554A` | texte de soutien sur carte |
| `--encre-3` | `#615B4F` | **gris secondaire unique** : métadonnées, labels mono, légendes |
| `--vert` | `#1C5D38` | couleur d'action et de progression (boutons, coches, jauges, item de nav actif) |
| `--vert-fonce` | `#164A2C` | survol du bouton primaire |
| `--ambre` | `#8F5A08` | tout l'ambre : XP, « en cours », labels d'encart, remplissage de jauge, pastille d'état, repère de seuil |
| `--rouge` | `#A82C22` | tampon d'encre, destructif, mauvaise réponse |
| `--phosphore` | `#79E08D` | texte sur `--console` |
| `--phosphore-2` | `#7E9484` | texte secondaire sur `--console` |
| `--phosphore-3` | `#DDEBDF` | texte fort sur `--console` |

**Règle de contraste :** `--encre-3` est le gris le plus clair autorisé pour du texte, quelle que soit la surface. Ne jamais introduire de gris intermédiaire « juste pour cette carte » — c'est ce qui casse l'AA.

### Fonds teintés
| Usage | Fond | Bordure |
|---|---|---|
| Succès / bonne réponse | `#F0F5EE` | `#C9DCC6` |
| Salle validée | `#F1F5EF` | `#C3D4C1` |
| Avertissement / piège / en cours | `#FDF6E8` | `#E8D5AE` |
| Danger | `#FBF0EE` | `#E7C6C1` |
| Médaille obtenue | `#F6EBD6` | `#E0C99B` |
| Salle verrouillée | `#EBE6DA` | `#BCB09A` (dashed) |

### Les 4 états de salle (écran La Carte)
| État | Fond | Bordure | Code | Titre | Étiquette |
|---|---|---|---|---|---|
| Verrouillée | `#EBE6DA` | `1px dashed #BCB09A` | `#5F594D` | `#5F594D` | « Verrouillée », texte `#5F594D`, bordure `#BCB09A`, fond transparent |
| Disponible | `#FDFBF6` | `1.5px solid #1C5D38` | `#1C5D38` | `#1B1915` | « Disponible », texte `#F6F2E8` sur `#1C5D38` ; halo `0 0 0 3px rgba(28,93,56,.09)` |
| En cours | `#FDF6E8` | `1.5px solid #8F5A08` | `#8F5A08` | `#1B1915` | « En cours », texte `#FDFBF6` sur `#8F5A08` |
| Validée | `#F1F5EF` | `1px solid #C3D4C1` | `#4A6350` | `#3F5343` | tampon `VALIDE +180` (voir 6.5) |

Sémantique : **vert = accès et progression, ambre = en cours et valeur, rouge = encre officielle (tampon) et destruction, gris désaturé = fermé**. La couleur porte le statut ; l'étiquette ne fait que le confirmer.

---

## 1bis. Thème sombre

L'app est commutable : bouton lune/soleil dans la toolbar, interrupteur « Thème sombre » dans Réglages. Techniquement, **toutes les couleurs sont des variables CSS** définies sur `:root` (clair) et surchargées par `[data-sombre="1"]` posé sur la racine — aucune couleur en dur dans les composants. Ajouter un thème = ajouter un bloc de surcharge, rien d'autre.

La console BERTHA, les blocs de code et le toast **ne changent pas** entre les deux thèmes : c'est le point fixe de l'identité.

| Variable | Clair | Sombre |
|---|---|---|
| `--canevas` | `#EFE9DC` | `#14150F` |
| `--carte` | `#FDFBF6` | `#1D1E17` |
| `--tete` | `#F7F3EA` | `#23241C` |
| `--panneau` | `#E9E3D5` | `#191A13` |
| `--barre` | `#E6E0D2` | `#101109` |
| `--console` | `#16160F` | `#0A0B06` |
| `--trait` | `#D8D0BE` | `#33352A` |
| `--trait-fort` | `#C3B9A2` | `#4A4D3E` |
| `--encre` | `#1B1915` | `#F1EDE1` |
| `--lecture` | `#2A2721` | `#DFDACB` |
| `--encre-2` | `#5C554A` | `#B5AF9E` |
| `--encre-3` | `#615B4F` | `#9C9585` |
| `--vert` | `#1C5D38` | `#4FBF7B` |
| `--vert-survol` | `#164A2C` | `#6BD494` |
| `--sur-vert` (texte sur aplat vert) | `#F6F2E8` | `#0C1710` |
| `--ambre` | `#8F5A08` | `#E3A94E` |
| `--rouge` | `#A82C22` | `#E8837A` |
| `--validee-bg` / `--validee-code` | `#F1F5EF` / `#4A6350` | `#16241A` / `#8FC29E` |
| `--verrou-bg` / `--verrou-txt` | `#EBE6DA` / `#5F594D` | `#1A1B14` / `#9A9384` |
| `--warn-bg` / `--warn-txt` | `#FDF6E8` / `#3A3327` | `#26200F` / `#E4D9BE` |
| `--danger-bg` / `--danger-txt` | `#FBF0EE` / `#7A4A44` | `#2A1512` / `#E5B9B2` |
| `--phosphore` / `--phosphore-2` / `--phosphore-3` | `#79E08D` / `#7E9484` / `#DDEBDF` | identiques |
| ombre `--o1` (carte) | `rgba(27,25,21,.05)` | `rgba(0,0,0,.35)` |
| ombre `--o2` (carte principale) | `rgba(27,25,21,.06)` | `rgba(0,0,0,.45)` |
| voile de modale | `rgba(30,26,20,.34)` | `rgba(0,0,0,.58)` |
| toolbar translucide | `rgba(239,233,220,.86)` | `rgba(20,21,15,.86)` |

Le vert et l'ambre s'éclaircissent en sombre (le vert d'action `#1C5D38` serait illisible sur `#1D1E17`) ; en contrepartie le texte posé **sur** un aplat vert s'assombrit (`--sur-vert`). Vérifier l'AA dans les deux thèmes avant d'introduire une couleur.

---

## 2. Typographie — deux familles, deux rôles

```css
--sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Segoe UI", sans-serif;
--mono: ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono", "Courier New", monospace;
```

Aucune webfont, aucun `@font-face`.

**Sans** = tout ce qui se lit : titres, corps, boutons, réponses de quiz.
**Mono** = tout ce qui est *machine* : codes de salle (J03), matricule, XP, labels de section, sorties BERTHA, code, tampons. Jamais un paragraphe en mono.

| Rôle | Famille | Taille | Graisse | Interligne | Interlettrage |
|---|---|---|---|---|---|
| Titre d'écran | sans | 30px | 680 | 1.2 | −.02em |
| Titre de section / carte | sans | 18–22px | 640 | 1.3 | −.01em |
| Sous-titre de bloc | sans | 15–17px | 600–640 | 1.4 | −.01em |
| **Corps de lecture (sujets)** | sans | **17px** | 400 | **1.75** | 0 |
| Corps d'interface | sans | 14–15px | 400 | 1.6 | 0 |
| Métadonnée | sans | 12–13px | 400 | 1.55 | 0 |
| Label de section | mono | 10–11px | 400–600 | 1.4 | `.16–.22em` |
| Code / console | mono | 13.5px | 400 | 1.75 | 0 |
| Données tabulaires | mono | 11–12.5px | 400–600 | 1.5 | `.06–.1em` |

**Accents :** tout ce qui est en MAJUSCULES perd ses accents (`VALIDE`, `DECORATIONS`, `BERTHA DIT NON`) — clin d'œil aux sorties COBOL. Tout le reste est accentué normalement, y compris les titres d'écran, qui sont en **casse de phrase** (« Le livret », « Les conditions »). Les majuscules sont réservées aux labels mono, aux tampons et aux toasts.

Colonne de lecture : `max-width: 68ch`, centrée dans son volet (≈ 70–80 caractères à 17px).

---

## 3. Espacements, rayons, profondeur

Échelle (px) : **2 · 5 · 7 · 9 · 11 · 14 · 18 · 22 · 26 · 30 · 40 · 52 · 72**

- Barre latérale : `248px` fixe. Toolbar : `52px`. Barre de feux : `52px` (intégrée en haut de la barre latérale).
- Marge d'écran : `40px 28px` (haut/côtés), `72px` en bas. Lecteur : `44px 48px`.
- Largeur de contenu : 1020px (Terminal), 1080px (Carte, Livret), 720px (Quiz), 680px (Réglages). Toujours centré.
- Padding de carte : `26px 22px` (grande), `18px 20px` (moyenne), `12px 14px` (ligne de liste).
- Gouttière : `22px` entre blocs, `11–12px` entre tuiles.

**Rayons :** 13px modale · 12px grande carte · 9–10px carte, tuile, bloc de code, toast · 7px bouton · 6px puce/pastille · 5px micro-étiquette · 50% avatars et médailles.

**Ombres — trois seulement :**
```css
--ombre-1: 0 1px 2px rgba(27,25,21,.05);                             /* toute carte posée */
--ombre-2: 0 1px 2px rgba(27,25,21,.05), 0 14px 36px rgba(27,25,21,.06); /* carte principale d'écran */
--ombre-3: 0 24px 60px rgba(27,25,21,.30);                            /* modale */
```
Bouton primaire : `0 1px 2px rgba(27,25,21,.16)`, au survol `0 3px 10px rgba(28,93,56,.28)`.

---

## 4. Animations

| Nom | Durée | Courbe | Usage |
|---|---|---|---|
| transition d'état | **130ms** | `ease-out` | survol, bordure, fond, ombre |
| bascule d'interrupteur | 150ms | `ease-out` | Réglages |
| jauge | 240ms | `ease-out` | largeur des barres d'XP |
| `tampon` | 440ms | `cubic-bezier(.2,.8,.3,1)` | tampon VALIDÉ : `scale(1.6)→1`, `rotate(-7deg)`, opacité 0→.88 |
| `toastin` | 190ms | `ease-out` | toast : +14px → 0, fondu |
| `phosphore` | 1060ms `step-end` (curseur) / 2400ms `ease-in-out` (pastille BERTHA) | infini | opacité 1 ↔ .15 |

`prefers-reduced-motion: reduce` → supprimer `tampon` et `phosphore`, garder les transitions 130ms.

---

## 5. Navigation — barre latérale

`248px`, fond `#E6E0D2`, bordure droite `#D3CAB6`. De haut en bas : feux macOS (12px, `#F2604C` / `#F5BE4F` / `#61C554`), bloc d'identité (`CGBA · 1962` mono 10px `.22em` / « Cobol Quest » 17px/650 / « Opération Marcel » 12px), les 6 items, puis la carte de profil ancrée en bas.

**Item de nav** : hauteur 38px (`padding: 7px 8px`), rayon 7px, `gap: 10px`. Puce mono 24×24px rayon 6px avec le code à 2 lettres (TR, CA, SU, QZ, LV, RG) — fond `#DCD5C5`, texte `#5C554A`. Libellé 14px. Compteur mono 10px à droite (`19`, `J03`, `3`).
**Actif** : fond `#1C5D38`, libellé `#F6F2E8` en 600, puce `rgba(255,255,255,.16)`, compteur `rgba(246,242,232,.75)`.
Raccourcis : `⌘1`…`⌘6`. Ordre figé : Le terminal · La carte · Le sujet · Le quiz · Le livret · Réglages.

**Carte de profil** (bas de barre) : carte `#FDFBF6`, rayon 8px. Avatar 34px `#1C5D38`, rôle 13px/600, matricule mono 10px, jauge d'échelon 5px rayon 3px sur piste `#E3DDCE`, puis « Échelon 3 / 9 » et l'XP en `#8F5A08`/600.

**Toolbar** (52px, en haut du contenu) : titre de l'écran 13px/600 + précision 13px `#615B4F` à gauche ; à droite la pastille « BERTHA EN LIGNE » (mono 11px, fond `#E7E1D3`, bordure `#D8D0BE`, rayon 6px, point 6px `#1C5D38` animé `phosphore`).

---

## 6. Composants

### 6.1 Boutons
| Variante | Repos | Survol | Désactivé |
|---|---|---|---|
| **Primaire** | fond `#1C5D38`, texte `#F6F2E8`, 14px/600, `padding: 12px 22px`, rayon 7px, ombre bouton | fond `#164A2C` + ombre verte | fond `#D8D0BE`, texte `#8C8577`, sans ombre, `not-allowed` |
| **Secondaire** | fond `#FDFBF6`, texte `#1B1915`, bordure `#C3B9A2`, 13,5–14px, `padding: 9px 16px` | fond `#F2EDE1` | texte `#8C8577`, bordure `#DFD8C8` |
| **Danger** | fond `#FDFBF6`, texte `#A82C22`/600, bordure `#DDA9A2` | fond `#A82C22`, texte `#FDFBF6` | identique secondaire désactivé |
| **Lien** | sans fond ni bordure, texte `#1C5D38` 13px | texte `#164A2C` | — |
| **Console** | transparent, texte `#8FA893`, bordure `#2E3A2E`, mono 10px `.1em`, rayon 5px | texte `#79E08D`, bordure `#4A6650` | — |

Libellés en casse de phrase, avec `…` si l'action ouvre une boîte (« Exporter… », « Tout effacer… »). Focus clavier : `box-shadow: 0 0 0 3px rgba(28,93,56,.28)`, pas d'`outline` navigateur.

### 6.2 Case à cocher « registre »
Carré `18×18px`, rayon 5px, `box-shadow: inset 0 1px 1px rgba(27,25,21,.05)`. Décoché : fond `#FDFBF6`, bordure `#C3B9A2`. Coché : fond et bordure `#1C5D38`, glyphe `✓` 11px `#F6F2E8`. La ligne entière est cliquable (`padding: 12px 14px`, séparateur `#EDE7DA`) ; une fois cochée, la ligne prend le fond `#F7F5EE` et le titre passe en `#615B4F`. Chaque bascule déclenche un toast.

### 6.3 Barre d'XP
Piste : hauteur 5px (profil), 7–8px (contenu), rayon 4px, fond `#E9E3D5` (`#E3DDCE` dans la barre latérale). Remplissage `--vert` (progression validée) ou `--ambre` (épreuve en cours), même rayon. Repère de seuil : trait vertical `2px` `--ambre` rayon 1px dépassant de 5px. Transition 240ms.

### 6.4 Badge / décoration
Tuile rayon 10px, `padding: 18px 16px`. Médaille : cercle 40px, glyphe 17px.
**Obtenu** : fond `--carte`, bordure `--trait`, ombre-1 ; médaille fond `--medaille-bg`, bordure `--bd-medaille`, glyphe `--ambre` ; nom mono 11px/600 `--encre`.
**Grisé** : fond `#EDE9DF`, bordure `#DFD8C8`, pas d'ombre ; médaille transparente bordure `#D3CAB6` glyphe `#615B4F` ; nom `#6B6458`.
La condition d'obtention (12px `#615B4F`) reste visible dans les deux états.

### 6.5 Tampon VALIDÉ
Encre rouge `#A82C22`, `2.5px double`, rayon 6px, mono 600, `letter-spacing: .2em`, `rotate(-7deg)`, opacité .88.
Deux tailles : **19px** `padding: 9px 24px` (écran de score, animation `tampon`) et **8px** `1.5px double`, `padding: 1px 4px`, `rotate(-7deg)`, opacité .8 (coin supérieur droit d'une salle validée). Toujours accompagné de l'XP : `VALIDE +180`.

### 6.6 Toast « BERTHA DIT OUI / NON »
Le seul élément sombre flottant : fond `#16160F`, texte `#E3EDE4` mono 11,5px `.06em`, rayon 9px, `padding: 11px 18px`, ombre `0 10px 30px rgba(27,25,21,.28)`, centré à `bottom: 28px`. Point de 7px en tête : `#79E08D` (oui) ou `#F28B82` (non). Entrée `toastin`, durée **2400ms**, un seul à la fois, jamais bloquant, pas de bouton de fermeture.

### 6.7 Modale de confirmation
Voile `rgba(30,26,20,.34)` + `blur(3px)`. Boîte 420px, fond `#F6F2E8`, bordure `#C3B9A2`, rayon 13px, ombre-3, `padding: 26px 26px 20px`, **centrée en texte**. Pastille 44px en tête (fond `#FBF0EE`, bordure `#E7C6C1`, glyphe `#A82C22`). Titre 16px/640, corps 13,5px `#5C554A`. Deux boutons `flex:1` : Secondaire (Annuler) puis Danger plein (Effacer). `Échap` annule ; l'action destructive n'est jamais le bouton par défaut.

### 6.8 Console BERTHA et bloc de code
Fond `#16160F`, rayon 9px, `padding: 14–20px`, mono 13,5px, texte `#79E08D`, interligne 1.75. Texte secondaire `#7E9484`, nom de fichier `#DDEBDF`. Le curseur est un bloc plein `8×15px` `#79E08D` animé `phosphore` — un seul par bloc, `aria-hidden`. Un bouton Console (§6.1) peut être ancré à droite. Désactivable dans Réglages (le bloc repasse alors sur `#F0EBDF` avec texte `#1B1915`).

### 6.9 Interrupteur
Piste `44×26px`, rayon 13px, sans bordure. Actif `#1C5D38`, inactif `#CFC6B2`. Pastille `22px` `#FDFBF6`, ombre `0 1px 3px rgba(27,25,21,.22)`, alignée par `justify-content`. Transition 150ms.

### 6.10 Bouton radio (rythme)
Cercle 17px, bordure `#C3B9A2`, fond `#FDFBF6` ; actif : fond et bordure `#1C5D38`, point interne 6px `#F6F2E8`. Ligne entière cliquable, `padding: 14px 20px`, séparateur `#EDE7DA`, ligne active en `#F5F2E9` avec libellé en 600.

### 6.11 Encart
Carte pleine à fond teinté (§1) sans bordure gauche épaisse : label mono 10px `.16em` de la couleur du sujet, puis corps 15px `#2A2721`. Ambre = piège, vert = confirmation, rouge = erreur. Les citations de Marcel utilisent la surface `#F7F3EA` et un corps 16px/1.65.

### 6.12 Tableau
Bordure extérieure `#DFD8C8`, rayon 8px, `overflow: hidden`, pas de bordures verticales. En-tête `#F0EBDF`, mono 10px `.14em`/600 `#5C554A`. Cellules `padding: 11px 14px`, 14px. **Zébrage vert de listing** : lignes paires `#F4F7F2`. Colonne technique en mono `#1C5D38`, colonne d'exemple en mono 12,5px `#5C554A`.

---

## 7. Règles d'usage

1. Quatre surfaces maximum par écran. Le sombre `#16160F` n'apparaît que pour BERTHA, le code, le bandeau Salle machine et le toast — jamais comme fond de page.
2. Un seul accent ambre par bloc visuel : si l'XP est en ambre, le titre voisin ne l'est pas.
3. Un seul ambre, `--ambre` : il sert au texte comme aux objets (jauges, points, repères).
4. `#615B4F` est le gris le plus clair autorisé pour du texte, sur n'importe quelle surface.
5. Aucun dégradé, aucun néon, aucun fond animé. La profondeur vient des trois ombres du §3.
6. Verrouillé = gris désaturé et pointillés, jamais un vert atténué.
7. Titres en casse de phrase ; MAJUSCULES réservées aux labels mono, tampons et toasts, et alors sans accents.
8. Toute action irréversible passe par la modale §6.7 ; toute action réversible par un toast §6.6.
9. Cibles cliquables ≥ 32px de haut ; lignes de liste ≥ 40px.
10. Contraste AA (4,5:1) vérifié sur **la surface réelle** de l'élément, pas sur le blanc de la carte.
