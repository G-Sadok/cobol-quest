# MISSION 01 — GUICHET-3000
### Phase 2 · Durée conseillée : 2 semaines · 300 XP

> *Ordre de mission — Mme KERBRAT :*
> *« Les guichetiers de l'agence de Cotonou travaillent encore avec l'application
> TSO de 1994 et un post-it de mots de passe. Vous allez leur construire
> GUICHET-3000 : l'application de tenue de comptes nouvelle génération (enfin,
> génération 2026, sur terminal, comme il se doit). Marcel supervise. Josiane
> testera — et Josiane tape vite et mal, prévoyez tout. »*

## 1. OBJET
Application interactive de gestion de comptes sur fichier indexé, robuste, avec
journal d'audit, pilotable au clavier comme par scénario (BERTHA alimente l'entrée
standard).

## 2. LES DONNÉES
Fichier de chargement initial `INIT-COMPTES.DAT` (58 caractères) — compte `9(5)`,
titulaire `X(20)`, ville `X(15)`, solde `9(7)V99`, statut `X` (A/B/C), date
d'ouverture `9(8)` :
```
00001DUPONT              PARIS          001234550A19870312
00002KOSSOU              COTONOU        025000000A19921105
00003NDIAYE              DAKAR          000015075A20010623
00004MARTIN              PARIS          000000000B20150217
00005TRAORE              ABIDJAN        100000000A19790101
00006JOHNSON             BRUXELLES      000450025A20200814
00007AHOYO               COTONOU        007530010A20050930
00008DUBOIS              PARIS          000004200A19840416
00009OKONKWO             LAGOS          050000000B20180301
00010SIMPSON             SPRINGFIELD    000099999C20220711
```
Base de travail : `COMPTES.IDX` — clé primaire compte, clé alternative ville
(doublons).

## 3. LES PROGRAMMES À LIVRER (`rendu/M01/`)
1. **`chargeur.cob`** (`CHARGEUR`) : INIT → COMPTES.IDX, affiche
   `10 COMPTES CHARGES`.
2. **`guichet3.cob`** (`GUICHET3`) : l'application. Menu en boucle :
```
--- GUICHET-3000 - CGBA ---
1 CONSULTER
2 DEPOT
3 RETRAIT
4 VIREMENT
5 CREER UN COMPTE
6 BLOQUER/DEBLOQUER
7 CLOTURER
8 LISTE PAR VILLE
9 QUITTER
CHOIX ?
```
3. **Copybook `COMPTE.CPY`** partagé par les deux programmes.
4. **`journal.cob`** (`JOURNAL`) : lecteur du journal d'audit (affichage brut +
   compteur).

## 4. LES RÈGLES DE GESTION (contractuelles)
- **Consulter** : tout statut. Affiche compte, titulaire, ville, solde, statut en
  clair (`ACTIF` / `BLOQUE` / `CLOTURE`), date `JJ/MM/AAAA`.
- **Dépôt** : refusé si clôturé (`COMPTE CLOTURE`). Autorisé si bloqué (on peut
  toujours recevoir).
- **Retrait** : refusé si bloqué ou clôturé, refusé si provision insuffisante
  (`PROVISION INSUFFISANTE`) — dans cet ordre de contrôle.
- **Virement** : compte source ET destination valides et actifs, provision
  suffisante. Le virement est ATOMIQUE : si le crédit échoue, le débit est annulé
  (ordre des REWRITE réfléchi — expliquez votre stratégie en commentaire).
  Virement d'un compte vers lui-même : `VIREMENT SUR SOI-MEME REFUSE`.
- **Créer** : numéro proposé = plus grand numéro + 1, affiché
  (`COMPTE CREE : 00011`) ; titulaire non vide ; solde initial ≥ 0 ; statut A ;
  date = date système.
- **Bloquer/Débloquer** : bascule A↔B ; refusé si clôturé.
- **Clôturer** : uniquement si solde = 0 (`CLOTURE REFUSEE - SOLDE NON NUL`) ;
  statut → C (l'enregistrement RESTE : une banque n'efface jamais, elle clôture).
- **Liste par ville** : via la clé alternative, format
  `00001 DUPONT               ACTIF`.
- **Toute saisie** est contrôlée (numérique, bornes, codes valides). Une erreur ne
  fait JAMAIS sortir du programme : message + retour menu.
- **Montants** : saisis en `X(10)`, validés, décimale au point (`150.00`).

## 5. LE JOURNAL D'AUDIT (`JOURNAL.DAT`, OPEN EXTEND)
Une ligne par opération QUI MODIFIE la base, acceptée ou refusée :
```
AAAAMMJJ HHMMSS <CODE> <CPT1> <CPT2> <MONTANT 9(7)V99> <RESULTAT>
```
Codes : `DEP RET VIR CRE BLO DEB CLO`. `CPT2` = 00000 sauf virement. Résultat :
`OK` ou `REFUS-<MOTIF>` (`REFUS-PROVISION`, `REFUS-STATUT`, `REFUS-INCONNU`,
`REFUS-SOLDE`). Exemple :
```
20260812 104233 VIR 00002 00003 000050000 OK
20260812 104501 RET 00004 00000 000010000 REFUS-STATUT
```

## 6. SCÉNARIO DE RECETTE (extrait — BERTHA en joue 6 du même genre)
Entrée standard : `1 00005 3 00005 250000.00 4 00002 00003 500.00 7 00004 9`
(un jeton par ligne). Sorties attendues, dans l'ordre : la fiche TRAORE ; retrait →
`NOUVEAU SOLDE :    750000.00` ; virement → `VIREMENT EFFECTUE` puis
`SOLDE 00002 :    249500.00` et `SOLDE 00003 :        650.75` ; clôture 00004
(solde 0, mais statut B : la clôture d'un compte bloqué à solde nul est ACCEPTÉE —
règle métier, notez-la) → `COMPTE 00004 CLOTURE` ; `AU REVOIR`. Le journal doit
contenir exactement 3 lignes (RET, VIR, CLO — la consultation ne journalise pas).

## 7. BARÈME (/300)
| Critère | XP |
|---|---|
| Chargeur + consultation + dépôt/retrait conformes | 60 |
| Virement atomique (y compris cas de refus) | 50 |
| Création, blocage, clôture conformes | 45 |
| Liste par ville (clé alternative) | 25 |
| Journal d'audit exact (formats, refus journalisés) | 45 |
| Robustesse aux saisies folles (Josiane-proof : lettres, vide, 0, négatif) | 40 |
| Norme + copybook + découpage (revue par Marcel-IA ou auto-revue guidée) | 35 |
| **Bonus** : SCREEN SECTION (vrai écran de guichet) +30 · relevé des N dernières opérations d'un compte depuis le journal +25 | +55 |

## 8. LE RAPPORT DE MISSION (obligatoire, `rendu/M01/RAPPORT.md`)
1 page : architecture choisie, la règle métier la plus pénible, le bug le plus
retors, ce que vous referiez autrement. C'est votre soutenance écrite.

> *Marcel :* *« Un guichet qui plante devant un client, c'est un guichetier qui
> transpire. Josiane va taper "BANANE" comme montant. Sois prêt. »*
