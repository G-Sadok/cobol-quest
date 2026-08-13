# PISCINE — J09 : SORT, RUPTURES & SOUS-PROGRAMMES
### La journée des grands · XP du jour : 130 (+20 bonus)

> *Mémo de Marcel :*
> *« Trois choses aujourd'hui, et ce sont les trois piliers du métier. UN : SORT —
> on ne traite jamais du désordre, on trie d'abord. DEUX : la rupture de contrôle —
> l'art du sous-total, le squelette de tout état comptable depuis 1962. TROIS : le
> sous-programme — parce qu'un calcul de frais codé douze fois, c'est douze bugs.
> Ce soir, tu seras un programmeur COBOL. Pas un touriste. »*

---

## LE MÉMO DU JOUR

### 1. SORT — le tri industriel
```cobol
           SELECT F-TRI ASSIGN TO "SORTWK".          *> fichier de travail
      *
       SD  F-TRI.                                    *> SD, pas FD !
       01  ENR-TRI.
           05 TRI-ID      PIC 9(5).
           05 TRI-NOM     PIC X(20).
           05 TRI-VILLE   PIC X(15).
           05 TRI-SOLDE   PIC 9(7)V99.
      *
           SORT F-TRI
               ON ASCENDING KEY TRI-NOM
               USING  F-CLIENTS
               GIVING F-TRIES
```
- Multi-clés : `ON ASCENDING KEY TRI-VILLE DESCENDING KEY TRI-SOLDE`.
- `USING/GIVING` : tout le fichier entre, tout le fichier sort.
- Pour filtrer ou transformer AU VOL : `INPUT PROCEDURE` (on `RELEASE` ce qu'on
  garde) / `OUTPUT PROCEDURE` (on `RETURN` ce qu'on veut) :
```cobol
           SORT F-TRI ON DESCENDING KEY TRI-SOLDE
               USING F-CLIENTS
               OUTPUT PROCEDURE IS 3000-GARDER-LE-TOP
       ...
       3000-GARDER-LE-TOP.
           PERFORM UNTIL FIN-TRI OR WS-CPT >= 3
               RETURN F-TRI
                   AT END SET FIN-TRI TO TRUE
                   NOT AT END
                       ADD 1 TO WS-CPT
                       MOVE ENR-TRI TO ENR-TOP
                       WRITE ENR-TOP
               END-RETURN
           END-PERFORM.
```
- `MERGE` fusionne des fichiers DÉJÀ triés sur la clé : même syntaxe que SORT.

### 2. La rupture de contrôle — le sous-total
Prérequis absolu : le fichier est TRIÉ sur la clé de rupture. Le motif :
```
lire le premier ; memoriser la cle
tant que pas fin :
    si cle lue <> cle memorisee :
        editer le sous-total ; remettre a zero ; memoriser la nouvelle cle
    cumuler ; editer la ligne ; lire
editer le DERNIER sous-total ; editer le total general
```
Le piège immortel : oublier le sous-total du dernier groupe. Tout le monde l'a fait
une fois. Une seule.

### 3. CALL — les sous-programmes
Programme appelant :
```cobol
           CALL "CALCFRAI" USING BY CONTENT   WS-SOLDE
                                 BY REFERENCE WS-FRAIS
           END-CALL
```
Programme appelé (fichier séparé `calcfrai.cob`) :
```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CALCFRAI.
       DATA DIVISION.
       LINKAGE SECTION.
       01  LK-SOLDE   PIC S9(7)V99.
       01  LK-FRAIS   PIC S9(3)V99.
       PROCEDURE DIVISION USING LK-SOLDE LK-FRAIS.
       0000-PRINCIPAL.
           ...
           GOBACK.
```
- `BY REFERENCE` (défaut) : l'appelé peut MODIFIER la zone. `BY CONTENT` : copie,
  intouchable. Règle CGBA : entrées en CONTENT, sorties en REFERENCE.
- `GOBACK` dans un sous-programme (jamais STOP RUN : il tuerait tout le monde).
- Compilation : `cobc -x -Wall -o prog principal.cob calcfrai.cob`.

### 4. COPY — les copybooks
Un copybook = un morceau de source partagé (typiquement une description
d'enregistrement), dans un fichier `.cpy`, inclus par :
```cobol
       FD  F-CLIENTS.
       COPY "CLIENT.CPY".
```
Une description, N programmes. Le jour où le format change, on modifie UN fichier.
C'est la colonne vertébrale des vrais systèmes (la CGBA en a 3 200).

---

Prérequis données : `clients.dat` (GENDATA de J07) et `vip.dat` (J07 ex05).

## EXERCICE 00 — LE TRI SIMPLE (15 XP)
**Rendu :** `rendu/J09/ex00/trinom.cob` · **PROGRAM-ID :** `TRINOM`

Triez `clients.dat` par nom croissant vers `tries.dat` (USING/GIVING) :
```
$> ./trinom
TRI TERMINE
$> cut -c6-12 tries.dat
DUPONT ...
```
BERTHA vérifie `tries.dat` : AHOYO, DUBOIS, DUPONT, JOHNSON, KOSSOU, MARTIN,
NDIAYE, TRAORE (enregistrements complets, format 49 inchangé).

## EXERCICE 01 — LE TRI MULTI-CLÉS (20 XP)
**Rendu :** `rendu/J09/ex01/triville.cob` · **PROGRAM-ID :** `TRIVILLE`

Ville croissante PUIS solde décroissant, vers `triville.dat` :
```
$> ./triville
TRI TERMINE
```
Ordre attendu : TRAORE / JOHNSON / KOSSOU, AHOYO / NDIAYE / DUPONT, DUBOIS, MARTIN.

## EXERCICE 02 — L'ÉCRÉMAGE (20 XP)
**Rendu :** `rendu/J09/ex02/top3.cob` · **PROGRAM-ID :** `TOP3`

Les 3 plus gros soldes vers `top3.dat`, via OUTPUT PROCEDURE (interdit de trier
tout le fichier PUIS de couper avec un second programme) :
```
$> ./top3
TOP 3 EDITE
$> ./lecture3   (votre lecteur adapte, non rendu)
00005 TRAORE               ABIDJAN         1000000.00
00002 KOSSOU               COTONOU          250000.00
00007 AHOYO                COTONOU           75300.10
```
BERTHA lit `top3.dat` directement (3 enregistrements, format 49).

## EXERCICE 03 — LA FUSION DES MONDES (15 XP)
**Rendu :** `rendu/J09/ex03/mergeall.cob` · **PROGRAM-ID :** `MERGEALL`

MERGE de `tries.dat` (ex00) et `vip.dat` (déjà trié par nom : OKONKWO < SIMPSON)
sur le nom, vers `fusion.dat` :
```
$> ./mergeall
10 CLIENTS FUSIONNES
```
(Comptage via OUTPUT PROCEDURE. Ordre attendu : AHOYO, DUBOIS, DUPONT, JOHNSON,
KOSSOU, MARTIN, NDIAYE, OKONKWO, SIMPSON, TRAORE.)

## EXERCICE 04 — LE SOUS-PROGRAMME CALCFRAI (20 XP)
**Rendu :** `rendu/J09/ex04/` — `frais.cob` + `calcfrai.cob` · **PROGRAM-ID :**
`FRAIS` et `CALCFRAI`

Le barème de J03 ex02 devient un sous-programme (entrée : solde BY CONTENT ;
sortie : frais BY REFERENCE). Le principal lit `clients.dat` et édite :
```
$> ./frais
00001 DUPONT               FRAIS :      2.50
00002 KOSSOU               FRAIS :      0.00
00003 NDIAYE               FRAIS :      5.00
00004 MARTIN               FRAIS :      5.00
00005 TRAORE               FRAIS :      0.00
00006 JOHNSON              FRAIS :      2.50
00007 AHOYO                FRAIS :      0.00
00008 DUBOIS               FRAIS :      5.00
TOTAL FRAIS :     20.00
```
(Éditions `ZZZZZ9.99`. Le barème vit UNIQUEMENT dans CALCFRAI — le principal ne
connaît aucun montant de frais.)

## EXERCICE 05 — LE COPYBOOK (15 XP)
**Rendu :** `rendu/J09/ex05/` — `CLIENT.CPY` + `lecture2.cob` · **PROGRAM-ID :**
`LECTURE2`

Extrayez la description de l'enregistrement client dans `CLIENT.CPY` (niveaux 05
uniquement, le 01 reste dans le programme) et réécrivez le lecteur de J07 ex01 en
l'utilisant. Sortie identique à J07 ex01. BERTHA vérifie que `lecture2.cob`
contient bien `COPY "CLIENT.CPY"` et AUCUNE description de champ client en dur.

## EXERCICE 06 — LA RUPTURE (25 XP)
**Rendu :** `rendu/J09/ex06/parvil.cob` · **PROGRAM-ID :** `PARVIL`

L'état par ville, à partir de `triville.dat` (ex01) — LE motif du métier :
```
$> ./parvil
VILLE : ABIDJAN
  00005 TRAORE                1000000.00
SOUS-TOTAL ABIDJAN         :    1000000.00
VILLE : BRUXELLES
  00006 JOHNSON                  4500.25
SOUS-TOTAL BRUXELLES       :       4500.25
VILLE : COTONOU
  00002 KOSSOU                 250000.00
  00007 AHOYO                   75300.10
SOUS-TOTAL COTONOU         :     325300.10
VILLE : DAKAR
  00003 NDIAYE                    150.75
SOUS-TOTAL DAKAR           :        150.75
VILLE : PARIS
  00001 DUPONT                  12345.50
  00008 DUBOIS                     42.00
  00004 MARTIN                      0.00
SOUS-TOTAL PARIS           :      12387.50
TOTAL GENERAL              :    1342338.60
```
(Villes TRIMées dans les titres, éditions `ZZZZZZZZ9.99` pour les totaux et
`ZZZZZZZ9.99` pour les lignes ; libellé de sous-total complété à 26 colonnes avant
le `:`. Contrainte : UNE seule lecture du fichier ; le dernier sous-total ne doit
pas manquer — BERTHA le vérifie en premier.)

## BONUS — LA RUPTURE ENRICHIE (+20 XP)
**Rendu :** `rendu/J09/bonus/parvil2.cob` · **PROGRAM-ID :** `PARVIL2`

Même état, mais chaque sous-total est suivi de :
```
  NOMBRE                   :           2
  MOYENNE                  :     162650.05
```
(moyenne ROUNDED ; total général suivi de `NOMBRE` et `MOYENNE` globaux :
8 et 167792.33 — vérifiez : 1342338.60 / 8 = 167792.325 → .33.)

---

## BARÈME DU JOUR
| Ex | 00 | 01 | 02 | 03 | 04 | 05 | 06 | Bonus |
|---|---|---|---|---|---|---|---|---|
| XP | 15 | 20 | 20 | 15 | 20 | 15 | 25 | 20 |

Validation : ≥ 90 XP. Badges : **MAÎTRE DES RUPTURES** (ex06), **L'ARCHITECTE**
(ex04 + ex05 : découpage + copybook).

> *Marcel :* *« Ce week-end, RUSH 02 : la paie. La vraie. Celle qui, si elle est
> fausse, fait sonner ton téléphone un dimanche. Lundi : l'examen. Tu es prêt.
> Enfin, on va vérifier. »*
