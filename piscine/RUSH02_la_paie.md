# RUSH 02 — LA PAIE DE LA CGBA
### Week-end 2 · Synthèse J06→J09 · 150 XP (+30 bonus)

> *Note de service — Josiane KACOU, service Paie :*
> *« Le logiciel de paie a rendu l'âme jeudi (paix à son GO TO). La paie du mois
> doit sortir LUNDI. Marcel dit que vous êtes prêt. Marcel dit aussi que si son
> bulletin est faux, il le saura. Bon courage. »*

## LES DONNÉES (à créer telles quelles)

`EMPLOYES.DAT` — matricule `9(4)`, nom `X(20)`, taux horaire `9(3)V99`,
ancienneté en années `9(2)` (31 caractères) :
```
0001MARCEL DUBOIS       0450042
0002JOSIANE KACOU       0285008
0003ALI SOW             0180001
```

`HEURES.DAT` — matricule `9(4)`, semaine `9(2)`, heures `9(2)V99` (10 caractères),
4 semaines par employé. **Le fichier n'est PAS garanti trié** (BERTHA le mélange
avant de tester) :
```
0001013500
0001023800
0001033500
0001044000
0002013500
0002023500
0002033500
0002043500
0003012000
0003022200
0003031800
0003042000
```

## LES RÈGLES DE PAIE (le cahier de Josiane)
1. **Brut hebdomadaire** : jusqu'à 35 h → `heures × taux` ; au-delà, les heures
   supplémentaires sont payées `taux × 1.25`.
2. **Brut heures mensuel** = somme des 4 semaines.
3. **Prime d'ancienneté** : 2% du brut heures par tranche COMPLÈTE de 5 ans,
   plafonnée à 10%.
4. **Brut total** = brut heures + prime.
5. **Cotisations** : 22% du brut total, `ROUNDED`.
6. **Net** = brut total − cotisations.
7. Tous les calculs monétaires : zones signées, cumuls COMP-3, `ROUNDED` à chaque
   étape monétaire.

## LES LIVRABLES
`rendu/RUSH02/` : `paie.cob` (PROGRAM-ID `PAIE`), `calcnet.cob` (PROGRAM-ID
`CALCNET`), `EMPLOYE.CPY`, `HEURES.CPY`.

**Architecture imposée :**
- SORT de `HEURES.DAT` (matricule puis semaine) — le désordre est votre problème,
  pas celui de Josiane.
- Les 3 employés sont chargés en table (OCCURS + SEARCH) à l'initialisation.
- Rupture de contrôle par matricule sur le fichier d'heures trié.
- `CALCNET` : entrée brut total (BY CONTENT), sorties cotisations + net
  (BY REFERENCE). Le taux 22% vit UNIQUEMENT dans CALCNET.
- Descriptions d'enregistrements dans les deux copybooks.

## LES SORTIES ATTENDUES

Écran :
```
$> ./paie
3 BULLETINS EDITES
TOTAL BRUT :    12934.80
TOTAL COTIS:     2845.66
TOTAL NET  :    10089.14
CONTROLE   : OK
```
(`CONTROLE : OK` si total brut − total cotis = total net au centime, sinon `KO` —
et là, ne rendez pas.)

Fichier `BULLETINS.TXT` (les 3 bulletins à la suite ; celui de Marcel fait foi,
les deux autres suivent le même gabarit exactement) :
```
========================================
 BULLETIN DE PAIE - CGBA
 MATRICULE : 0001
 NOM       : MARCEL DUBOIS
========================================
 SEMAINE 01 : 35.00 H  BRUT :    1575.00
 SEMAINE 02 : 38.00 H  BRUT :    1743.75
 SEMAINE 03 : 35.00 H  BRUT :    1575.00
 SEMAINE 04 : 40.00 H  BRUT :    1856.25
----------------------------------------
 BRUT HEURES     :    6750.00
 PRIME ANCIEN.   :     675.00
 BRUT TOTAL      :    7425.00
 COTISATIONS 22% :    1633.50
 NET A PAYER     :    5791.50
========================================
```
(Éditions : heures `Z9.99`, montants `ZZZZZZ9.99`.)

Vérifications de Josiane (faites-les avant BERTHA) : la semaine 04 de Marcel vaut
1856.25 (35×45 + 5×45×1.25) ; la prime de Marcel est PLAFONNÉE (42 ans → 16% → 10%) ;
la cotisation de Josiane tombe sur un demi-centime (895.356 → 895.36 : si vous
obtenez 895.35, votre ROUNDED manque quelque part).

## BARÈME (/150)
| Critère | XP |
|---|---|
| Bulletins conformes au gabarit (les 3) | 40 |
| Écran + CONTROLE OK | 20 |
| Heures supplémentaires exactes | 25 |
| Prime plafonnée exacte | 15 |
| SORT + rupture (test sur fichier mélangé) | 20 |
| Copybooks + CALCNET + Norme | 30 |
| **Bonus** : matricule inconnu dans HEURES → ligne dans `REJETS.TXT` (`REJET MATRICULE 9999 SEMAINE 02`) sans faire tomber la paie (+20) ; ligne `NET ANNUEL PROJETE` (net × 12) sous chaque bulletin (+10) | +30 |

> *Marcel, dimanche soir :* *« Mon bulletin est juste. Tu peux dormir. Demain 9h,
> salle BERTHA. Quatre heures. Tout ce que tu sais. »*
