# PISCINE — J06 : LE LANGAGE DES CHAÎNES
### STRING, UNSTRING, INSPECT, fonctions intrinsèques · XP du jour : 130 (+25 bonus)

> *Mémo de Marcel :*
> *« Les gens croient que le COBOL ne sait faire que des additions. Faux. La moitié
> du batch, c'est de la couture : découper des lignes, recoudre des libellés,
> masquer des numéros. Aujourd'hui je te donne les ciseaux, le fil et l'aiguille.
> Et un code secret, parce qu'on est vendredi. »*

---

## LE MÉMO DU JOUR

### 1. STRING — coudre
```cobol
           STRING WS-PRENOM   DELIMITED BY SPACE
                  " "         DELIMITED BY SIZE
                  WS-NOM      DELIMITED BY SPACE
               INTO WS-COMPLET
               ON OVERFLOW DISPLAY "ZONE TROP PETITE"
           END-STRING
```
- `DELIMITED BY SPACE` : s'arrête au premier espace de la source.
- `DELIMITED BY SIZE` : prend toute la zone, espaces compris.
- Pensez à `MOVE SPACES TO WS-COMPLET` avant : STRING n'efface pas ce qui traîne.

### 2. UNSTRING — découdre
```cobol
           UNSTRING WS-LIGNE DELIMITED BY ";"
               INTO WS-NOM WS-PRENOM WS-VILLE
               TALLYING IN WS-NB-CHAMPS
           END-UNSTRING
```
(`WS-NB-CHAMPS` doit être mis à zéro avant : TALLYING **ajoute**.)

### 3. INSPECT — compter, remplacer, transcoder
```cobol
           INSPECT WS-TXT TALLYING WS-NB FOR ALL "A" ALL "E"
           INSPECT WS-TXT REPLACING ALL "-" BY " "
           INSPECT WS-TXT CONVERTING "abcdefghijklmnopqrstuvwxyz"
                               TO    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
```

### 4. La modification de référence — le scalpel
`WS-CHAINE(debut:longueur)` désigne une tranche :
```cobol
           DISPLAY WS-IBAN(1:4)                *> 4 premiers caracteres
           MOVE ALL "*" TO WS-IBAN(5:19)       *> masque 19 caracteres
           MOVE WS-MOT(WS-I:1) TO WS-CAR       *> le i-eme caractere
```

### 5. Les fonctions intrinsèques du jour
| Fonction | Effet |
|---|---|
| `FUNCTION UPPER-CASE(x)` / `LOWER-CASE(x)` | casse |
| `FUNCTION TRIM(x)` | coupe espaces de tête et de queue |
| `FUNCTION LENGTH(x)` | longueur DÉCLARÉE de la zone |
| `FUNCTION REVERSE(x)` | miroir |
| `FUNCTION NUMVAL(x)` | texte "12.50" → nombre 12.50 |

### 6. L'idiome "longueur réelle" (à connaître par cœur)
```cobol
           MOVE ZERO TO WS-NB-ESP
           INSPECT FUNCTION REVERSE(WS-NOM)
               TALLYING WS-NB-ESP FOR LEADING SPACES
           COMPUTE WS-LG-REELLE = FUNCTION LENGTH(WS-NOM) - WS-NB-ESP
```
(On retourne la chaîne, on compte les espaces devenus "de tête", on soustrait.
Élégant, non ? C'est un ancien de la CGBA qui l'a trouvé en 1991.)

---

## EXERCICE 00 — LA COUTURIÈRE (10 XP)
**Rendu :** `rendu/J06/ex00/fusion.cob` · **PROGRAM-ID :** `FUSION`
```
$> ./fusion
PRENOM ?
JEAN
NOM ?
DUPONT
=>JEAN DUPONT<=
```
Les balises `=>` `<=` prouvent qu'il n'y a AUCUN espace parasite. STRING obligatoire
(la concaténation par DISPLAY multiple est refusée). Noms en un seul mot.

## EXERCICE 01 — LE DÉCOUPEUR (15 XP)
**Rendu :** `rendu/J06/ex01/decoupe.cob` · **PROGRAM-ID :** `DECOUPE`

La ligne saisie est au format `NOM;PRENOM;VILLE` :
```
$> ./decoupe
LIGNE ?
DUPONT;JEAN;COTONOU
NOM    : DUPONT
PRENOM : JEAN
VILLE  : COTONOU
CHAMPS : 3
```
BERTHA teste aussi `KOSSOU;;PARAKOU` (prénom vide → ligne `PRENOM :` suivie
d'espaces, champs : 3) et `SEUL` (champs : 1, les zones absentes restent vides).
UNSTRING + TALLYING.

## EXERCICE 02 — LE COMPTEUR DE VOYELLES (15 XP)
**Rendu :** `rendu/J06/ex02/voyelles.cob` · **PROGRAM-ID :** `VOYELLES`
```
$> ./voyelles
PHRASE ?
BERTHA NE DORT JAMAIS
VOYELLES : 07
```
Un seul INSPECT (A E I O U). La saisie peut être en minuscules : convertissez
d'abord (`UPPER-CASE`). Édition `9(2)`.

## EXERCICE 03 — LE MASQUE (20 XP)
**Rendu :** `rendu/J06/ex03/masque.cob` · **PROGRAM-ID :** `MASQUE`

Le RGPD est passé par la CGBA : sur un IBAN de 27 caractères, seuls les 4 premiers
et les 4 derniers restent visibles :
```
$> ./masque
IBAN ?
FR7612345678901234567890123
FR76*******************0123
```
Contrainte : modification de référence + `MOVE ALL "*"`. Aucune boucle.

## EXERCICE 04 — LA VRAIE LONGUEUR (15 XP)
**Rendu :** `rendu/J06/ex04/longueur.cob` · **PROGRAM-ID :** `LONGUEUR`

Zone de saisie `X(20)` :
```
$> ./longueur
MOT ?
MARCEL
LONGUEUR DECLAREE : 20
LONGUEUR REELLE   : 06
```
Contrainte : `FUNCTION TRIM` interdite ici — l'idiome REVERSE du mémo est exigé
(vous le recroiserez dans tout le code legacy de la planète).

## EXERCICE 05 — LE PALINDROME (20 XP)
**Rendu :** `rendu/J06/ex05/palindrome.cob` · **PROGRAM-ID :** `PALIND`
```
$> ./palindrome
MOT ?
KAYAK
KAYAK EST UN PALINDROME
```
(`RADAR` → palindrome ; `ABIDJAN` → `ABIDJAN N EST PAS UN PALINDROME`.)
Contraintes : longueur réelle d'abord (ex04), puis comparaison caractère par
caractère `WS-MOT(WS-I:1)` contre `WS-MOT(WS-LG - WS-I + 1:1)` dans une boucle qui
s'arrête à la moitié. `FUNCTION REVERSE` interdite... dans la boucle. En commentaire
final, montrez la version REVERSE en 2 lignes (`* VERSION LUXE : ...`) — pour
mesurer le confort moderne.

## EXERCICE 06 — LE CODE DE CÉSAR (20 XP)
**Rendu :** `rendu/J06/ex06/cesar.cob` · **PROGRAM-ID :** `CESAR`

Le message part au coffre, décalé de 3 lettres (A→D, ... Z→C) :
```
$> ./cesar
MESSAGE ?
RENDEZ VOUS AU COFFRE
CODE   : UHQGHC YRXV DX FRIIUH
DECODE : RENDEZ VOUS AU COFFRE
```
Contraintes : deux `INSPECT CONVERTING` (aller, retour) ; les deux alphabets sont
des constantes `CST-ALPHA-CLAIR` et `CST-ALPHA-CODE`. Les espaces ne bougent pas.

## EXERCICE 07 — LA FICHE PROPRE (15 XP)
**Rendu :** `rendu/J06/ex07/propre.cob` · **PROGRAM-ID :** `PROPRE`

Les stagiaires saisissent n'importe comment. Réparez :
```
$> ./propre
PRENOM ?
jean
NOM ?
dupont
FICHE : DUPONT, JEAN
```
(`UPPER-CASE` + `TRIM` + un seul STRING pour la ligne finale — la virgule et
l'espace sont cousus dedans.)

## BONUS — LE CONTRÔLE DE VRAISEMBLANCE IBAN (+25 XP)
**Rendu :** `rendu/J06/bonus/controle.cob` · **PROGRAM-ID :** `CONTROLE`

Avant d'envoyer un virement, on vérifie (dans cet ordre, on s'arrête à la première
erreur) : longueur réelle = 27, pays = `FR`, clé (positions 3-4) numérique,
reste (positions 5-27) numérique :
```
$> ./controle
IBAN ?
FR7612345678901234567890123
IBAN VRAISEMBLABLE
```
`FR76123` → `IBAN INVALIDE : LONGUEUR` · `DE76...` → `IBAN INVALIDE : PAYS` ·
`FRA6...` → `IBAN INVALIDE : CLE` · `FR76ABC45678901234567890123` →
`IBAN INVALIDE : CARACTERES`.

---

## BARÈME DU JOUR
| Ex | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | Bonus |
|---|---|---|---|---|---|---|---|---|---|
| XP | 10 | 15 | 15 | 20 | 15 | 20 | 20 | 15 | 25 |

Validation : ≥ 90 XP. Badges : **LE CHIFFREUR** (ex06), **CISEAUX D'OR** (tous les
non-bonus).

> *Marcel :* *« Lundi, on entre dans la salle des machines : les FICHIERS. Ce que tu
> as appris jusqu'ici, c'était pour pouvoir entrer dans cette salle. Repose-toi. »*
