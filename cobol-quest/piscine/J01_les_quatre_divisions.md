# PISCINE — J01 : LES QUATRE DIVISIONS
### XP du jour : 95 (+30 bonus) · Prérequis : J00

> *Mémo de Marcel, café n°1 :*
> *« Un programme COBOL, c'est comme la banque : quatre étages, et chacun a son rôle.
> L'IDENTIFICATION dit QUI tu es. L'ENVIRONMENT dit OÙ tu vis. La DATA dit CE QUE tu
> possèdes. La PROCEDURE dit CE QUE tu fais. Les gens qui mélangent les étages
> finissent au sous-sol avec la climatisation. Allez, au boulot. »*

---

## LE MÉMO DU JOUR (fiche de référence — à consulter, pas à réciter)

### 1. Le squelette universel
```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. MONPROG.
      *
       ENVIRONMENT DIVISION.
      *
       DATA DIVISION.
       WORKING-STORAGE SECTION.
      *
       PROCEDURE DIVISION.
       0000-PRINCIPAL.
           DISPLAY "TEXTE".
           STOP RUN.
```
- Les 4 divisions apparaissent **toujours dans cet ordre**. Seules IDENTIFICATION et
  PROCEDURE sont strictement obligatoires ; la Norme CGBA exige les quatre.
- Chaque phrase se termine par un point — mais en Zone de traitement, la Norme veut
  **un seul point par paragraphe** (à la fin), les blocs étant fermés par `END-xxx`.
  Pour J01, vos paragraphes sont courts : un point final suffit.

### 2. Compiler et exécuter
```bash
cobc -x -Wall -o monprog monprog.cob   # -x : exécutable ; -Wall : tous les warnings
./monprog
```

### 3. DISPLAY — parler au monde
```cobol
           DISPLAY "UN TEXTE".
           DISPLAY "A=" WS-A " B=" WS-B.        *> concatene les morceaux
           DISPLAY "SANS RETOUR " WITH NO ADVANCING.
```

### 4. ACCEPT — écouter le monde
Pour recevoir une saisie, il faut une variable. Avant J02, retenez le minimum vital :
```cobol
       WORKING-STORAGE SECTION.
       01 WS-NOM        PIC X(20).      *> X = caractere ; 20 de large
       01 WS-DATE-SYS   PIC 9(8).       *> 9 = chiffre  ; 8 de large
```
```cobol
           ACCEPT WS-NOM.                          *> lit une ligne au clavier
           ACCEPT WS-DATE-SYS FROM DATE YYYYMMDD.  *> date systeme AAAAMMJJ
           ACCEPT WS-HEURE    FROM TIME.           *> HHMMSSCC (8 chiffres)
```
Une `PIC X(20)` qui reçoit "LEA" contient `LEA` + 17 espaces. Un `DISPLAY` la montre
avec ses espaces. Vivez avec aujourd'hui ; J06 vous apprendra à les couper.

### 5. Les commentaires
`*` en colonne 7 = ligne de commentaire. `*>` en fin de ligne = commentaire flottant.

### 6. Découper la date sans outil savant
Une variable groupe se découpe toute seule (avant-goût du J05) :
```cobol
       01 WS-DATE-SYS.
          05 WS-AAAA PIC 9(4).
          05 WS-MM   PIC 9(2).
          05 WS-JJ   PIC 9(2).
```
`ACCEPT WS-DATE-SYS FROM DATE YYYYMMDD` remplit le tout ; `WS-JJ` contient le jour.

---

## EXERCICE 00 — LA CARTE DE VISITE (10 XP)
**Rendu :** `rendu/J01/ex00/carte.cob` · **PROGRAM-ID :** `CARTE`

Affichez votre carte d'employé CGBA, exactement :
```
$> ./carte
+----------------------------+
| CGBA - BANQUE DEPUIS 1962  |
| EMPLOYE : STAGIAIRE        |
| SERVICE : INFORMATIQUE     |
| BUREAU  : SOUS-SOL 3       |
+----------------------------+
```
Contrainte : chaque ligne est un `DISPLAY`. Comptez vos espaces : BERTHA les compte.

## EXERCICE 01 — L'ECHO DU GUICHET (15 XP)
**Rendu :** `rendu/J01/ex01/echo.cob` · **PROGRAM-ID :** `ECHO`

Le programme demande un nom, puis salue :
```
$> ./echo
VOTRE NOM :
MARCEL
BONJOUR MARCEL              , BIENVENUE A LA CGBA
```
Oui, il y a des espaces bizarres après MARCEL : c'est votre `PIC X(20)` qui respire.
Reproduisez EXACTEMENT cette sortie (nom saisi : `MARCEL`). Comprendre pourquoi ces
espaces existent fait partie de l'exercice.

## EXERCICE 02 — LE PANNEAU DE BERTHA (15 XP)
**Rendu :** `rendu/J01/ex02/panneau.cob` · **PROGRAM-ID :** `PANNEAU`

BERTHA affiche sa bannière au démarrage depuis 1987. Recopiez-la au pixel près :
```
$> ./panneau
==============================================
 BERTHA V2.4 - SYSTEME DE VALIDATION BATCH
 (C) CGBA 1987 - TOUS DROITS RESERVES
 INITIALISATION.......................... OK
 LECTEUR DE CARTES....................... ABSENT
 CAFETIERE............................... OK
==============================================
```

## EXERCICE 03 — QUEL JOUR SOMMES-NOUS (20 XP)
**Rendu :** `rendu/J01/ex03/aujourdhui.cob` · **PROGRAM-ID :** `AUJOURD`

Affichez la date système au format français :
```
$> ./aujourdhui
NOUS SOMMES LE 12/08/2026
```
(La date affichée est celle du jour de l'exécution ; BERTHA recalcule l'attendu.)
Contrainte : utilisez `ACCEPT ... FROM DATE YYYYMMDD` et une variable groupe.

## EXERCICE 04 — L'HORODATAGE (20 XP)
**Rendu :** `rendu/J01/ex04/pointage.cob` · **PROGRAM-ID :** `POINTAGE`

À la CGBA on pointe. Combinez date et heure système :
```
$> ./pointage
POINTAGE EMPLOYE
DATE  : 12/08/2026
HEURE : 09H41
BONNE JOURNEE
```
(`FROM TIME` renvoie HHMMSSCC : gardez heures et minutes.)

## EXERCICE 05 — LE FORMULAIRE (15 XP)
**Rendu :** `rendu/J01/ex05/formulaire.cob` · **PROGRAM-ID :** `FORMUL`

Trois `ACCEPT` successifs (nom, ville, matricule), puis un récapitulatif :
```
$> ./formulaire
NOM ?
DIOP
VILLE ?
COTONOU
MATRICULE ?
00042
--------------------------------
FICHE AGENT
NOM       : DIOP
VILLE     : COTONOU
MATRICULE : 00042
--------------------------------
```
Déclarez le matricule en `PIC 9(5)`. Testez ce qui se passe si vous tapez `42` au
lieu de `00042`, puis `ABC`. Notez vos observations en commentaire de fin de fichier
(zone `* OBSERVATIONS :`) — Marcel les lit.

## BONUS — LA MACHINE À REMONTER LE TEMPS (+30 XP)
**Rendu :** `rendu/J01/bonus/retraite.cob` · **PROGRAM-ID :** `RETRAITE`

Marcel part à la retraite le 01/02/2027. Affichez :
```
$> ./retraite
NOUS SOMMES LE 12/08/2026
MARCEL PART LE 01/02/2027
COURAGE MARCEL
```
puis, si la date système est POSTÉRIEURE au 01/02/2027, remplacez la dernière ligne
par `MARCEL EST LIBRE`. (Un `IF` en avance sur J03 : débrouillez-vous, c'est un
bonus. Indice : deux `PIC 9(8)` se comparent très bien.)

---

## BARÈME DU JOUR
| Ex | 00 | 01 | 02 | 03 | 04 | 05 | Bonus |
|---|---|---|---|---|---|---|---|
| XP | 10 | 15 | 15 | 20 | 20 | 15 | 30 |

Validation de la journée : ≥ 70 XP. Badge du jour : **LES QUATRE SAISONS** (tous les
exercices non-bonus validés).

> *Marcel, en partant :* *« Demain, on ouvre le coffre : la DATA DIVISION. Tu vas
> apprendre à décrire un centime avec la précision d'un horloger suisse. Dors bien. »*
