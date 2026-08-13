# PISCINE — J05 : LES REGISTRES
### Structures, REDEFINES, OCCURS, SEARCH · XP du jour : 135 (+30 bonus)

> *Mémo de Marcel :*
> *« Avant les bases de données, il y avait les registres : des lignes, des colonnes,
> et un stagiaire pour chercher dedans. Aujourd'hui, le stagiaire, c'est toi.
> OCCURS, c'est le registre. SEARCH, c'est toi qui tournes les pages. SEARCH ALL,
> c'est toi qui as compris que le registre était trié. »*

---

## LE MÉMO DU JOUR

### 1. Les variables groupes — décrire un enregistrement
```cobol
       01 WS-CLIENT.
          05 WS-CLI-ID        PIC 9(5).
          05 WS-CLI-NOM       PIC X(20).
          05 WS-CLI-VILLE     PIC X(15).
          05 WS-CLI-SOLDE     PIC S9(7)V99.
```
- Les numéros de niveau (01, 05, 10...) créent la hiérarchie. Convention CGBA :
  01 → 05 → 10 → 15.
- `MOVE WS-CLIENT-A TO WS-CLIENT-B` copie tout le bloc d'un coup.
- `MOVE SPACES TO WS-CLIENT` réinitialise tout (attention aux zones numériques !
  `INITIALIZE WS-CLIENT` est plus malin : SPACES dans les X, ZERO dans les 9).

### 2. REDEFINES — deux lunettes sur la même mémoire
```cobol
       01 WS-DATE-8            PIC 9(8).
       01 WS-DATE-DECOUPE REDEFINES WS-DATE-8.
          05 WS-AAAA           PIC 9(4).
          05 WS-MM             PIC 9(2).
          05 WS-JJ             PIC 9(2).
```
Même octets, deux descriptions. Écrire dans l'une, lire dans l'autre. La Norme exige
un commentaire expliquant le pourquoi.

### 3. OCCURS — les tables
```cobol
       01 WS-TABLEAU-CA.
          05 WS-CA-MOIS        PIC S9(7)V99 OCCURS 12 TIMES.

       01 WS-REGISTRE-AGENCES.
          05 WS-AGENCE OCCURS 8 TIMES
                       ASCENDING KEY IS WS-AGE-CODE
                       INDEXED BY IDX-AGE.
             10 WS-AGE-CODE    PIC 9(3).
             10 WS-AGE-NOM     PIC X(12).
```
- Accès par **indice** : `WS-CA-MOIS(WS-I)` avec `WS-I PIC 9(2)`.
- Accès par **index** (plus rapide, obligatoire pour SEARCH) : `INDEXED BY`, et on
  le manipule avec `SET IDX-AGE TO 1`, `SET IDX-AGE UP BY 1` (jamais MOVE).
- Hors bornes = comportement indéfini. Compilez avec `cobc -x -debug` pour que
  GnuCOBOL contrôle les bornes pendant la mise au point.

### 4. Initialiser une table avec REDEFINES — l'idiome historique
```cobol
       01 WS-DATA-MOIS.
          05 FILLER PIC X(36) VALUE "JANFEVMARAVRMAIJUNJULAOUSEPOCTNOVDEC".
       01 WS-TAB-MOIS REDEFINES WS-DATA-MOIS.
          05 WS-MOIS           PIC X(3) OCCURS 12 TIMES.
```

### 5. SEARCH et SEARCH ALL
```cobol
           SET IDX-AGE TO 1
           SEARCH WS-AGENCE                       *> lineaire, part de l index
               AT END DISPLAY "AGENCE INCONNUE"
               WHEN WS-AGE-CODE(IDX-AGE) = WS-CHERCHE
                   DISPLAY WS-AGE-NOM(IDX-AGE)
           END-SEARCH

           SEARCH ALL WS-AGENCE                   *> dichotomie, table TRIEE
               AT END DISPLAY "AGENCE INCONNUE"
               WHEN WS-AGE-CODE(IDX-AGE) = WS-CHERCHE
                   DISPLAY WS-AGE-NOM(IDX-AGE)
           END-SEARCH
```
`SEARCH ALL` exige `ASCENDING KEY` + table réellement triée : sinon résultats
aléatoires (le pire type de bug).

### 6. Tables à deux dimensions
```cobol
       01 WS-GRILLE.
          05 WS-LIGNE OCCURS 4 TIMES.
             10 WS-CASE PIC S9(7)V99 OCCURS 4 TIMES.
```
Accès : `WS-CASE(WS-L, WS-C)`.

---

## LES DONNÉES DU JOUR
Plusieurs exercices utilisent le registre des 8 agences CGBA (codes triés) :
| Code | Nom | | Code | Nom |
|---|---|---|---|---|
| 010 | COTONOU | | 210 | ABIDJAN |
| 025 | PORTO-NOVO | | 300 | DAKAR |
| 050 | PARAKOU | | 410 | LOME |
| 100 | PARIS | | 500 | BRUXELLES |

Vous les chargerez par l'idiome REDEFINES (mémo §4) : codes `9(3)` + noms `X(12)`
(complétés d'espaces), soit un FILLER de 8 × 15 = 120 caractères.

## EXERCICE 00 — LA FICHE CLIENT (10 XP)
**Rendu :** `rendu/J05/ex00/fiche.cob` · **PROGRAM-ID :** `FICHE`

Déclarez la structure `WS-CLIENT` du mémo, remplissez-la par `MOVE` champ à champ
(ID 42, DUPONT, COTONOU, solde 1234.56) puis :
```
$> ./fiche
[00042] DUPONT               COTONOU         SOLDE:    1234.56
```
(une seule instruction DISPLAY, alignements naturels des PIC, solde édité
`ZZZZZZ9.99`).

## EXERCICE 01 — LES DEUX LUNETTES (15 XP)
**Rendu :** `rendu/J05/ex01/lunettes.cob` · **PROGRAM-ID :** `LUNETTES`

`ACCEPT` d'une date `AAAAMMJJ` dans un `9(8)`, REDEFINES, et :
```
$> ./lunettes
DATE (AAAAMMJJ) ?
20260812
JOUR  : 12
MOIS  : AOUT
ANNEE : 2026
```
Le nom du mois vient d'une table initialisée par REDEFINES :
"JANVIER  FEVRIER  MARS     AVRIL    MAI      JUIN     JUILLET  AOUT     SEPTEMBREOCTOBRE  NOVEMBRE DECEMBRE " (X(9) × 12 — affichez avec TRIM). Mois hors 01-12 →
`MOIS INVALIDE` et rien d'autre.

## EXERCICE 02 — LE CHIFFRE D'AFFAIRES (20 XP)
**Rendu :** `rendu/J05/ex02/camensuel.cob` · **PROGRAM-ID :** `CAMENS`

Saisissez 12 montants (boucle de 12 ACCEPT précédés de `MOIS 01 ?` ... `MOIS 12 ?`),
stockez en table, puis :
```
$> ./camensuel
MOIS 01 ?
1000.00
...
MOIS 12 ?
1200.00
TOTAL ANNUEL :     13950.00
MOYENNE      :      1162.50
```
(Jeu de test BERTHA : 1000, 1100, 900, 1250, 1000, 1000, 1300, 1400, 1000, 1500,
1300, 1200.) Contrainte : la saisie ET les calculs sont deux boucles distinctes,
deux paragraphes distincts.

## EXERCICE 03 — LE MEILLEUR MOIS (15 XP)
**Rendu :** `rendu/J05/ex03/record.cob` · **PROGRAM-ID :** `RECORD`

Mêmes 12 saisies. Affichez le meilleur et le pire mois (numéro + montant) :
```
MEILLEUR MOIS : 10 AVEC      1500.00
PIRE MOIS     : 03 AVEC       900.00
```
(En cas d'égalité : le premier rencontré gagne. Édition du numéro : `9(2)`.)

## EXERCICE 04 — L'ANNUAIRE DES AGENCES (20 XP)
**Rendu :** `rendu/J05/ex04/annuaire.cob` · **PROGRAM-ID :** `ANNUAIRE`

Table des 8 agences (données du jour), recherche LINÉAIRE avec `SEARCH` :
```
$> ./annuaire
CODE AGENCE ?
300
AGENCE 300 : DAKAR
```
```
$> ./annuaire
CODE AGENCE ?
999
AGENCE 999 : INCONNUE
```

## EXERCICE 05 — L'ANNUAIRE EXPRESS (15 XP)
**Rendu :** `rendu/J05/ex05/express.cob` · **PROGRAM-ID :** `EXPRESS`

Même programme, mais `SEARCH ALL` (la table est triée : profitez-en). Mêmes sorties.
En commentaire de fin : `* POURQUOI DICHOTOMIE : ...` — expliquez en 2 lignes combien
de comparaisons au pire pour 8 éléments, puis pour 4 194 304 éléments (la vraie table
clients de la CGBA). C'est ce chiffre qui doit vous convertir.

## EXERCICE 06 — LE TRI DU STAGIAIRE (25 XP)
**Rendu :** `rendu/J05/ex06/bulles.cob` · **PROGRAM-ID :** `BULLES`

Marcel : *« Avant d'avoir le droit d'utiliser SORT (J09), tu tries à la main une
fois dans ta vie. Tradition maison. »* Saisissez 8 montants, triez-les par tri à
bulles (deux boucles imbriquées + échange via zone tampon), affichez :
```
$> ./bulles
MONTANT 1 ?
50.00
...
MONTANT 8 ?
10.00
TABLE TRIEE :
      10.00
      12.50
...
     200.00
```
(Jeu BERTHA : 50, 12.50, 200, 45, 10, 99.99, 45, 150.)
Contrainte : le tri dans un paragraphe `2200-TRI`, l'échange dans `2210-ECHANGE`.

## EXERCICE 07 — LA GRILLE TRIMESTRIELLE (15 XP)
**Rendu :** `rendu/J05/ex07/grille2d.cob` · **PROGRAM-ID :** `GRILLE2D`

Table 2D : 4 agences (010, 025, 050, 100) × 4 trimestres, montants saisis ligne par
ligne (invites `AGENCE 010 TRIMESTRE 1 ?` etc.), puis totaux :
```
TOTAL AGENCE 010 :     4000.00
TOTAL AGENCE 025 :     3500.00
TOTAL AGENCE 050 :     5000.00
TOTAL AGENCE 100 :     6100.00
TOTAL TRIMESTRE 1 :     4200.00
TOTAL TRIMESTRE 2 :     4600.00
TOTAL TRIMESTRE 3 :     4700.00
TOTAL TRIMESTRE 4 :     5100.00
TOTAL GENERAL     :    18600.00
```
(Jeu BERTHA : lignes agence par agence : 1000,900,1100,1000 / 800,900,900,900 /
1200,1300,1200,1300 / 1200,1500,1500,1900.) Contrôle de cohérence : somme des
lignes = somme des colonnes = total général, sinon `CONTROLE : KO` en dernière ligne.

## BONUS — L'HISTOGRAMME DU HALL (+30 XP)
**Rendu :** `rendu/J05/bonus/histo.cob` · **PROGRAM-ID :** `HISTO`

Reprenez les 12 CA de l'ex02 et dessinez (1 étoile = 100.00, arrondi inférieur,
noms de mois X(3) de l'idiome REDEFINES) :
```
JAN |**********
FEV |***********
MAR |*********
...
DEC |************
```
Contrainte : étoiles affichées par boucle NO ADVANCING (pas de chaîne pré-remplie).

---

## BARÈME DU JOUR
| Ex | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | Bonus |
|---|---|---|---|---|---|---|---|---|---|
| XP | 10 | 15 | 20 | 15 | 20 | 15 | 25 | 15 | 30 |

Validation : ≥ 95 XP. Badge : **MAÎTRE DES REGISTRES** (ex04+05+06 validés).

> *Marcel :* *« Ce week-end, premier rush : BERTHA-MIND. Tu as tous les outils.
> Dors deux fois, code une fois. »*
