# PISCINE — J03 : LES DÉCISIONS
### IF, EVALUATE, niveaux 88 · XP du jour : 120 (+30 bonus)

> *Mémo de Marcel :*
> *« Une banque, c'est une machine à dire non. Compte bloqué ? Non. Plafond dépassé ?
> Non. Aujourd'hui tu apprends à dire non proprement. Et tu vas rencontrer les
> niveaux 88 — la plus belle idée du COBOL : des conditions qui portent un nom.
> Quand tu liras `IF CPT-BLOQUE`, tu comprendras qu'un code peut se lire à voix
> haute. »*

---

## LE MÉMO DU JOUR

### 1. IF / ELSE — toujours fermé
```cobol
           IF WS-SOLDE < 0
               DISPLAY "DECOUVERT"
           ELSE
               IF WS-SOLDE = 0
                   DISPLAY "A SEC"
               ELSE
                   DISPLAY "CREDITEUR"
               END-IF
           END-IF
```
Opérateurs : `= < > <= >= NOT =` (ou en toutes lettres : `IS GREATER THAN`...).
Combinaisons : `AND`, `OR`, `NOT`, parenthèses. Forme abrégée légale :
`IF WS-X = 1 OR 2` équivaut à `WS-X = 1 OR WS-X = 2` (pratique, piégeux : sachez-le).

### 2. Conditions de classe et de signe — le pare-chocs anti-S0C7
```cobol
           IF WS-SAISIE IS NUMERIC ...        *> que des chiffres ?
           IF WS-NOM IS ALPHABETIC ...
           IF WS-MONTANT IS POSITIVE / NEGATIVE / ZERO ...
```
Sur mainframe, un calcul sur une zone non numérique = abend **S0C7**, l'erreur la
plus célèbre du métier. `IS NUMERIC` avant tout calcul sur une saisie : réflexe à vie.

### 3. Les niveaux 88 — des conditions avec un nom
```cobol
       01 WS-STATUT-CPT       PIC X.
          88 CPT-ACTIF        VALUE "A".
          88 CPT-BLOQUE       VALUE "B".
          88 CPT-CLOTURE      VALUE "C".
          88 CPT-VALIDE       VALUE "A" "B".          *> plusieurs valeurs
       01 WS-CODE-AGENCE      PIC 9(3).
          88 AGENCE-DOM       VALUE 1 THRU 199.       *> intervalle
```
```cobol
           IF CPT-BLOQUE
               DISPLAY "OPERATION REFUSEE"
           END-IF
           SET CPT-CLOTURE TO TRUE       *> ecrit "C" dans WS-STATUT-CPT
```

### 4. EVALUATE — l'aiguillage
```cobol
           EVALUATE WS-CODE-OPE
               WHEN "D"      PERFORM 2100-DEPOT
               WHEN "R"      PERFORM 2200-RETRAIT
               WHEN "S"      CONTINUE
               WHEN OTHER    DISPLAY "CODE INCONNU"
           END-EVALUATE

           EVALUATE TRUE                       *> cascade de conditions
               WHEN WS-AGE < 18   DISPLAY "MINEUR"
               WHEN WS-AGE < 65   DISPLAY "ACTIF"
               WHEN OTHER         DISPLAY "RETRAITE COMME MARCEL"
           END-EVALUATE
```
`EVALUATE ... ALSO ...` croise deux critères (voir bonus). `CONTINUE` = ne rien
faire, explicitement.

### 5. DIVIDE ... REMAINDER (rappel utile aujourd'hui)
```cobol
           DIVIDE WS-MONTANT BY 50 GIVING WS-NB50 REMAINDER WS-RESTE
```

---

## EXERCICE 00 — PAIR OU IMPAIR (10 XP)
**Rendu :** `rendu/J03/ex00/parite.cob` · **PROGRAM-ID :** `PARITE`

Un nombre saisi (`9(5)`), verdict aligné sur 5 colonnes (édition `ZZZZ9`) :
```
$> ./parite
UN NOMBRE ?
7
    7 EST IMPAIR
```
BERTHA teste 7, 8 et 42 (`    8 EST PAIR`, `   42 EST PAIR`).
Outils imposés : `DIVIDE ... REMAINDER` + un `IF`.

## EXERCICE 01 — LE PODIUM (15 XP)
**Rendu :** `rendu/J03/ex01/podium.cob` · **PROGRAM-ID :** `PODIUM`

Trois montants saisis, affichez le plus grand et le plus petit :
```
$> ./podium
MONTANT 1 ?
120.50
MONTANT 2 ?
89.00
MONTANT 3 ?
120.49
MAXI :     120.50
MINI :      89.00
```
Contrainte : pas plus de trois IF. Édition `ZZZZZZ9.99`.

## EXERCICE 02 — LE BARÈME DES FRAIS (20 XP)
**Rendu :** `rendu/J03/ex02/frais.cob` · **PROGRAM-ID :** `FRAIS`

Frais de tenue de compte CGBA selon le solde moyen :
- solde < 0 : 15.00 (et lettre de rappel)
- 0 ≤ solde < 1000 : 5.00
- 1000 ≤ solde < 10000 : 2.50
- ≥ 10000 : 0.00 (client premium)
```
$> ./frais
SOLDE MOYEN ?
-50.00
FRAIS :      15.00
COURRIER : LETTRE DE RAPPEL
```
```
$> ./frais
SOLDE MOYEN ?
25000.00
FRAIS :       0.00
COURRIER : AUCUN
```
Contrainte : `EVALUATE TRUE`, bornes en constantes `CST-`, montant saisi en zone
SIGNÉE (`S9(7)V99` — testez la saisie de `-50.00`).

## EXERCICE 03 — LE VIDE-POCHE ANTI-S0C7 (20 XP)
**Rendu :** `rendu/J03/ex03/garde.cob` · **PROGRAM-ID :** `GARDE`

Un montant est saisi dans une zone `X(10)`. Validez avant de calculer :
```
$> ./garde
MONTANT ?
123.45
```
→ refusé ! (le point n'est pas un chiffre dans une zone d'entiers). BERTHA teste :
```
$> ./garde
MONTANT ?
0001234500
MONTANT VALIDE : 12345.00
DOUBLE        : 24690.00
```
```
$> ./garde
MONTANT ?
12A45
ERREUR : SAISIE NON NUMERIQUE
CALCUL ANNULE - S0C7 EVITE
```
Règle du jeu : la saisie valide fait 10 chiffres, décimale implicite V99 (comme les
fichiers bancaires !). `IS NUMERIC` sur le X(10), puis MOVE vers `9(8)V99` via une
zone `REDEFINES`... pas encore vu ? Alors : MOVE du X vers un `9(8)V99` redéclaré ?
Piste simple autorisée aujourd'hui : `MOVE WS-SAISIE TO WS-NUM` où `WS-NUM PIC
9(10)`, puis `COMPUTE WS-MONTANT = WS-NUM / 100`. Badge **S0C7** pour tous ceux qui
ont d'abord planté le programme en calculant sans contrôle (soyez honnête, faites-le
exprès une fois : `rendu/J03/ex03/crash.txt` avec le message d'erreur obtenu).

## EXERCICE 04 — LES ÉTATS DU COMPTE (15 XP)
**Rendu :** `rendu/J03/ex04/statut.cob` · **PROGRAM-ID :** `STATUT`

Modélisez le statut avec des niveaux 88 (`A`ctif, `B`loqué, `C`lôturé) et le type
(`C`ourant, `E`pargne). Lisez deux caractères, répondez :
```
$> ./statut
STATUT (A/B/C) ?
B
TYPE (C/E) ?
E
COMPTE EPARGNE BLOQUE
CONSULTATION : AUTORISEE
RETRAIT      : REFUSE
```
Règles : retrait autorisé seulement si actif ; consultation refusée seulement si
clôturé ; toute lettre inconnue → `CODE INVALIDE` et rien d'autre. Contrainte : la
PROCEDURE ne compare JAMAIS un littéral (`IF WS-X = "B"` interdit) — uniquement des
noms 88 et `SET`.

## EXERCICE 05 — LE DISTRIBUTEUR (25 XP)
**Rendu :** `rendu/J03/ex05/dab.cob` · **PROGRAM-ID :** `DAB`

Le DAB de l'agence rend le minimum de billets (50, 20, 10) :
```
$> ./dab
MONTANT DU RETRAIT ?
180
BILLETS DE 50 : 3
BILLETS DE 20 : 1
BILLETS DE 10 : 1
```
Cas limites testés par BERTHA :
```
$> ./dab
MONTANT DU RETRAIT ?
35
MONTANT NON DISTRIBUABLE
```
(180, 200, 10, 35, 0 → 0 est refusé aussi : `MONTANT NON DISTRIBUABLE`.)
Contrainte : DIVIDE...REMAINDER en cascade, aucun IF sur les billets eux-mêmes.

## EXERCICE 06 — L'ANNÉE BISSEXTILE (15 XP)
**Rendu :** `rendu/J03/ex06/bissext.cob` · **PROGRAM-ID :** `BISSEXT`

Divisible par 4 sauf par 100, sauf sauf par 400 :
```
$> ./bissext
ANNEE ?
1900
1900 : ANNEE NORMALE
```
(BERTHA teste 1900, 2000, 2024, 2026.) Contrainte : UNE seule expression
conditionnelle (un seul IF, avec AND/OR/parenthèses). La lisibilité compte : posez
des 88 sur des restes pré-calculés si ça aide.

## BONUS — LA GRILLE TARIFAIRE (+30 XP)
**Rendu :** `rendu/J03/bonus/grille.cob` · **PROGRAM-ID :** `GRILLE`

`EVALUATE ... ALSO` : tarif d'un virement selon type client (P/E = particulier /
entreprise) ET destination (N/I = national / international) :
P+N: 0.00 · P+I: 12.50 · E+N: 3.00 · E+I: 25.00, toute autre combinaison :
`COMBINAISON INCONNUE`.
```
$> ./grille
CLIENT (P/E) ?
E
DESTINATION (N/I) ?
I
TARIF :      25.00
```
Contrainte : un seul EVALUATE, aucun IF.

---

## BARÈME DU JOUR
| Ex | 00 | 01 | 02 | 03 | 04 | 05 | 06 | Bonus |
|---|---|---|---|---|---|---|---|---|
| XP | 10 | 15 | 20 | 20 | 15 | 25 | 15 | 30 |

Validation : ≥ 85 XP. Badges : **S0C7** (crash documenté ex03), **LA VOIE DU 88**
(ex04 sans aucun littéral en PROCEDURE).

> *Marcel :* *« Tu sais décider. Demain tu sauras répéter. Le batch, petit, c'est
> ça : la même chose bien faite, quatre millions de fois par nuit. »*
