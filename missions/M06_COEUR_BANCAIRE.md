# MISSION 06 — LE CŒUR BANCAIRE
### Phase 2 · Le chef-d'œuvre · Durée conseillée : 4 à 6 semaines · 800 XP

> *Ordre de mission — Direction, copie Marcel :*
> *« Vous allez construire une chaîne batch de nuit complète : celle qui, à la
> vraie CGBA, tourne entre 21h40 et 4h du matin depuis 1974. Six étapes, des
> contrôles partout, une balance qui tombe juste AU CENTIME, et une documentation
> qui permettrait à un inconnu de relancer la chaîne un 31 décembre à 23h50.
> Quand ce dossier sera vert, Marcel signera votre habilitation. »*

## 1. LES DONNÉES DE RÉFÉRENCE (à créer telles quelles)

`INIT-COMPTES.DAT` — compte `9(5)`, titulaire `X(20)`, type `X` (C courant /
E épargne), statut `X` (A/B/C), solde `9(7)V99` (36 caractères) :
```
00001DUPONT              CA001234550
00002KOSSOU              EA025000000
00003NDIAYE              CA000015075
00004MARTIN              CB000000000
00005TRAORE              EA100000000
00006JOHNSON             CA000450025
00007AHOYO               CA007530010
00008DUBOIS              EA000004200
```

`MVTS-JOUR.DAT` — date `9(8)`, compte `9(5)`, sens `X`, montant `9(7)V99`,
libellé `X(20)` (43 caractères) :
```
2026070100001D000050000LOYER JUILLET       
2026070200003C000100000VIREMENT SALAIRE    
2026070300002D000200000RETRAIT DAB         
2026130100001C000010000DATE FOLLE          
2026070500005C002500000PRIME ANNUELLE      
2026070800004X000005000SENS INCONNU        
2026071099999D000001000COMPTE FANTOME      
2026071200006D000450025SOLDE A ZERO        
2026071500001C000075000REMBOURSEMENT       
2026071800007D008000000GROS RETRAIT        
2026072000008C000004200EPARGNE MARCEL      
2026072500002D000100000CHEQUE 1043         
```

## 2. LA CHAÎNE — SIX ÉTAPES (`rendu/M06/`)
| Étape | Programme | Rôle |
|---|---|---|
| 01 | `ctl001.cob` | Contrôle syntaxique des mouvements (date plausible, sens D/C, montant numérique > 0). Valides → `MVTS.OK`, invalides → `REJETS-01.TXT` motivés. RC 0/4/8. |
| 02 | `tri002.cob` | SORT de `MVTS.OK` par compte puis date puis séquence d'origine → `MVTS.TRI`. Réimprime les totaux D/C : ils doivent être IDENTIQUES à ceux de l'étape 01 (le tri ne perd rien). |
| 03 | `maj003.cob` | Mise à jour de `COMPTES.IDX` (chargé depuis INIT). Compte inconnu ou statut ≠ A → `REJETS-03.TXT`. Découvert autorisé mais tracé. Puis, par compte : type E et solde final > 0 → intérêts +0.75% ROUNDED ; type C et solde final < 0 → agios forfaitaires 5.00. |
| 04 | `rel004.cob` | Relevés clients (modèle J10 Partie C, alertes découvert comprises) → `RELEVES.TXT`. |
| 05 | `cpt005.cob` | Les écritures comptables agrégées + LA BALANCE (voir §4). RC 8 si KO. |
| 06 | `arc006.sh` | Archivage : déplace les fichiers du jour dans `archives/AAAAMMJJ/`, écrit un témoin `TEMOIN.OK`. |

**`run_chaine.sh`** orchestre tout : exécute 01→06, journalise dans `chaine.log`
(horodatage, étape, code retour), s'arrête net sur RC 8, continue en signalant sur
RC 4, et accepte `--depuis NN` pour REPRENDRE au milieu (le point de reprise est la
compétence d'exploitation n°1 : un batch de nuit qui plante à l'étape 4 ne se
relance pas depuis l'étape 1).

## 3. LES CHIFFRES DE CONTRÔLE (jeu de référence)
Étape 01 :
```
LIGNES LUES     : 12
LIGNES VALIDES  : 10
REJETS          : 2
```
(`REJETS-01.TXT` : `REJET LIGNE 04 DATE INVALIDE` et `REJET LIGNE 06 SENS
INVALIDE`.) Étape 03 : 10 lus, 9 appliqués, 1 rejet (`COMPTE INCONNU 99999`).
Sondes de soldes finaux : `00007` = **-4704.90** (découvert + agios), `00008` =
**84.63** (42+42 puis 0.75%), `00005` = **1032687.50**.

## 4. LA BALANCE — LE CŒUR DU CŒUR (étape 05, sortie exacte)
```
=== ECRITURES COMPTABLES ===
TOTAL DEBITS APPLIQUES   :     88000.25
TOTAL CREDITS APPLIQUES  :     26792.00
INTERETS VERSES          :      9540.63
AGIOS PERCUS             :         5.00
SOLDES INITIAUX          :   1342338.60
SOLDES FINAUX            :   1290665.98
CONTROLE BALANCE         : OK
```
L'invariant : `FINAUX = INITIAUX - DEBITS + CREDITS + INTERETS - AGIOS`. Il doit
tomber AU CENTIME, calculé de DEUX manières indépendantes (par cumul des flux et
par relecture des soldes) — si les deux chemins divergent d'un centime, la chaîne
s'arrête (RC 8) et vous cherchez. C'est exactement ainsi qu'une banque se
surveille elle-même depuis un siècle.

## 5. LES QUATRE INVARIANTS (BERTHA les vérifie sur le jeu de référence ET sur un
jeu secret de 200 mouvements)
1. Étape 01 : `LUS = VALIDES + REJETS`.
2. Étape 02 : totaux D/C identiques avant/après tri.
3. Étape 03 : `VALIDES = APPLIQUES + REJETES` (aucune ligne ne disparaît).
4. Étape 05 : balance carrée, deux chemins de calcul.

## 6. LA DOCUMENTATION D'EXPLOITATION (`rendu/M06/EXPLOITATION.md`)
Le document qu'on pose à côté du téléphone d'astreinte : schéma de la chaîne
(fichiers entrants/sortants de chaque étape), signification des codes retour,
procédure de reprise étape par étape, procédure "la balance est KO : que
regarder, dans quel ordre". Deux pages maximum, style télégraphique. Un inconnu
doit pouvoir opérer.

## 7. BARÈME (/800)
| Critère | XP |
|---|---|
| Étapes 01-02 (contrôles, tri stable, conservation des totaux) | 120 |
| Étape 03 (mise à jour, rejets, intérêts, agios — sondes exactes) | 180 |
| Étape 04 (relevés conformes, alertes) | 80 |
| Étape 05 (balance exacte, double chemin, RC 8 si KO) | 140 |
| Orchestration (`run_chaine.sh`, log, `--depuis`, RC respectés) | 100 |
| Invariants tenus sur le jeu secret | 80 |
| Documentation d'exploitation + rapport de mission | 60 |
| Soutenance écrite : réponses aux 5 questions de Marcel (fournies dans `SOUTENANCE.md` à la validation des étapes 1-5) | 40 |
| **Bonus** : reprise sur incident réelle (BERTHA tue la chaîne à l'étape 3, vous repartez SANS double application des mouvements — idempotence) +60 · état des anomalies consolidé multi-étapes +20 | +80 |

Badge : **GARDIEN DU MAINFRAME**. Titre : *Développeur COBOL confirmé, habilitation
chaîne de nuit.* Marcel peut partir tranquille — c'est vous, maintenant.

> *Marcel, en rangeant son bureau :*
> *« Trente-huit ans que je lance cette chaîne. Ce soir, c'est toi. Si la balance
> est carrée à 4h du matin, tu comprendras pourquoi je n'ai jamais voulu faire
> autre chose. Bonne nuit, collègue. »*
