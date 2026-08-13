# MISSION 02 — PAYE-MASTER
### Phase 2 · Durée conseillée : 3 semaines · 400 XP

> *Ordre de mission — Josiane KACOU :*
> *« Votre rush m'a sauvé un lundi. Maintenant on industrialise : barèmes en
> fichier (la loi change chaque année, on ne recompile pas la banque pour ça),
> absences, états par service, fichier de virements pour la trésorerie, et des
> REJETS propres — parce qu'en paie, une erreur silencieuse est un scandale
> différé. »*

## 1. LES FICHIERS D'ENTRÉE (à créer tels quels)

`EMPLOYES.DAT` — matricule `9(4)`, nom `X(20)`, service `X(4)`, catégorie `X(2)`,
salaire de base mensuel `9(5)V99` (37 caractères) :
```
1001AMANI FLORE         INFOC30500000
1002BAKO JEAN           INFOC10220000
1003CISSE AWA           PAIEC20300000
1004DIALLO MAMADOU      PAIEC10180000
```

`ABSENCES.DAT` — matricule `9(4)`, jours d'absence non payés `9(2)` :
```
100202
100401
```

`BAREME.DAT` — cotisations progressives PAR TRANCHES (comme l'impôt) : plafond de
tranche `9(8)V99`, taux `9(2)V99` (14 caractères, tranches croissantes, la dernière
a un plafond "infini") :
```
00002000001500
00004000002000
99999999992500
```
(Lecture : de 0 à 2000.00 → 15% ; de 2000.01 à 4000.00 → 20% ; au-delà → 25%.)

## 2. LES RÈGLES DE CALCUL
1. **Retenue d'absence** = base / 22 × jours, `ROUNDED` (22 jours ouvrés).
2. **Prime de catégorie** : C1 → 0%, C2 → 5%, C3 → 10% de la base (table interne
   avec niveaux 88 ou table OCCURS, pas de cascade d'IF).
3. **Brut** = base − retenue + prime.
4. **Cotisations** = somme des tranches : chaque tranche taxe la part du brut
   qu'elle couvre. Exemple canonique (à reproduire dans vos tests) : brut 5500.00
   → 2000×15% + 2000×20% + 1500×25% = 300 + 400 + 375 = **1075.00**.
5. **Net** = brut − cotisations.
6. Le barème est CHARGÉ EN TABLE depuis `BAREME.DAT` au démarrage (OCCURS,
   nombre de tranches variable, maximum 10). Aucun taux en dur dans le code.

## 3. LES PROGRAMMES À LIVRER (`rendu/M02/`)
Chaîne de 3 programmes + orchestration :
1. **`payctl.cob`** (`PAYCTL`) : contrôle des entrées. Employé en double, catégorie
   inconnue, absence d'un matricule inexistant, base nulle → ligne dans
   `REJETS.TXT` (`REJET <FICHIER> <CLE> <MOTIF>`) ; les données saines partent dans
   `EMPLOYES.OK` / `ABSENCES.OK`. Affiche `CONTROLE : n REJETS`.
2. **`paycalc.cob`** (`PAYCALC`) : le moteur. Lit les `.OK`, calcule, écrit
   `PAIE.DAT` (matricule, service, brut, cotis, net — décimales implicites) et
   `BULLETINS.TXT` (gabarit du RUSH02 adapté : lignes RETENUE ABSENCE et PRIME
   CATEGORIE remplacent le détail hebdomadaire). Le calcul des cotisations par
   tranches vit dans le sous-programme **`calcotis.cob`** (`CALCOTIS` : entrée
   brut + la table du barème passée en LINKAGE, sorties cotis) ; la prime dans
   **`calcprim.cob`** (`CALCPRIM`).
3. **`payedit.cob`** (`PAYEDIT`) : les états. Lit `PAIE.DAT`, SORT par service,
   rupture : total brut/cotis/net par service + général ; puis écrit
   `VIREMENTS.DAT` : `VIR` + matricule + net `9(7)V99` + nom (une ligne par
   employé, net > 0).
4. **`run_paie.sh`** : enchaîne 1→2→3, s'arrête si un programme rend un code ≠ 0
   (`MOVE 8 TO RETURN-CODE` en cas d'erreur bloquante ; 0 sinon).
5. Copybooks : `EMPLOYE.CPY`, `PAIE.CPY`, `BAREME.CPY` (minimum).

## 4. LES CHIFFRES DE CONTRÔLE (votre filet — jeu de données ci-dessus)
| Matricule | Brut | Cotisations | Net |
|---|---|---|---|
| 1001 | 5500.00 | 1075.00 | 4425.00 |
| 1002 | 2000.00 | 300.00 | 1700.00 |
| 1003 | 3150.00 | 530.00 | 2620.00 |
| 1004 | 1718.18 | 257.73 | 1460.45 |
| **TOTAL** | **12368.18** | **2162.73** | **10205.45** |

Par service : INFO brut 7500.00 / net 6125.00 · PAIE brut 4868.18 / net 4080.45.
Si vos chiffres diffèrent d'un centime : cherchez le ROUNDED manquant, pas la
calculatrice. Le cas 1004 (retenue 81.82, cotis 257.73) est le juge de paix.

## 5. RECETTE BERTHA
- Jeu nominal ci-dessus : bulletins, états, VIREMENTS.DAT exacts.
- Jeu "sale" : un employé en double, une absence orpheline (matricule 9999), une
  catégorie `C9` → 3 rejets motivés, la paie des autres sort NORMALEMENT.
- Jeu "barème 5 tranches" : votre table doit suivre sans recompilation.

## 6. BARÈME (/400)
| Critère | XP |
|---|---|
| Contrôles + rejets motivés (rien ne passe en silence) | 70 |
| Moteur : retenues, primes, tranches exactes (tableau de contrôle) | 100 |
| Sous-programmes CALCOTIS/CALCPRIM (aucun taux dans PAYCALC) | 50 |
| États par service (SORT + rupture) exacts | 60 |
| VIREMENTS.DAT conforme | 30 |
| Chaîne shell + codes retour + reprise possible étape par étape | 40 |
| Norme, copybooks, rapport de mission | 50 |
| **Bonus** : bulletin PDF-texte soigné (cadres, alignements parfaits) +20 · barème chargé trié et contrôlé (tranches croissantes sinon rejet) +20 | +40 |

> *Marcel :* *« Règle d'or de la paie : le programme peut s'arrêter, jamais se
> tromper. Un REJET est une victoire. Un centime perdu est une défaite. »*
