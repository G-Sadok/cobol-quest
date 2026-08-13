# PISCINE — J10 : L'EXAMEN DE BERTHA
### Épreuve finale · 4 heures · 200 XP · Seuil de réussite : 120 XP

> *Convocation officielle — Direction des Systèmes d'Information*
> *« Épreuve pratique de qualification COBOL. Documents autorisés : vos Mémos de
> Marcel, la Norme CGBA, vos propres rendus. Interdits : toute aide extérieure,
> tout code copié d'internet. BERTHA validera. Marcel observera. La cafetière
> fonctionne. Bonne chance. »*

**Règles :** 4 heures chrono (chronométrez-vous vraiment : la contrainte fait
partie de l'épreuve). Rendus dans `rendu/J10/`. La Norme s'applique intégralement.
En cas de blocage sur une partie, passez à la suivante — les parties sont
indépendantes.

---

## PARTIE A — L'ÉCHAUFFEMENT (45 XP, ~45 min)

### A1 — LE TAMPON (15 XP)
**Rendu :** `rendu/J10/a1/tampon.cob` · **PROGRAM-ID :** `TAMPON`

Un montant signé est saisi (zone `S9(7)V99`, saisies test : `1234.56`, `-987.65`,
`0`). Affichez-le sous trois formes :
```
$> ./tampon
MONTANT ?
-987.65
COMPTABLE :      987.65-
PROTEGE   : *****987.65
SIGNE     :     -987.65
```
(Éditions : `ZZZZZZ9.99-`, `********9.99` sur 8 positions protégées + `9.99`... non :
`*(7)9.99` exactement — 8 chiffres protégés ; `-ZZZZZZ9.99`. Pour `0` : la ligne
COMPTABLE affiche `        0.00` sans signe.)

### A2 — L'AIGUILLEUR (15 XP)
**Rendu :** `rendu/J10/a2/aiguille.cob` · **PROGRAM-ID :** `AIGUILLE`

Un code mouvement est saisi. EVALUATE unique, aucun IF :
`VIR` → `VIREMENT` · `PRL` → `PRELEVEMENT` · `CHQ` → `CHEQUE` · `ESP` → `ESPECES` ·
`FRA` → `FRAIS BANCAIRES` · autre → `CODE INCONNU : <code>`.
```
$> ./aiguille
CODE ?
PRL
PRELEVEMENT
```

### A3 — L'AMORTISSEUR (15 XP)
**Rendu :** `rendu/J10/a3/amortir.cob` · **PROGRAM-ID :** `AMORTIR`

Un capital et une mensualité sont saisis. Affichez l'échéancier jusqu'à
extinction (la dernière mensualité est partielle si besoin), puis le nombre de
mois :
```
$> ./amortir
CAPITAL ?
1000.00
MENSUALITE ?
300.00
MOIS 01 : PAYE     300.00 RESTE     700.00
MOIS 02 : PAYE     300.00 RESTE     400.00
MOIS 03 : PAYE     300.00 RESTE     100.00
MOIS 04 : PAYE     100.00 RESTE       0.00
DUREE : 04 MOIS
```
(Mensualité nulle → `MENSUALITE INVALIDE` et rien d'autre.)

---

## PARTIE B — LE FICHIER (55 XP, ~1h15)

Créez `MOUVEMENTS.DAT` — compte `9(5)`, sens `X` (`D`/`C`), montant `9(7)V99`
(15 caractères par ligne) :
```
00001D000050000
00001C000125075
00002D000600000
00003C000000050
00001D000010000
00003D000020000
00002C000100000
```

### B1 — LE VÉRIFICATEUR (25 XP)
**Rendu :** `rendu/J10/b1/verif.cob` · **PROGRAM-ID :** `VERIF`

Lisez le fichier, contrôlez chaque ligne (sens valide, montant numérique et non
nul). Éditez le bilan :
```
$> ./verif
LIGNES LUES     : 7
LIGNES VALIDES  : 7
TOTAL DEBITS    :    6800.00
TOTAL CREDITS   :    2251.25
DESEQUILIBRE    :    4548.75
```
(Le déséquilibre = |débits − crédits|. BERTHA teste aussi un fichier contenant
`00009X000010000` et `00009D00001000A` : chacune produit, au fil de l'eau, une
ligne `LIGNE REJETEE : <la ligne>` et les compteurs suivent.)

### B2 — L'ÉCLATEUR (30 XP)
**Rendu :** `rendu/J10/b2/eclate.cob` · **PROGRAM-ID :** `ECLATE`

Éclatez les mouvements valides en deux fichiers `DEBITS.DAT` et `CREDITS.DAT`
(format inchangé), et affichez :
```
$> ./eclate
DEBITS  : 4
CREDITS : 3
```

---

## PARTIE C — LE RELEVÉ (100 XP, ~2h)
**Rendu :** `rendu/J10/c/` — `releve.cob` (PROGRAM-ID `RELEVE`) + vos copybooks.

La mission de synthèse. Créez `COMPTES.DAT` — compte `9(5)`, titulaire `X(20)`,
solde initial `9(7)V99` (34 caractères) :
```
00001DUPONT              001000000
00002KOSSOU              000500000
00003NDIAYE              000020050
```

Le programme produit le relevé mensuel de la banque, sur écran, à partir de
`COMPTES.DAT` et `MOUVEMENTS.DAT` (partie B — l'original, sans lignes invalides) :

1. **SORT** des mouvements par compte (le fichier n'est pas trié : regardez-le).
2. **Rupture** par compte : pour chaque compte, l'en-tête, le solde initial, les
   mouvements APPLIQUÉS dans l'ordre (crédit = +, débit = −), le solde final.
3. Si le solde passe en négatif à un moment quelconque : ligne `ALERTE DECOUVERT`
   juste après le mouvement fautif.
4. Pied : totaux généraux et contrôle comptable.

Sortie EXACTE attendue :
```
$> ./releve
===============================================
 RELEVE COMPTE 00001 - DUPONT
 SOLDE INITIAL  :     10000.00
 DEBIT          :       500.00 SOLDE :      9500.00
 CREDIT         :      1250.75 SOLDE :     10750.75
 DEBIT          :       100.00 SOLDE :     10650.75
 SOLDE FINAL    :     10650.75
===============================================
 RELEVE COMPTE 00002 - KOSSOU
 SOLDE INITIAL  :      5000.00
 DEBIT          :      6000.00 SOLDE :     -1000.00
 ALERTE DECOUVERT
 CREDIT         :      1000.00 SOLDE :         0.00
 SOLDE FINAL    :         0.00
===============================================
 RELEVE COMPTE 00003 - NDIAYE
 SOLDE INITIAL  :       200.50
 CREDIT         :         0.50 SOLDE :       201.00
 DEBIT          :       200.00 SOLDE :         1.00
 SOLDE FINAL    :         1.00
===============================================
 COMPTES TRAITES:  3
 TOTAL DEBITS   :      6800.00
 TOTAL CREDITS  :      2251.25
 SOLDES FINAUX  :     10651.75
 CONTROLE       : OK
===============================================
```
Le CONTROLE vérifie : somme des soldes initiaux − débits + crédits = somme des
soldes finaux. S'il affiche KO, votre note en Partie C est plafonnée à 40.
Éditions : montants `-ZZZZZZ9.99` (le signe ne s'affiche que s'il sert). Les
mouvements d'un compte s'appliquent dans l'ordre du fichier d'origine (le SORT ne
doit pas casser cet ordre pour un même compte — c'est un tri STABLE qu'il vous
faut : ajoutez un numéro de séquence en INPUT PROCEDURE si nécessaire ; GnuCOBOL
`SORT` avec `DUPLICATES IN ORDER` est aussi accepté).

## BARÈME DE L'EXAMEN
| Partie | A1 | A2 | A3 | B1 | B2 | C |
|---|---|---|---|---|---|---|
| XP | 15 | 15 | 15 | 25 | 30 | 100 |

- **≥ 120 XP : PISCINE VALIDÉE.** Habilitation *Programmeur junior*, badge
  **DIPLÔMÉ DE LA PISCINE**.
- < 120 : on respire, on relit, on repasse dans une semaine. C'est prévu par le
  système. Le droit à l'échec n'est pas un slogan.

> *Marcel, en rendant sa correction :*
> *« La partie C, c'est mon métier depuis 1984. Si BERTHA t'a dit OK, alors moi
> aussi. Lundi prochain, tu commences les vraies missions. Bienvenue à la DSI. »*
