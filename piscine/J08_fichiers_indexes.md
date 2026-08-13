# PISCINE — J08 : LES FICHIERS INDEXÉS
### Clés, accès direct, REWRITE/DELETE/START · XP du jour : 130 (+20 bonus)

> *Mémo de Marcel :*
> *« Hier, pour trouver le client 4 012 887, tu aurais lu 4 012 886 enregistrements.
> Le client, lui, attend au guichet. Aujourd'hui : les fichiers indexés — l'ancêtre
> direct de VSAM, le coffre à clés du mainframe. Tu donnes la clé, le fichier ouvre
> la bonne page. Et tu vas apprendre les trois verbes qui font trembler un DBA :
> REWRITE, DELETE, et surtout : INVALID KEY. »*

---

## LE MÉMO DU JOUR

### 1. Déclarer un fichier indexé
```cobol
           SELECT F-COMPTES ASSIGN TO "comptes.idx"
               ORGANIZATION IS INDEXED
               ACCESS MODE  IS DYNAMIC
               RECORD KEY   IS CPT-ID
               ALTERNATE RECORD KEY IS CPT-VILLE WITH DUPLICATES
               FILE STATUS  IS WS-FS-COMPTES.
```
- `RECORD KEY` : la clé primaire, unique, DANS l'enregistrement du FD.
- `ALTERNATE RECORD KEY ... WITH DUPLICATES` : un second index, doublons permis.
- `ACCESS MODE` : `SEQUENTIAL` (dans l'ordre des clés), `RANDOM` (à la clé),
  `DYNAMIC` (les deux — notre choix).

### 2. Les verbes de l'accès direct
```cobol
           MOVE 5 TO CPT-ID
           READ F-COMPTES
               INVALID KEY DISPLAY "COMPTE INCONNU"
           END-READ

           REWRITE ENR-COMPTE                 *> apres un READ reussi
               INVALID KEY DISPLAY "REECRITURE IMPOSSIBLE"
           END-REWRITE

           DELETE F-COMPTES                   *> supprime le dernier lu
               INVALID KEY DISPLAY "SUPPRESSION IMPOSSIBLE"
           END-DELETE

           WRITE ENR-COMPTE                   *> creation
               INVALID KEY DISPLAY "CLE DEJA PRISE"
           END-WRITE
```
Statuts : `00` OK · `22` clé en double · `23` clé absente. `INVALID KEY` est le
raccourci ; le FILE STATUS reste contrôlé (Norme, Article 8).

### 3. Le parcours partiel — START puis READ NEXT
```cobol
           MOVE 5 TO CPT-ID
           START F-COMPTES KEY IS >= CPT-ID
               INVALID KEY SET FIN-PARCOURS TO TRUE
           END-START
           PERFORM UNTIL FIN-PARCOURS
               READ F-COMPTES NEXT
                   AT END SET FIN-PARCOURS TO TRUE
                   NOT AT END PERFORM 2100-AFFICHER
               END-READ
           END-PERFORM
```

### 4. OPEN I-O — lire ET écrire dans le même fichier
Consultation seule : `OPEN INPUT`. Mise à jour : `OPEN I-O`. Création : `OPEN OUTPUT`.

### 5. La convention du jour
`comptes.idx` est un fichier **binaire** géré par GnuCOBOL : on ne le `cat` pas, on
ne l'édite pas. Il est reconstruit par votre chargeur (ex00). **Avant chaque test,
BERTHA relance votre ex00** : chaque exercice part d'une base propre. Prenez la même
habitude.

---

## EXERCICE 00 — LE CHARGEUR (20 XP)
**Rendu :** `rendu/J08/ex00/charge.cob` · **PROGRAM-ID :** `CHARGE`

Lisez `clients.dat` (J07 — regénérez-le avec votre GENDATA) et chargez
`comptes.idx` : clé primaire `CPT-ID`, clé alternative `CPT-VILLE` avec doublons.
```
$> ./charge
8 COMPTES CHARGES
```
(Relancé deux fois de suite, il doit TOUJOURS afficher 8 : ouvrez en OUTPUT pour
repartir de zéro.)

## EXERCICE 01 — LE GUICHET DE CONSULTATION (15 XP)
**Rendu :** `rendu/J08/ex01/consulte.cob` · **PROGRAM-ID :** `CONSULTE`
```
$> ./consulte
NUMERO DE COMPTE ?
00005
COMPTE : 00005
TITULAIRE : TRAORE
VILLE : ABIDJAN
SOLDE :   1000000.00
```
```
$> ./consulte
NUMERO DE COMPTE ?
99999
COMPTE INCONNU
```
(Un READ à la clé, zéro boucle. Édition du solde : `ZZZZZZZZ9.99`.)

## EXERCICE 02 — DÉPÔT / RETRAIT (20 XP)
**Rendu :** `rendu/J08/ex02/mouvmt.cob` · **PROGRAM-ID :** `MOUVMT`

Compte, code (`D`/`R`), montant. Contrôles puis REWRITE :
```
$> ./mouvmt
COMPTE ?
00008
OPERATION (D/R) ?
D
MONTANT ?
100.00
NOUVEAU SOLDE :       142.00
```
```
$> ./mouvmt
COMPTE ?
00008
OPERATION (D/R) ?
R
MONTANT ?
5000.00
PROVISION INSUFFISANTE
```
Règles : compte inconnu → `COMPTE INCONNU` ; code invalide → `OPERATION INVALIDE` ;
retrait > solde refusé SANS réécriture ; montant nul ou non numérique (saisie
`X(10)`, contrôle J03) → `MONTANT INVALIDE`. Ordre des contrôles : compte, code,
montant, provision.

## EXERCICE 03 — LA CLÔTURE (15 XP)
**Rendu :** `rendu/J08/ex03/cloture.cob` · **PROGRAM-ID :** `CLOTURE`
```
$> ./cloture
COMPTE A CLOTURER ?
00004
COMPTE 00004 CLOTURE
```
```
$> ./cloture
COMPTE A CLOTURER ?
00005
CLOTURE REFUSEE - SOLDE NON NUL
```
(DELETE seulement si le solde vaut zéro. Preuve demandée : relancez votre CONSULTE
sur 00004 après clôture → `COMPTE INCONNU`.)

## EXERCICE 04 — LE PARCOURS PARTIEL (15 XP)
**Rendu :** `rendu/J08/ex04/apartir.cob` · **PROGRAM-ID :** `APARTIR`

Affichez les comptes à partir d'un numéro donné, dans l'ordre des clés, au plus 3 :
```
$> ./apartir
A PARTIR DU COMPTE ?
00006
00006 JOHNSON              BRUXELLES
00007 AHOYO                COTONOU
00008 DUBOIS               PARIS
```
(START >= puis READ NEXT ; moins de 3 restants → on affiche ce qu'il y a ; aucun →
`AUCUN COMPTE`.)

## EXERCICE 05 — LA RECHERCHE PAR VILLE (20 XP)
**Rendu :** `rendu/J08/ex05/parville.cob` · **PROGRAM-ID :** `PARVILLE`

La clé alternative entre en scène :
```
$> ./parville
VILLE ?
PARIS
00001 DUPONT
00004 MARTIN
00008 DUBOIS
3 COMPTES A PARIS
```
(READ à la clé alternative puis READ NEXT tant que la ville lue reste la bonne.
Ville inconnue → `0 COMPTES A <VILLE>` — avec la ville TRIMée.)

## EXERCICE 06 — LE MINI-GUICHET (25 XP)
**Rendu :** `rendu/J08/ex06/guichet.cob` · **PROGRAM-ID :** `GUICHET`

Le tout-en-un, en boucle jusqu'au choix 9 :
```
$> ./guichet
--- GUICHET CGBA ---
1 CONSULTER
2 DEPOT
3 RETRAIT
9 QUITTER
CHOIX ?
2
COMPTE ?
00003
MONTANT ?
50.00
NOUVEAU SOLDE :       200.75
--- GUICHET CGBA ---
1 CONSULTER
2 DEPOT
3 RETRAIT
9 QUITTER
CHOIX ?
9
AU REVOIR
```
Contraintes : le menu est un paragraphe, chaque opération est un paragraphe, la
boucle est un `PERFORM WITH TEST AFTER UNTIL CHOIX-QUITTER` (niveau 88). Choix
inconnu → `CHOIX INVALIDE` puis le menu revient. Un seul OPEN I-O au début, un seul
CLOSE à la fin.

## BONUS — LE JOURNAL D'AUDIT (+20 XP)
**Rendu :** `rendu/J08/bonus/audit.cob` · **PROGRAM-ID :** `AUDIT`

Reprenez votre GUICHET : chaque dépôt/retrait accepté ajoute (OPEN EXTEND) une ligne
à `journal.dat` : `OPER <D/R> COMPTE <ID> MONTANT <ZZZZZZZ9.99>`. BERTHA rejoue un
scénario et vérifie le journal :
```
$> cat journal.dat
OPER D COMPTE 00003 MONTANT       50.00
OPER R COMPTE 00001 MONTANT      345.50
```
(Une banque sans journal n'est pas une banque : c'est un tiroir.)

---

## BARÈME DU JOUR
| Ex | 00 | 01 | 02 | 03 | 04 | 05 | 06 | Bonus |
|---|---|---|---|---|---|---|---|---|
| XP | 20 | 15 | 20 | 15 | 15 | 20 | 25 | 20 |

Validation : ≥ 90 XP. Badge : **GARDIEN DES CLÉS** (ex00→ex05), **GUICHETIER**
(ex06).

> *Marcel :* *« Demain : SORT, les ruptures et les sous-programmes. La journée la
> plus importante de la piscine. Le soir, tu sauras produire l'état comptable qui
> fait vivre une banque. Couche-toi tôt. »*
