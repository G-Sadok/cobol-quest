# LA NORME CGBA
### Référentiel de codage COBOL de la Compagnie Générale de Banque de l'Atlantique
### Édition révisée par M. Dubois — "Un code non normé est un code mort."

> *« Cette norme n'est pas là pour t'embêter. Elle est là parce qu'en 2043, quelqu'un
> devra relire ton code à 3h du matin pendant un incident de production. Sois gentil
> avec cette personne. C'était moi, pendant 40 ans. »* — Marcel

Toute violation de la Norme est signalée par BERTHA. En piscine : -50% sur
l'exercice. En mission : 0. Il n'y a pas de négociation. Il n'y en a jamais eu.

---

## ARTICLE 1 — LE FORMAT FIXE (les colonnes sacrées)

Le code est écrit en **format fixe**, comme sur les cartes perforées de 1962 :

| Colonnes | Zone | Usage |
|---|---|---|
| 1-6 | Séquence | Laissées **vides** (héritage des cartes perforées) |
| 7 | Indicateur | `*` = ligne de commentaire, `-` = continuation de littéral |
| 8-11 | **Zone A** | DIVISION, SECTION, noms de paragraphes, `FD`, niveaux `01` et `77` |
| 12-72 | **Zone B** | Tout le reste : instructions, niveaux 05/10/88... |
| 73-80 | Interdite | **Rien après la colonne 72.** BERTHA tronque sans pitié |

Réglez votre éditeur : une règle verticale à la colonne 72 vous sauvera la vie.

## ARTICLE 2 — L'EN-TÊTE OBLIGATOIRE

Tout fichier `.cob` commence par le cartouche CGBA :

```cobol
      * ============================================================
      * CGBA - <PHASE> - <EXERCICE OU MISSION>
      * PROGRAMME : <PROGRAM-ID>
      * AUTEUR    : <VOTRE NOM>
      * OBJET     : <UNE LIGNE DE DESCRIPTION>
      * ============================================================
```

## ARTICLE 3 — LE NOMMAGE

1. **PROGRAM-ID** : 8 caractères maximum, MAJUSCULES (héritage z/OS). Ex : `RELEVE01`.
2. **Variables de WORKING-STORAGE** : préfixe `WS-`. Ex : `WS-SOLDE`, `WS-CPT-CLIENTS`.
3. **Enregistrements de fichier** : préfixe par fichier. Ex : `CLI-NOM`, `MVT-MONTANT`.
4. **Zones de la LINKAGE SECTION** : préfixe `LK-`.
5. **Niveaux 88** : nom qui se lit comme une phrase. Ex : `88 FIN-FICHIER`,
   `88 CPT-BLOQUE`.
6. **Constantes** : préfixe `CST-`, déclarées avec `VALUE`, jamais de nombre magique
   dans la PROCEDURE DIVISION. `COMPUTE WS-X = WS-Y * 0.196` est une faute ;
   `CST-TAUX-TVA` est la voie.
7. Les noms sont **en français, explicites, sans abréviation cryptique**. `WS-T1`
   vous coûtera une remarque de Marcel. `WS-TOTAL-AGENCE` vous coûtera zéro remarque.

## ARTICLE 4 — LES PARAGRAPHES NUMÉROTÉS

La PROCEDURE DIVISION est découpée en paragraphes numérotés par tranches :

```
0000-PRINCIPAL.        le chef d'orchestre : uniquement des PERFORM
1000-INITIALISATION.
2000-TRAITEMENT.       (2100-, 2200-... pour les sous-traitements)
3000-EDITION.
9000-FIN.
```

- `0000-PRINCIPAL` ne contient **que** des `PERFORM` et le `STOP RUN` (ou `GOBACK`).
- Un paragraphe = une responsabilité. Plus de ~25 lignes ? Découpez.
- L'ordre physique des paragraphes suit l'ordre de numérotation.

## ARTICLE 5 — L'ÉCRITURE DES INSTRUCTIONS

1. **Un verbe par ligne.** Jamais deux instructions sur la même ligne.
2. **Tout bloc est fermé explicitement** : `END-IF`, `END-PERFORM`, `END-READ`,
   `END-EVALUATE`, `END-STRING`, `END-CALL`... Le point final `.` ne sert de
   fermeture qu'en fin de paragraphe.
3. **Indentation : 4 espaces** par niveau à l'intérieur de la Zone B. Pas de
   tabulations, jamais.
4. Une seule instruction par `IF` avant de penser à imbriquer. Trois niveaux
   d'imbrication maximum ; au-delà, `EVALUATE` ou un paragraphe dédié.
5. `MOVE` groupés et alignés quand ils se suivent (lisibilité de colonne).

## ARTICLE 6 — LES DONNÉES

1. Tout `PIC` numérique porteur de calcul est **signé** (`S`) sauf raison documentée.
2. Les montants sont en `PIC S9(n)V99` — **jamais** en virgule flottante
   (`COMP-1`/`COMP-2` sont interdits pour l'argent ; les banquiers n'aiment pas les
   centimes qui s'évaporent).
3. Les compteurs et montants internes intensivement calculés sont en `COMP-3`
   (décimal condensé) à partir de J07.
4. Tout `REDEFINES` est commenté : on explique CE QU'ON réinterprète et POURQUOI.
5. `FILLER` pour toute zone morte ou de mise en page.

## ARTICLE 7 — LE GO TO

**N'y pense même pas.**

(Annexe historique : `GO TO` et `ALTER` ont causé plus d'incidents de production à la
CGBA entre 1974 et 1991 que toutes les pannes électriques réunies. La seule exception
tolérée dans l'industrie — `GO TO` de sortie vers un paragraphe `-FIN` dans du code
hérité — sera étudiée en mission M05, en milieu confiné, avec des gants.)

Sont également interdits : `ALTER`, `PERFORM ... THRU`, `NEXT SENTENCE`.

## ARTICLE 8 — LES FICHIERS

1. Tout `SELECT` déclare un `FILE STATUS`.
2. Tout `OPEN`, `READ`, `WRITE`, `REWRITE`, `DELETE`, `START` est suivi d'un contrôle
   du statut (directement ou via un paragraphe `9100-CONTROLE-ES`).
3. Statut ≠ "00"/"10" attendu → message d'erreur normalisé sur `SYSERR` :
   `ERREUR ES <FICHIER> STATUT <XX>` puis arrêt propre.
4. Tout fichier ouvert est fermé. Même quand ça plante. Surtout quand ça plante.

## ARTICLE 9 — LES SORTIES

1. BERTHA parle **MAJUSCULES, SANS ACCENTS** (elle est née en EBCDIC). Toutes les
   sorties des exercices respectent ça — les exemples des sujets font foi.
2. Aucun affichage de debug dans un rendu (`DISPLAY "ICI"` : on l'a tous fait, on
   l'enlève).

## ARTICLE 10 — LE BON SENS

La Norme ne couvre pas tout. En cas de doute, appliquer la Question de Marcel :
*« Est-ce que la personne d'astreinte en 2043 me remerciera ? »*

---

### ANNEXE — Squelette conforme minimal

```cobol
      * ============================================================
      * CGBA - PISCINE J01 - EX00
      * PROGRAMME : BONJOUR
      * AUTEUR    : A. PPRENTI
      * OBJET     : PREMIER PROGRAMME CONFORME A LA NORME
      * ============================================================
       IDENTIFICATION DIVISION.
       PROGRAM-ID. BONJOUR.
      *
       ENVIRONMENT DIVISION.
      *
       DATA DIVISION.
       WORKING-STORAGE SECTION.
      *
       PROCEDURE DIVISION.
       0000-PRINCIPAL.
           PERFORM 2000-TRAITEMENT
           STOP RUN.
      *
       2000-TRAITEMENT.
           DISPLAY "BONJOUR CGBA".
```
