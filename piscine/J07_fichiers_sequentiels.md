# PISCINE — J07 : LES FICHIERS SÉQUENTIELS
### SELECT, FD, OPEN/READ/WRITE/CLOSE, FILE STATUS · XP du jour : 120 (+20 bonus)

> *Mémo de Marcel :*
> *« Voilà. La salle des machines. Un batch, c'est trois gestes : ouvrir, traiter
> enregistrement par enregistrement, fermer. Quatre millions de fois par nuit
> depuis 1962. Aujourd'hui tu apprends les trois gestes, et surtout le quatrième :
> vérifier le FILE STATUS. Ceux qui ne vérifient pas finissent réveillés à 3h du
> matin. J'ai des exemples. J'ÉTAIS l'exemple. »*

---

## LE MÉMO DU JOUR

### 1. Déclarer un fichier — en trois endroits
```cobol
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLIENTS ASSIGN TO "clients.dat"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS  IS WS-FS-CLIENTS.
      *
       DATA DIVISION.
       FILE SECTION.
       FD  F-CLIENTS.
       01  ENR-CLIENT.
           05 CLI-ID       PIC 9(5).
           05 CLI-NOM      PIC X(20).
           05 CLI-VILLE    PIC X(15).
           05 CLI-SOLDE    PIC 9(7)V99.
      *
       WORKING-STORAGE SECTION.
       01  WS-FS-CLIENTS   PIC XX.
           88 FS-CLI-OK        VALUE "00".
           88 FS-CLI-FIN       VALUE "10".
```
- `LINE SEQUENTIAL` = fichier texte, une ligne = un enregistrement (notre monde
  GnuCOBOL). Le `SEQUENTIAL` pur (longueur fixe sans fin de ligne) est le monde
  mainframe : on en reparle en Phase 3.
- **La décimale est implicite dans le fichier** : `CLI-SOLDE PIC 9(7)V99` occupe
  9 caractères. `001234550` sur disque = 12345.50 en mémoire. C'est LE format des
  fichiers bancaires. Gravez-le.

### 2. Le cycle de vie
```cobol
           OPEN INPUT F-CLIENTS               *> ou OUTPUT / EXTEND / I-O
           IF NOT FS-CLI-OK
               DISPLAY "ERREUR ES CLIENTS STATUT " WS-FS-CLIENTS
               STOP RUN
           END-IF
           ...
           CLOSE F-CLIENTS
```
Statuts à connaître : `00` OK · `10` fin de fichier · `35` fichier introuvable ·
`22` clé en double (J08) · `23` clé absente (J08).

### 3. La boucle de lecture canonique (l'amorçage)
```cobol
       2000-TRAITEMENT.
           READ F-CLIENTS
               AT END SET FS-CLI-FIN TO TRUE
           END-READ
           PERFORM UNTIL FS-CLI-FIN
               PERFORM 2100-TRAITER-UN-CLIENT
               READ F-CLIENTS
                   AT END SET FS-CLI-FIN TO TRUE
               END-READ
           END-PERFORM.
```
Une lecture AVANT la boucle, une lecture EN FIN de boucle : ainsi le dernier
enregistrement n'est jamais traité deux fois. Ce motif a un nom dans le métier ;
retenez surtout qu'il est non négociable.

### 4. Écrire
```cobol
           OPEN OUTPUT F-SORTIE               *> ecrase ; EXTEND ajoute a la fin
           MOVE WS-CLIENT TO ENR-SORTIE
           WRITE ENR-SORTIE
```
On écrit **l'enregistrement du FD**, pas le fichier.

### 5. COMP-3 pour les cumuls (Norme, Article 6.3)
```cobol
       01  WS-TOT-SOLDES    PIC S9(9)V99 COMP-3 VALUE ZERO.
```
Les zones de fichier restent en affichage (`9(7)V99`) ; les cumuls internes passent
en COMP-3. Pour afficher : MOVE vers une zone d'édition.

---

## LES DONNÉES CANONIQUES DU JOUR
Tous les exercices utilisent `clients.dat` (8 enregistrements de 49 caractères) :
```
00001DUPONT              PARIS          001234550
00002KOSSOU              COTONOU        025000000
00003NDIAYE              DAKAR          000015075
00004MARTIN              PARIS          000000000
00005TRAORE              ABIDJAN        100000000
00006JOHNSON             BRUXELLES      000450025
00007AHOYO               COTONOU        007530010
00008DUBOIS              PARIS          000004200
```
(Oui, le client 00008 est Marcel. Solde : 42.00. Il dit que c'est exprès.)

## EXERCICE 00 — LE GÉNÉRATEUR (20 XP)
**Rendu :** `rendu/J07/ex00/gendata.cob` · **PROGRAM-ID :** `GENDATA`

Écrivez le programme qui CRÉE `clients.dat` exactement comme ci-dessus. Les 8
enregistrements vivent dans une table initialisée par l'idiome REDEFINES (J05 §4 :
8 FILLER `PIC X(49) VALUE "..."` recopiés du cadre ci-dessus), écrite par une boucle.
```
$> ./gendata
8 CLIENTS ECRITS DANS CLIENTS.DAT
$> wc -c clients.dat
400 clients.dat
```
(8 lignes × 49 + 8 fins de ligne = 400.) Ce programme resservira toute la semaine :
c'est votre bouton "remise à zéro du monde".

## EXERCICE 01 — LE LECTEUR (15 XP)
**Rendu :** `rendu/J07/ex01/lecture.cob` · **PROGRAM-ID :** `LECTURE`
```
$> ./lecture
00001 DUPONT               PARIS             12345.50
00002 KOSSOU               COTONOU          250000.00
00003 NDIAYE               DAKAR               150.75
00004 MARTIN               PARIS                 0.00
00005 TRAORE               ABIDJAN         1000000.00
00006 JOHNSON              BRUXELLES          4500.25
00007 AHOYO                COTONOU           75300.10
00008 DUBOIS               PARIS                42.00
8 CLIENTS LUS
```
(Solde édité `ZZZZZZ9.99`, boucle canonique du mémo obligatoire.)
Et si le fichier manque :
```
$> rm clients.dat ; ./lecture
ERREUR ES CLIENTS STATUT 35
```

## EXERCICE 02 — LE TRÉSORIER (15 XP)
**Rendu :** `rendu/J07/ex02/tresor.cob` · **PROGRAM-ID :** `TRESOR`
```
$> ./tresor
CLIENTS : 8
TOTAL   :   1342338.60
```
(Cumul en `S9(9)V99 COMP-3`, édition `ZZZZZZZZ9.99`.)

## EXERCICE 03 — LE FILTRE (20 XP)
**Rendu :** `rendu/J07/ex03/filtre.cob` · **PROGRAM-ID :** `FILTRE`

La ville est saisie ; les clients correspondants sont recopiés dans `extrait.dat`
(même format 49 caractères) :
```
$> ./filtre
VILLE ?
PARIS
3 CLIENTS EXTRAITS
$> cat extrait.dat
00001DUPONT              PARIS          001234550
00004MARTIN              PARIS          000000000
00008DUBOIS              PARIS          000004200
```
(BERTHA vérifie l'écran ET le fichier. Ville inconnue → `0 CLIENTS EXTRAITS` et
fichier vide.)

## EXERCICE 04 — LE REGISTRE OFFICIEL (20 XP)
**Rendu :** `rendu/J07/ex04/registre.cob` · **PROGRAM-ID :** `REGISTRE`

Le rapport que la direction imprime depuis 1962 :
```
$> ./registre
=================================================
 CGBA - REGISTRE DES CLIENTS
 EDITE LE 12/08/2026
=================================================
00001 DUPONT               PARIS             12345.50
00002 KOSSOU               COTONOU          250000.00
00003 NDIAYE               DAKAR               150.75
00004 MARTIN               PARIS                 0.00
00005 TRAORE               ABIDJAN         1000000.00
00006 JOHNSON              BRUXELLES          4500.25
00007 AHOYO                COTONOU           75300.10
00008 DUBOIS               PARIS                42.00
=================================================
 NOMBRE DE CLIENTS :   8
 SOLDE TOTAL       :   1342338.60
=================================================
```
(La date est celle du jour — BERTHA recalcule. Structure imposée : paragraphes
`3100-ENTETE`, `3200-LIGNE`, `3300-PIED`.)

## EXERCICE 05 — LA FUSION DES REGISTRES (15 XP)
**Rendu :** `rendu/J07/ex05/fusion2.cob` · **PROGRAM-ID :** `FUSION2`

Créez À LA MAIN `vip.dat` :
```
00009OKONKWO             LAGOS          050000000
00010SIMPSON             SPRINGFIELD    000099999
```
Le programme lit `clients.dat` puis `vip.dat` et écrit tout dans `tous.dat` :
```
$> ./fusion2
10 CLIENTS DANS TOUS.DAT
```
(BERTHA vérifie `tous.dat` : les 8 puis les 2, dans cet ordre.)

## EXERCICE 06 — LES COMPTES DORMANTS (15 XP)
**Rendu :** `rendu/J07/ex06/dormants.cob` · **PROGRAM-ID :** `DORMANTS`
```
$> ./dormants
COMPTE DORMANT : 00004 MARTIN
1 COMPTE DORMANT DETECTE
```
(Dormant = solde à zéro. S'il y en a zéro : `0 COMPTE DORMANT DETECTE` et rien
d'autre. Le libellé reste au singulier — BERTHA est de 1987, elle assume.)

## BONUS — LE RAPPORT CONFIDENTIEL (+20 XP)
**Rendu :** `rendu/J07/bonus/confid.cob` · **PROGRAM-ID :** `CONFID`

Copie de `clients.dat` vers `masque.dat` avec les soldes remplacés par
`*********` (9 étoiles) — pour les stagiaires de l'accueil :
```
$> ./confid
8 CLIENTS MASQUES
$> head -1 masque.dat
00001DUPONT              PARIS          *********
```
(Astuce : l'enregistrement de sortie décrit le solde en `X(9)`.)

---

## BARÈME DU JOUR
| Ex | 00 | 01 | 02 | 03 | 04 | 05 | 06 | Bonus |
|---|---|---|---|---|---|---|---|---|
| XP | 20 | 15 | 15 | 20 | 20 | 15 | 15 | 20 |

Validation : ≥ 85 XP. Badge : **MAÎTRE DES FICHIERS** (ex00→ex04 validés).

> *Marcel :* *« Tu sais lire le registre du début à la fin. Demain, tu apprendras à
> ouvrir le registre DIRECTEMENT à la bonne page. Ça s'appelle une clé. C'est là
> que la banque devient rapide. »*
