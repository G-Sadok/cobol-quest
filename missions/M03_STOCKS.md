# MISSION 03 — STOCKS & Cie
### Phase 2 · Durée conseillée : 2 semaines · 350 XP

> *Ordre de mission — Mme KERBRAT :*
> *« La filiale fournitures (STOCKS & Cie) gère son magasin sur un cahier à
> spirale. L'expert-comptable exige une valorisation FIFO — premier entré, premier
> sorti — comme dans toute la profession. Marcel dit que le FIFO est "le plus joli
> algorithme du métier". Il dit ça de tout, mais cette fois il a raison. »*

## 1. LE PRINCIPE FIFO (lisez deux fois)
Chaque ENTRÉE en stock crée un **lot** : une quantité à un prix d'achat. Chaque
SORTIE consomme les lots **du plus ancien au plus récent**. Le coût d'une sortie
est donc la somme de ce qu'elle a consommé, lot par lot.

**Exemple canonique (à reproduire dans vos tests) :**
```
E 100 unites a 2.00   -> lots : [100 @ 2.00]
E  50 unites a 2.50   -> lots : [100 @ 2.00] [50 @ 2.50]
S 120 unites          -> consomme 100 @ 2.00 (200.00)
                          puis     20 @ 2.50 ( 50.00)
                          COUT DE LA SORTIE : 250.00
                          lots restants : [30 @ 2.50] -> stock 30, valeur 75.00
```

## 2. LES DONNÉES (à créer telles quelles)

`PRODUITS.DAT` — référence `X(5)`, désignation `X(20)`, seuil d'alerte `9(5)`
(30 caractères) :
```
P0001CLAVIER MECANIQUE   00020
P0002ECRAN 24 POUCES     00010
P0003CABLE RESEAU 3M     00050
```

`MVTS.DAT` — référence `X(5)`, sens `X` (E/S), quantité `9(5)`, prix unitaire
`9(5)V99` (zéro pour les sorties : le prix d'une sortie, c'est le FIFO qui le
calcule), date `9(8)` (26 caractères, déjà en ordre chronologique) :
```
P0001E00100000020020260701
P0001E00050000025020260703
P0002E00020001500020260705
P0003E00200000008020260706
P0001S00120000000020260710
P0002S00012000000020260712
P0003S00180000000020260715
```

## 3. LES PROGRAMMES À LIVRER (`rendu/M03/`)
1. **`initprod.cob`** (`INITPROD`) : charge `PRODUITS.DAT` → `produits.idx`
   (clé = référence). `3 PRODUITS CHARGES`.
2. **`stockmvt.cob`** (`STOCKMVT`) : le moteur. Lit `MVTS.DAT` en séquence,
   maintient PAR PRODUIT une table de lots (OCCURS 20 : quantité restante + prix),
   applique le FIFO, cumule le coût des sorties, détecte les anomalies.
3. **`inventai.cob`** (`INVENTAI`) : produit `INVENTAIRE.TXT` (état final).
4. Copybooks `PRODUIT.CPY` et `MVT.CPY`.

## 4. LES RÈGLES
- Sortie > stock disponible → mouvement REJETÉ intégralement :
  `REJET <REF> STOCK INSUFFISANT` (on ne sert pas à moitié).
- Référence inconnue → `REJET <REF> PRODUIT INCONNU`.
- Alerte si, en fin de traitement, stock < seuil. Quantité à commander :
  `2 x seuil - stock` (règle maison de réapprovisionnement).
- Valeur du stock d'un produit = somme des lots restants (quantité × prix du lot).
  JAMAIS un prix moyen : le commissaire aux comptes vérifie lot par lot.

## 5. LA SORTIE ATTENDUE (`INVENTAIRE.TXT`, jeu nominal ci-dessus)
```
=== INVENTAIRE VALORISE FIFO ===
P0001 CLAVIER MECANIQUE   STOCK :    30 VALEUR :      75.00
P0002 ECRAN 24 POUCES     STOCK :     8 VALEUR :    1200.00
P0003 CABLE RESEAU 3M     STOCK :    20 VALEUR :      16.00
VALEUR TOTALE DU STOCK    :    1291.00
COUT DES SORTIES          :    2194.00
=== ALERTES ===
ALERTE P0002 STOCK     8 SEUIL    10 COMMANDER    12
ALERTE P0003 STOCK    20 SEUIL    50 COMMANDER    80
2 ALERTES
```
(Quantités `ZZZZ9`, montants `ZZZZZZ9.99`. Vérifiez à la main P0001 avec l'exemple
canonique : c'est le même.)

## 6. RECETTE BERTHA
- Jeu nominal → INVENTAIRE.TXT exact ci-dessus.
- Jeu "rupture" : une sortie de 500 claviers → rejet, stock intact.
- Jeu "inconnu" : mouvement sur P9999 → rejet, le reste continue.
- Jeu "multi-lots" : 5 entrées puis sorties en cascade sur un produit — vos lots
  doivent se consommer dans l'ordre strict.

## 7. BARÈME (/350)
| Critère | XP |
|---|---|
| FIFO exact (exemple canonique + multi-lots) | 120 |
| Inventaire valorisé conforme | 60 |
| Rejets (rupture, inconnu) sans corruption du stock | 60 |
| Alertes + quantités de réappro | 40 |
| Architecture (3 programmes, copybooks, table de lots propre) | 40 |
| Rapport de mission (dont : schéma de votre table de lots) | 30 |
| **Bonus** : méthode CUMP (coût unitaire moyen pondéré) en option de lancement, avec comparaison des deux valorisations +40 | +40 |

> *Marcel :* *« Le FIFO, c'est la file d'attente de la boulangerie : le premier
> croissant arrivé est le premier vendu. Si ton code vend les croissants du fond,
> l'expert-comptable te le fera regretter. »*
