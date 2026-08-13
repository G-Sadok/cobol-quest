# PISCINE — J02 : LA MÉMOIRE DE BERTHA
### Variables, PIC, MOVE, arithmétique · XP du jour : 120 (+40 bonus)

> *Mémo de Marcel :*
> *« En COBOL, on ne déclare pas un "int". On décrit une zone mémoire au caractère
> près, comme on décrit un coffre : largeur, contenu, position de la virgule. C'est
> pour ça que les banques nous aiment : chez nous, un centime ne s'évapore jamais.
> Sauf si tu tronques. Aujourd'hui, tu vas tronquer. Et tu vas comprendre. »*

---

## LE MÉMO DU JOUR

### 1. La clause PIC (PICTURE) — décrire une zone
| Symbole | Sens | Exemple | Contenu type |
|---|---|---|---|
| `9` | un chiffre | `PIC 9(5)` | `00042` |
| `X` | un caractère | `PIC X(10)` | `MARCEL    ` |
| `A` | une lettre | `PIC A(3)` | `ABC` |
| `V` | virgule **implicite** (ne prend pas de place) | `PIC 9(5)V99` | `0123450` = 1234.50 |
| `S` | signe (invisible à l'affichage brut) | `PIC S9(4)` | -0042 |

```cobol
       01 WS-SOLDE       PIC S9(7)V99  VALUE 0.
       01 WS-NOM         PIC X(20)     VALUE SPACES.
       01 WS-CPT         PIC 9(3)      VALUE ZERO.
       01 CST-TAUX-TVA   PIC 9V999     VALUE 0.196.
```
`VALUE` initialise. `SPACES`, `ZEROS`, `HIGH-VALUES`, `LOW-VALUES` sont des
constantes figuratives.

### 2. MOVE — et la loi de la troncature
```cobol
           MOVE 123.456   TO WS-SOLDE     *> cadre sur la virgule
           MOVE "MARCEL"  TO WS-NOM       *> cadre a gauche, complete d espaces
           MOVE WS-A      TO WS-B WS-C    *> copies multiples
```
Règles de fer :
- **Numérique** : cadrage sur la virgule ; ce qui dépasse à gauche OU à droite est
  **coupé sans erreur ni warning**. `MOVE 12345.67 TO zone-9(3)V9` → `345.6`.
- **Alphanumérique** : cadrage à gauche, coupé à droite, complété d'espaces.
- MOVE d'un `X` vers un `9` : légal et dangereux (voir badge S0C7, J03).

### 3. L'arithmétique — cinq verbes
```cobol
           ADD WS-A TO WS-B                        *> B = B + A
           ADD WS-A WS-B GIVING WS-C               *> C = A + B (B intact)
           SUBTRACT WS-F FROM WS-SOLDE
           MULTIPLY WS-QTE BY WS-PRIX GIVING WS-TOT
           DIVIDE WS-TOT BY 12 GIVING WS-MENS REMAINDER WS-RESTE
           COMPUTE WS-NET ROUNDED = WS-BRUT * (1 - CST-CHARGES)
               ON SIZE ERROR
                   DISPLAY "DEPASSEMENT DE CAPACITE"
           END-COMPUTE
```
- `ROUNDED` : arrondi commercial (0.005 → 0.01). Sans lui : troncature.
- `ON SIZE ERROR` : le filet de sécurité quand le résultat ne tient pas.
- `COMPUTE` accepte `+ - * / **` et les parenthèses.

### 4. Les zones d'édition — maquiller les nombres pour l'affichage
Une zone d'édition est en lecture seule pour le calcul : on `MOVE` dedans, on
`DISPLAY`, c'est tout.
| PIC d'édition | 1234.5 devient | Rôle |
|---|---|---|
| `ZZZZ9` | ` 1235` | Z = zéro de tête → espace |
| `ZBZZZBZZ9.99` | `    1 234.50` | B = espace inséré |
| `+ZZZZ9.99` / `-ZZZZ9.99` | `+ 1234.50` | signe affiché |
| `ZZZZ9.99CR` | `1234.50CR` si négatif | comptable old-school |
| `*****9.99` | `**1234.50` | protection de chèque |

### 5. COMP-3 (décimal condensé) — la spécialité maison
`PIC S9(7)V99 COMP-3` stocke 2 chiffres par octet + le signe : moitié moins de place,
calculs exacts. C'est LE format des fichiers bancaires mainframe. On l'utilisera en
zone de calcul dès J07 ; aujourd'hui, sachez qu'il existe et qu'on ne l'affiche
jamais directement (il faut d'abord `MOVE` vers une zone d'édition).

---

## EXERCICE 00 — L'INVENTAIRE DU COFFRE (10 XP)
**Rendu :** `rendu/J02/ex00/coffre.cob` · **PROGRAM-ID :** `COFFRE`

Déclarez et initialisez par `VALUE` : un solde `S9(7)V99` à 1234567.89, un nom
d'agence `X(15)` à "AGENCE CENTRALE", un nombre de coffres `9(2)` à 7. Affichez :
```
$> ./coffre
AGENCE : AGENCE CENTRALE
COFFRES: 07
SOLDE  : 1234567.89
```
(Le solde s'affiche proprement : trouvez la bonne zone d'édition `9(7).99`.)

## EXERCICE 01 — LA MACHINE À TRONQUER (20 XP)
**Rendu :** `rendu/J02/ex01/tronque.cob` · **PROGRAM-ID :** `TRONQUE`

Le but : PRÉDIRE avant d'exécuter. Déclarez `WS-SRC PIC 9(5)V99 VALUE 12345.67`,
puis quatre cibles : `9(3)V99`, `9(5)`, `9(7)V9(4)` (édition `9(7).9(4)`), `X(8)`
(recevant le MOVE de la zone d'édition précédente). Faites les MOVE et affichez :
```
$> ./tronque
SOURCE      : 12345.67
VERS 9(3)V99: 345.67
VERS 9(5)   : 12345
VERS ELARGIE: 0012345.6700
VERS X(8)   : 0012345.
```
Écrivez d'abord vos prédictions en commentaires (`* PREDICTION EX01 : ...`), exécutez,
corrigez vos prédictions SANS les effacer. L'erreur documentée vaut de l'or.

## EXERCICE 02 — LA CAISSE ENREGISTREUSE (15 XP)
**Rendu :** `rendu/J02/ex02/tva.cob` · **PROGRAM-ID :** `TVA`

Lisez un montant HT (`ACCEPT`, zone `9(5)V99` — on saisit `1000.00`), calculez TVA
(18%, taux en `CST-`) et TTC, avec `ROUNDED` :
```
$> ./tva
MONTANT HT ?
1000.00
HT  :   1000.00
TVA :    180.00
TTC :   1180.00
```
Alignement : zones d'édition `ZZZZZZ9.99` (largeur 10). Aucun nombre magique.

## EXERCICE 03 — LA NOSTALGIE DE MARCEL (20 XP)
**Rendu :** `rendu/J02/ex03/francs.cob` · **PROGRAM-ID :** `FRANCS`

Marcel compte encore en francs. Taux officiel gravé dans le marbre :
1 EUR = 6.55957 FRF. Convertissez dans les deux sens :
```
$> ./francs
MONTANT EN EUROS ?
100.00
100.00 EUR = 655.96 FRF
ET POUR VERIFIER : 655.96 FRF = 100.00 EUR
```
Contrainte : `ROUNDED` obligatoire ; observez la ligne 2 → l'aller-retour retombe-t-il
toujours sur ses pieds ? Testez avec 0.15 EUR et notez l'anomalie en commentaire
`* OBSERVATIONS :`. Vous venez de rencontrer les erreurs d'arrondi cumulées — le
cauchemar n°2 du banquier.

## EXERCICE 04 — LE CHÈQUE DE LUXE (20 XP)
**Rendu :** `rendu/J02/ex04/cheque.cob` · **PROGRAM-ID :** `CHEQUE`

Éditez un montant façon chèque infalsifiable et façon relevé :
```
$> ./cheque
MONTANT ?
1234.5
CHEQUE : ***1234.50 EUR
RELEVE :     1 234.50 EUR
DEBIT  :     1 234.50-
```
(Chèque : `****9.99` sur 7 chiffres. Relevé : `ZBZZZBZZ9.99`. Débit : édition avec
signe flottant en fin `ZBZZZBZZ9.99-`, montant passé en négatif via `COMPUTE`.)

## EXERCICE 05 — LES INTÉRÊTS DE TATIE JOSIANE (20 XP)
**Rendu :** `rendu/J02/ex05/interets.cob` · **PROGRAM-ID :** `INTERETS`

Josiane place 5000.00 EUR à 3.5% par an. Affichez le capital après 1, 2 et 3 ans en
intérêts composés (`COMPUTE ... ** ...` ou multiplications successives) :
```
$> ./interets
CAPITAL INITIAL :    5000.00
APRES 1 AN      :    5175.00
APRES 2 ANS     :    5356.13
APRES 3 ANS     :    5543.59
```
`ROUNDED` à chaque étape annuelle (c'est ainsi que la banque capitalise réellement).

## EXERCICE 06 — LE BUG DE L'AN 2000 (15 XP)
**Rendu :** `rendu/J02/ex06/y2k.cob` · **PROGRAM-ID :** `Y2K`

En 1985, la CGBA stockait les années sur 2 chiffres (la mémoire coûtait cher).
Reconstituez le drame. Année de naissance sur 2 chiffres (`ACCEPT`, `9(2)`), calcul
de l'âge "à l'ancienne" avec l'année courante sur 2 chiffres :
```
$> ./y2k
ANNEE DE NAISSANCE (2 CHIFFRES) ?
62
CALCUL 1985 : VOUS AVEZ 023 ANS
CALCUL 2026 : VOUS AVEZ -36 ANS
DIAGNOSTIC  : BUG AN 2000 REPRODUIT
```
(Calcul 2026 : `26 - 62`, zone signée, édition `-Z9` → constatez le désastre.)
Badge **SURVIVANT Y2K** débloqué. En 1999, des gens ont été payés très cher pour
réparer ça ligne par ligne. Retenez la leçon : on ne rogne jamais sur une donnée.

## BONUS 1 — LA PAIE EN VRAI (+20 XP)
**Rendu :** `rendu/J02/bonus/brutnet.cob` · **PROGRAM-ID :** `BRUTNET`

Brut saisi → cotisations 22% → net, puis net annuel sur 12 mois, éditions alignées
`ZZZBZZ9.99`. Vérifiez : net mensuel * 12 = net annuel au centime près ? Sinon,
corrigez en calculant l'annuel AVANT le mensuel. Documentez.

## BONUS 2 — À LA FRANÇAISE (+20 XP)
**Rendu :** `rendu/J02/bonus/virgule.cob` · **PROGRAM-ID :** `VIRGULE`

Découvrez `SPECIAL-NAMES. DECIMAL-POINT IS COMMA.` (ENVIRONMENT DIVISION,
CONFIGURATION SECTION) : la virgule devient le séparateur décimal partout — y compris
dans vos littéraux ! Affichez `1 234 567,89` à partir de 1234567.89. Attention :
cette clause change AUSSI l'écriture de vos `VALUE`. C'est déroutant : c'est le but.

---

## BARÈME DU JOUR
| Ex | 00 | 01 | 02 | 03 | 04 | 05 | 06 | B1 | B2 |
|---|---|---|---|---|---|---|---|---|---|
| XP | 10 | 20 | 15 | 20 | 20 | 20 | 15 | 20 | 20 |

Validation : ≥ 85 XP. Badges en jeu : **SURVIVANT Y2K**, **CHASSEUR DE TRONCATURES**
(ex01 avec prédictions justes ≥ 3/4).

> *Marcel :* *« Tu sais maintenant décrire l'argent. Demain, tu apprendras à
> décider quoi en faire. Les IF, les 88... la partie du COBOL qui se lit comme une
> phrase. Presque de la poésie. Presque. »*
