# PISCINE — J04 : LES BOUCLES DU BATCH
### Paragraphes, PERFORM sous toutes ses formes · XP du jour : 130 (+30 bonus)

> *Mémo de Marcel :*
> *« Chaque nuit à 23h00, BERTHA lance la chaîne batch : 4,2 millions de comptes,
> un par un, la même moulinette. Le batch, c'est l'art de la répétition parfaite.
> Ton outil : PERFORM. Ton ennemi juré : GO TO. Aujourd'hui je t'apprends l'un et
> je t'interdis l'autre, et un jour tu me remercieras. »*

---

## LE MÉMO DU JOUR

### 1. Les paragraphes — l'unité de découpage
Un paragraphe = un nom en Zone A + des instructions. On l'appelle avec `PERFORM` :
```cobol
       PROCEDURE DIVISION.
       0000-PRINCIPAL.
           PERFORM 1000-INITIALISATION
           PERFORM 2000-TRAITEMENT
           PERFORM 9000-FIN
           STOP RUN.
      *
       1000-INITIALISATION.
           MOVE ZERO TO WS-CPT.
```
Attention au piège n°1 du débutant : sans `STOP RUN`, l'exécution **continue en
séquence** dans le paragraphe suivant. C'est la source de bugs fantômes classique.

### 2. PERFORM répétitif — les quatre formes
```cobol
           PERFORM 2100-LIGNE 5 TIMES

           PERFORM UNTIL WS-CPT > 10          *> test AVANT (defaut)
               ...
           END-PERFORM

           PERFORM WITH TEST AFTER UNTIL WS-REP = "N"    *> au moins 1 tour
               ...
           END-PERFORM

           PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 10
               DISPLAY WS-I
           END-PERFORM
```
- Forme **en ligne** (`PERFORM ... END-PERFORM`) ou **hors ligne**
  (`PERFORM 2100-X UNTIL ...`) : la Norme accepte les deux ; hors ligne dès que le
  corps dépasse ~6 lignes.
- Boucles imbriquées : `PERFORM VARYING WS-I ... AFTER WS-J FROM 1 BY 1 UNTIL ...`
  (ou deux PERFORM imbriqués — plus lisible pour débuter).

### 3. DISPLAY ... WITH NO ADVANCING
Pour construire une ligne morceau par morceau :
```cobol
           DISPLAY "*" WITH NO ADVANCING
           ...
           DISPLAY " "            *> le retour a la ligne final
```

### 4. GO TO — l'autopsie
`GO TO 3000-SUITE.` saute sans retour. Multiplié par 200 dans un programme de 1978,
ça donne du "code spaghetti" : impossible à suivre, impossible à tester, impossible à
modifier. La Norme CGBA l'interdit (Article 7). Vous le rencontrerez en M05, dans du
code des autres. Aujourd'hui, constatez juste que `PERFORM` revient toujours à la
maison, et que c'est toute la différence entre une visite et une fugue.

---

## EXERCICE 00 — LE COMPTE À REBOURS (10 XP)
**Rendu :** `rendu/J04/ex00/rebours.cob` · **PROGRAM-ID :** `REBOURS`
```
$> ./rebours
10
9
...
1
LANCEMENT DU BATCH
```
(Les lignes 10 → 1 complètes, sans zéros de tête : édition `Z9`... qui laisse un
espace devant les unités. Sortie réelle attendue : `10` puis ` 9`, ` 8`... ` 1`.
PERFORM VARYING descendant : `FROM 10 BY -1`.)

## EXERCICE 01 — LA TABLE DU LIVRET (15 XP)
**Rendu :** `rendu/J04/ex01/table.cob` · **PROGRAM-ID :** `TABLE`

La table de multiplication, outil de base du banquier de 1962 :
```
$> ./table
NOMBRE ?
7
 7 X  1 =    7
 7 X  2 =   14
 7 X 12 =   84
```
(les 12 lignes ; éditions `Z9`, `Z9`, `ZZZ9`).

## EXERCICE 02 — LA SOMME DES DÉPÔTS (15 XP)
**Rendu :** `rendu/J04/ex02/somme.cob` · **PROGRAM-ID :** `SOMME`

N est saisi ; affichez la somme 1+2+...+N et la formule de contrôle N*(N+1)/2 :
```
$> ./somme
N ?
100
SOMME BOUCLE  :       5050
SOMME FORMULE :       5050
CONTROLE : OK
```
(Si les deux diffèrent — ça ne devrait jamais arriver — afficher `CONTROLE : KO`.
Le double calcul indépendant est une technique de fiabilité bancaire réelle.)

## EXERCICE 03 — LA FACTORIELLE QUI DÉBORDE (20 XP)
**Rendu :** `rendu/J04/ex03/facto.cob` · **PROGRAM-ID :** `FACTO`

Factorielle de N dans une zone `9(18)` :
```
$> ./facto
N ?
5
FACTORIELLE DE  5 = 120
```
Mais BERTHA teste aussi 25 :
```
$> ./facto
N ?
25
DEPASSEMENT DE CAPACITE A N = 21
```
Contrainte : `ON SIZE ERROR` dans la boucle, qui arrête proprement en indiquant
l'étape fautive. (Édition du résultat : `Z(17)9`.)

## EXERCICE 04 — MARCEL-DUBOIS (15 XP)
**Rendu :** `rendu/J04/ex04/marceldubois.cob` · **PROGRAM-ID :** `MDUBOIS`

Le FizzBuzz maison. De 1 à N : multiples de 3 → `MARCEL`, de 5 → `DUBOIS`, des
deux → `MARCEL DUBOIS`, sinon le nombre :
```
$> ./marceldubois
N ?
15
1
2
MARCEL
4
DUBOIS
MARCEL
7
8
MARCEL
DUBOIS
11
MARCEL
13
14
MARCEL DUBOIS
```
(Nombres sans zéros de tête ni espaces : pour une fois, utilisez une édition `Z(4)9`
puis... non. Piège : `DISPLAY` d'une zone éditée garde les espaces. Astuce du jour
AUTORISÉE en avance sur J06 : `FUNCTION TRIM(WS-EDIT)` supprime les espaces.
`DISPLAY FUNCTION TRIM(WS-EDIT)`. C'est cadeau, ça n'arrivera plus.)

## EXERCICE 05 — LA PYRAMIDE DU PATRIMOINE (20 XP)
**Rendu :** `rendu/J04/ex05/pyramide.cob` · **PROGRAM-ID :** `PYRAMID`

L'affiche du hall de la CGBA. N étages :
```
$> ./pyramide
ETAGES ?
4
   *
  ***
 *****
*******
```
Contrainte : uniquement des boucles et `DISPLAY ... WITH NO ADVANCING` (aucune
chaîne pré-construite, aucun littéral de plus d'un caractère).

## EXERCICE 06 — LE PGCD DES AGENCES (20 XP)
**Rendu :** `rendu/J04/ex06/pgcd.cob` · **PROGRAM-ID :** `PGCD`

Pour répartir équitablement les liasses entre deux agences, Euclide :
```
$> ./pgcd
NOMBRE A ?
252
NOMBRE B ?
105
PGCD = 21
```
Contrainte : l'algorithme d'Euclide par restes successifs (boucle UNTIL, REMAINDER),
pas de force brute.

## EXERCICE 07 — LE NOMBRE PREMIER (15 XP)
**Rendu :** `rendu/J04/ex07/premier.cob` · **PROGRAM-ID :** `PREMIER`
```
$> ./premier
N ?
97
97 EST PREMIER
```
(BERTHA teste 1, 2, 97, 100 : `1 N EST PAS PREMIER`, `2 EST PREMIER`,
`100 N EST PAS PREMIER` — nombres affichés via TRIM comme en ex04.)
Contrainte : arrêt de la boucle dès qu'un diviseur est trouvé (drapeau 88
`88 DIVISEUR-TROUVE`), et ne testez pas au-delà du nécessaire (pensez-y : jusqu'où
suffit-il de chercher ?).

## BONUS — LA CONJECTURE DE SYRACUSE (+30 XP)
**Rendu :** `rendu/J04/bonus/syracuse.cob` · **PROGRAM-ID :** `SYRACUSE`

Marcel y joue depuis 1979 pendant les sauvegardes. N saisi ; pair → N/2, impair →
3N+1, jusqu'à 1. Affichez la suite (un nombre par ligne, TRIM), puis :
```
ALTITUDE MAXI : 52
DUREE DU VOL  : 11
```
(pour N=7 : 7 22 11 34 17 52 26 13 40 20 10 5 16 8 4 2 1 ; altitude = maximum
atteint, durée = nombre d'étapes avant 1... vérifiez : pour 7, la suite affichée
compte 17 lignes et la durée est 16. À vous de définir proprement "étape" en
commentaire et de vous y tenir : BERTHA attend 16.)

---

## BARÈME DU JOUR
| Ex | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | Bonus |
|---|---|---|---|---|---|---|---|---|---|
| XP | 10 | 15 | 15 | 20 | 15 | 20 | 20 | 15 | 30 |

Validation : ≥ 90 XP. Badge : **TUEUR DE GO TO** (journée entière sans un seul
GO TO... c'est-à-dire tout le monde — mais le badge fait plaisir).

> *Marcel :* *« Tu répètes proprement. Demain, les tables : OCCURS. Le jour où tu
> comprendras qu'un fichier de 4 millions de comptes se traite avec les mêmes
> outils qu'une table de 12 mois, tu seras des nôtres. »*
