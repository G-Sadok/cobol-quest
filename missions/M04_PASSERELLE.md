# MISSION 04 — LA PASSERELLE
### Phase 2 · Durée conseillée : 2 semaines · 350 XP

> *Ordre de mission — Mme KERBRAT :*
> *« Le nouveau prestataire "cloud" veut nos données en CSV et en JSON. Marcel a
> ri dix minutes, puis il a dit : "le COBOL parlera ce qu'on lui dira de parler".
> Votre mission : faire dialoguer BERTHA avec le XXIe siècle — dans les deux
> sens, et proprement. C'est LE poste des développeurs COBOL modernes :
> l'interfaçage. »*

Prérequis données : `clients.dat` de J07 (GENDATA).

## 1. PROGRAMME 1 — L'EXPORT CSV (`exportcs.cob`, `EXPORTCS`)
Produit `clients.csv` : en-tête + un client par ligne, séparateur `;`, champs
TRIMés, identifiant sans zéros de tête, solde avec point décimal et sans zéros de
tête :
```
$> ./exportcs
8 CLIENTS EXPORTES
$> cat clients.csv
ID;NOM;VILLE;SOLDE
1;DUPONT;PARIS;12345.50
2;KOSSOU;COTONOU;250000.00
3;NDIAYE;DAKAR;150.75
4;MARTIN;PARIS;0.00
5;TRAORE;ABIDJAN;1000000.00
6;JOHNSON;BRUXELLES;4500.25
7;AHOYO;COTONOU;75300.10
8;DUBOIS;PARIS;42.00
```
(Technique : éditer dans des zones `Z(...)9.99` / `Z(4)9`, puis `FUNCTION TRIM` et
un `STRING` avec les `;`. La ligne écrite ne doit contenir AUCUN espace parasite —
enregistrement de sortie en longueur variable ou TRIM final.)

## 2. PROGRAMME 2 — L'IMPORT CSV (`importcs.cob`, `IMPORTCS`)
Créez `fournisseurs.csv` :
```
CODE;NOM;DELAI
F001;PAPETERIE DU PORT;5
F002;CABLES ET FILS;12
F0X3;INTRUS;2
F004;SANS DELAI;
```
Le programme saute l'en-tête, découpe (UNSTRING), contrôle : code = `F` + 3
chiffres ; délai numérique non vide. Valides → `FOURNIS.DAT` (code `X(4)`, nom
`X(20)`, délai `9(3)` — format fixe, décimales et cadrages propres). Invalides →
`REJETS.TXT` (`REJET LIGNE 4 CODE INVALIDE`, `REJET LIGNE 5 DELAI INVALIDE`).
```
$> ./importcs
2 FOURNISSEURS IMPORTES
2 REJETS
$> echo $?
4
```
**Convention CGBA des codes retour** (désormais obligatoire partout) :
`0` = tout est propre · `4` = terminé avec rejets · `8` = erreur bloquante
(fichier absent...). En COBOL : `MOVE 4 TO RETURN-CODE`.

## 3. PROGRAMME 3 — L'EXPORT JSON (`exportjs.cob`, `EXPORTJS`)
Produit `clients.json` — un tableau d'objets, STRING obligatoire, virgules entre
les objets mais PAS après le dernier (le piège de tous les générateurs JSON du
monde) :
```
[
{"id":1,"nom":"DUPONT","ville":"PARIS","solde":12345.50},
{"id":2,"nom":"KOSSOU","ville":"COTONOU","solde":250000.00},
...
{"id":8,"nom":"DUBOIS","ville":"PARIS","solde":42.00}
]
```
`8 CLIENTS EXPORTES`. (Validez avec `python3 -m json.tool clients.json` ou un
validateur en ligne : ça fait partie du rendu — capture dans le rapport.)

## 4. PROGRAMME 4 — LE FILTRE DE PIPELINE (`seuil.cob`, `SEUIL`)
Le programme s'insère dans un tube Unix : il lit des enregistrements clients (49
caractères) sur **l'entrée standard** et réécrit sur la **sortie standard** ceux
dont le solde ≥ au seuil passé en argument :
```
$> cat clients.dat | ./seuil 10000 | wc -l
4
$> cat clients.dat | ./seuil 10000 | ./seuil 100000
00005TRAORE              ABIDJAN        100000000
```
(Secret d'Unix : l'entrée standard EST un fichier — `SELECT F-IN ASSIGN TO
"/dev/stdin"`. La sortie : DISPLAY, tout simplement. Seuil : `ACCEPT ... FROM
COMMAND-LINE` + NUMVAL. Sans argument → `USAGE : SEUIL <MONTANT>` et code retour 8.)

## 5. BARÈME (/350)
| Critère | XP |
|---|---|
| Export CSV exact (au caractère près) | 70 |
| Import CSV : découpage, contrôles, rejets, format fixe | 90 |
| Export JSON valide (validation prouvée) + dernier-sans-virgule | 70 |
| Filtre de pipeline (composable, testé en chaîne) | 60 |
| Codes retour conformes partout | 30 |
| Rapport (dont : ce que le CSV ne sait pas dire d'un fichier COBOL — décimales implicites, cadrages...) | 30 |
| **Bonus** : export CSV paramétrable (séparateur `;` ou `,` en argument) +20 · échappement JSON des guillemets dans les noms +20 | +40 |

> *Marcel :* *« Retiens ça : le mainframe ne mourra pas, il sera ENTOURÉ. Des API,
> du JSON, des tubes. Celui qui sait faire le pont entre les deux mondes ne
> cherchera jamais du travail. »*
