# RUSH 01 — BERTHA-MIND
### Week-end 1 · Synthèse J01→J05 · 120 XP (+30 bonus)

> *Note de service — Mme KERBRAT (DRH) :*
> *« Le comité d'entreprise souhaite un jeu pour le pot de départ de Marcel. Marcel
> a dit : "un Mastermind, et codé PROPRE, ou rien". Vous avez le week-end. »*

## LE JEU
BERTHA-MIND choisit un code secret de **4 chiffres entre 1 et 6** (répétitions
autorisées). Le joueur a **10 essais**. Après chaque essai, le programme annonce :
- `BIEN PLACES : n` (bon chiffre, bonne position)
- `MAL PLACES  : n` (bon chiffre, mauvaise position — chaque chiffre du secret ne
  compte qu'une fois : le décompte se fait comme au vrai Mastermind)

## SPÉCIFICATIONS (BERTHA fait foi)
```
$> ./berthamind 2416
================================
 BERTHA-MIND - CGBA 1987
 TROUVEZ LE CODE (4 CHIFFRES 1-6)
================================
ESSAI 01/10 ?
1122
BIEN PLACES : 0
MAL PLACES  : 2
ESSAI 02/10 ?
2416
BRAVO - CODE TROUVE EN 02 ESSAIS
```
- Défaite après 10 échecs :
```
PERDU - LE CODE ETAIT 2416
```
- Saisie invalide (pas 4 chiffres 1-6) : `SAISIE INVALIDE` et l'essai n'est **pas**
  décompté.
- **Mode test** : si un argument est passé sur la ligne de commande
  (`ACCEPT WS-ARG FROM COMMAND-LINE`), c'est le code secret. Sans argument : code
  aléatoire (voir Annexe A). BERTHA teste toujours avec argument.

## CONTRAINTES DE CONCEPTION (notées)
1. Norme CGBA intégrale ; paragraphes numérotés ; zéro GO TO évidemment.
2. Le secret et l'essai vivent dans des **tables OCCURS 4** (comparaison par
   boucles) — pas de comparaison de chaînes globale.
3. L'algorithme "mal placés" utilise une **table de marquage** (chiffres déjà
   consommés) : décrivez-le en commentaire avant de le coder.
4. Validation de saisie robuste : `IS NUMERIC` + bornes 1-6 chiffre par chiffre.
5. Un seul fichier : `rendu/RUSH01/berthamind.cob` · **PROGRAM-ID :** `BMIND`.

## ANNEXE A — L'ALÉATOIRE EN GNUCOBOL (fourni, car hors programme)
```cobol
           COMPUTE WS-GRAINE = FUNCTION NUMVAL(
               FUNCTION CURRENT-DATE(9:8))
           COMPUTE WS-JET = FUNCTION RANDOM(WS-GRAINE)
           PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 4
               COMPUTE WS-SECRET(WS-I) =
                   FUNCTION INTEGER(FUNCTION RANDOM * 6) + 1
           END-PERFORM
```

## BARÈME (/120)
| Critère | XP |
|---|---|
| Partie gagnante conforme (sorties exactes) | 35 |
| Partie perdante conforme | 15 |
| Comptage BIEN/MAL PLACES exact sur les cas pièges (doublons : secret 1123 / essai 1211 → BIEN 1, MAL 2) | 30 |
| Saisies invalides gérées sans décompte | 15 |
| Norme + découpage en paragraphes propres | 25 |
| **Bonus** : historique des essais affiché à la fin (+15) ; niveau de difficulté paramétrable 4-6 chiffres (+15) | +30 |

*Cas piège officiel supplémentaire : secret `2416`, essai `4444` → `BIEN PLACES : 1`,
`MAL PLACES  : 0`.*

> *Marcel, lundi matin :* *« Pas mal. Le mien tenait sur une carte perforée de moins.
> Semaine 2 : les chaînes, puis les fichiers. Là, ça devient sérieux. »*
