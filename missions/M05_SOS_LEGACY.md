# MISSION 05 — S.O.S. LEGACY
### Phase 2 · Durée conseillée : 2 semaines · 400 XP

> *Ordre de mission — Marcel, l'air grave :*
> *« Assieds-toi. En 1989, un stagiaire nommé Gégé a écrit GESTFRAI, le calcul des
> frais de tenue de compte. Gégé est parti élever des chèvres. Le programme tourne
> encore. Personne n'y a jamais retouché — jusqu'à ce que la compta ouvre QUATRE
> tickets ce mois-ci. Ta mission : autopsie, réparation, réécriture. C'est le vrai
> métier, petit. 80% du COBOL dans le monde, c'est ÇA. »*

## 1. LE PATIENT — `gestfrai.cob` (recopiez-le TEL QUEL, bugs compris)
```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. GESTFRAI.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT FCLI ASSIGN TO "CLILEG.DAT"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS ST.
       DATA DIVISION.
       FILE SECTION.
       FD  FCLI.
       01  E.
           05 E1 PIC 9(5).
           05 E2 PIC X(20).
           05 E3 PIC 9(2).
           05 E4 PIC 9(7)V99.
       WORKING-STORAGE SECTION.
       77  ST   PIC XX.
       77  W1   PIC 9(3) VALUE 0.
       77  W2   PIC 9(7)V99 VALUE 0.
       77  W3   PIC 9(3)V99.
       77  W4   PIC S9(3).
       77  W5   PIC S9(3)V99.
       77  ED1  PIC ZZZZZ9.99.
       77  ED2  PIC ZZ9.
       PROCEDURE DIVISION.
       DEB.
           OPEN INPUT FCLI.
       BCL.
           READ FCLI.
           ADD 1 TO W1.
           GO TO CALC.
       RET.
           IF ST = "10" GO TO EDI.
           GO TO BCL.
       CALC.
           MOVE 0 TO W3.
           IF E4 < 1000 MOVE 5.00 TO W3.
           IF E4 < 10000 AND E4 >= 1000 MOVE 2.50 TO W3.
           COMPUTE W4 = 26 - E3.
           IF W4 > 20 MOVE 20 TO W4.
           COMPUTE W5 = W3 * W4 / 100.
           SUBTRACT W5 FROM W3.
           ADD W3 TO W2.
           MOVE W3 TO ED1.
           DISPLAY E1 " " E2 " FRAIS : " ED1.
           GO TO RET.
       TOTO.
           COMPUTE W5 = W3 * 0.196.
           GO TO RET.
       EDI.
           MOVE W1 TO ED2.
           DISPLAY "NOMBRE DE CLIENTS : " ED2.
           MOVE W2 TO ED1.
           DISPLAY "TOTAL FRAIS       : " ED1.
           CLOSE FCLI.
           STOP RUN.
```

## 2. LES DONNÉES — `CLILEG.DAT` (id `9(5)`, nom `X(20)`, année d'ouverture sur
DEUX chiffres `9(2)` — oui, deux, on était en 1989 —, solde `9(7)V99`) :
```
00001DUPONT              84001234550
00002KOSSOU              92025000000
00003NDIAYE              05000015075
00004MARTIN              15000000000
00005TRAORE              79100000000
00006JOHNSON             19000450025
00007AHOYO               98000004500
00008DUBOIS              84000004200
```

## 3. LES TICKETS DE LA COMPTA
- **TCK-101** : « Le dernier client de l'état apparaît DEUX FOIS, et le compteur
  annonce 9 clients alors qu'il y en a 8. »
- **TCK-102** : « Le client AHOYO (chez nous depuis 1998 !) paie 8.60 de frais au
  lieu d'une remise fidélité. Les clients récents, eux, sont corrects. »
- **TCK-103** : « Les centimes ne tombent JAMAIS juste avec la compta. Exemple :
  JOHNSON devrait payer 2.32, l'état dit 2.33. »
- **TCK-104** : « Personne ne sait à quoi sert le paragraphe TOTO ni d'où sort le
  nombre 0.196. Le nouveau doit trancher. »

## 4. LE PROTOCOLE (l'ordre est NOTÉ — c'est la méthode pro)
1. **Golden master d'abord.** AVANT de toucher au code : compilez, exécutez,
   capturez la sortie (`./gestfrai > avant.txt`). C'est votre photographie de
   l'existant. On ne modifie jamais un legacy sans photographie.
2. **Autopsie.** Lisez le programme. Dessinez le graphe des GO TO sur papier
   (rendez la photo/scan). Renommez mentalement W1..W5, E1..E4.
3. **Un ticket = un correctif = un commit.** Corrigez dans `gestfrai.cob` bug par
   bug, en re-exécutant après chacun et en notant dans le rapport : cause, ligne,
   correctif, effet mesuré sur la sortie.
   - Pour TCK-102, la règle validée par la compta : **fenêtre de siècle** — année
     réelle = 1900+AA si AA ≥ 60, sinon 2000+AA ; ancienneté = 2026 − année ;
     remise = 1% par an, plafonnée à 20%. Et regardez bien VOTRE golden master :
     le ticket ne cite qu'AHOYO, mais combien de clients sont réellement touchés ?
     (Un ticket sous-estime toujours l'ampleur. Toujours.)
   - Pour TCK-103 : la compta arrondit au centime (`ROUNDED`), pas Gégé.
   - Pour TCK-104 : code mort → suppression documentée (et une hypothèse sur ce
     que 0.196 a pu être — indice : cherchez "taux TVA France années 80").
4. **Réécriture.** `gestfrai2.cob` (`GESTFRA2`) : mêmes résultats (corrigés), mais
   Norme CGBA intégrale — zéro GO TO, noms parlants, paragraphes numérotés,
   contrôle des FILE STATUS, IS NUMERIC sur E3/E4 avant calcul.
5. **Preuve.** `diff` entre la sortie de votre version corrigée étape 3 et celle
   de `gestfrai2` : VIDE. Le refactoring ne change pas le comportement, par
   définition. Joignez la preuve au rapport.

## 5. LA SORTIE CORRECTE ATTENDUE (après les 4 tickets — BERTHA fait foi)
```
$> ./gestfrai2
00001 DUPONT               FRAIS :      0.00
00002 KOSSOU               FRAIS :      0.00
00003 NDIAYE               FRAIS :      4.00
00004 MARTIN               FRAIS :      4.45
00005 TRAORE               FRAIS :      0.00
00006 JOHNSON              FRAIS :      2.32
00007 AHOYO                FRAIS :      4.00
00008 DUBOIS               FRAIS :      4.00
NOMBRE DE CLIENTS :   8
TOTAL FRAIS       :     18.77
```
(Vérifications : MARTIN — ouvert en 2015, 11 ans, remise 11% sur 5.00 → 4.45 ;
JOHNSON — 2019, 7 ans, 2.50 × 7% = 0.175 → retenue 0.18 → 2.32 : si vous lisez
2.33, votre TCK-103 n'est pas réglé.)

## 6. LIVRABLES (`rendu/M05/`)
`avant.txt` (golden master), `gestfrai.cob` corrigé (étape 3), `gestfrai2.cob`,
`RAPPORT.md` (autopsie, 4 fiches de correctif, hypothèse TOTO, diff de preuve,
photo du graphe des GO TO).

## 7. BARÈME (/400)
| Critère | XP |
|---|---|
| Golden master fait AVANT toute modification (l'historique git en témoigne) | 40 |
| TCK-101 : cause exacte identifiée (structure de lecture) + correctif | 80 |
| TCK-102 : fenêtre de siècle correcte (cas 60 exact compris) | 80 |
| TCK-103 : ROUNDED, chiffres au centime | 50 |
| TCK-104 : code mort supprimé + hypothèse argumentée | 20 |
| Réécriture Norme, diff de preuve vide | 90 |
| Rapport d'autopsie (clarté, honnêteté sur les tâtonnements) | 40 |
| **Bonus** : jeu de tests de non-régression rejouable (`tests/` + script) +40 | +40 |

Badge : **NÉCROMANCIEN** (mission validée — vous avez ramené un mort à la vie).

> *Marcel :* *« Gégé n'était pas mauvais. Gégé était pressé, seul, et personne ne
> relisait. Retiens la leçon : ton code de ce soir est le legacy de quelqu'un en
> 2060. Écris pour lui. »*
