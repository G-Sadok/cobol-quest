# PHASE 3 — LE VRAI MAINFRAME
### Du GnuCOBOL au z/OS · 4 à 6 semaines · Badges PREMIER JCL & DOMPTEUR DE VSAM

> *Marcel, lettre laissée sur le bureau :*
> *« Tout ce que je t'ai appris tourne sur ta machine. Le vrai métier tourne sur
> UNE machine : un IBM Z, dans une salle climatisée, qui traite les paies et les
> virements d'un pays entier. La bonne nouvelle : IBM prête gratuitement un vrai
> z/OS aux apprentis. Vas-y. Reviens avec des badges. »*

## 1. LES TROIS RESSOURCES (toutes gratuites sauf mention)
1. **IBM Z Xplore** (`ibm.com/z/resources/zxplore`) — LA ressource. Un vrai
   environnement z/OS accessible 24/7 depuis VS Code, des parcours guidés
   (Fundamentals → Advanced), des **badges Credly** reconnus par les employeurs.
   Comptez 30 à 60 h pour les deux niveaux.
2. **Open Mainframe Project — "COBOL Programming with VS Code"**
   (`openmainframeproject.org`) — le cours COBOL de référence de la Linux
   Foundation, gratuit, avec exercices sur environnement fourni. Excellente
   révision de la piscine avec l'accent mainframe.
3. **Coursera — "IBM Mainframe Developer" (certificat professionnel)** — payant
   (audit gratuit possible), optionnel : utile si vous visez une reconversion
   affichable sur un CV rapidement.

Vérifiez les liens au moment voulu : ces programmes évoluent, mais existent sous
une forme ou une autre depuis des années — le manque de relève COBOL les fait
vivre.

## 2. CE QUI CHANGE ENTRE VOTRE MACHINE ET z/OS
| Chez vous (GnuCOBOL) | Sur z/OS (Enterprise COBOL) |
|---|---|
| `cobc -x prog.cob` puis `./prog` | Compilation ET exécution soumises par **JCL** |
| Fichiers `clients.dat` dans un dossier | **Datasets** : `CGBA.PROD.CLIENTS` (nommage par qualificateurs, catalogués) |
| `LINE SEQUENTIAL` (lignes de texte) | `SEQUENTIAL` longueur fixe (RECFM=FB, LRECL=49) — pas de fin de ligne ! |
| Fichier indexé GnuCOBOL | **VSAM KSDS** (défini par IDCAMS, votre J08 s'y transpose presque tel quel) |
| `SORT` du langage | Souvent l'utilitaire **DFSORT/SYNCSORT** appelé par JCL |
| Terminal, `DISPLAY` | Batch + **SYSOUT**, consulté dans **SDSF** |
| Codes retour 0/4/8 | Exactement pareil (vous avez déjà la culture !) — `COND CODE` |
| Encodage ASCII | **EBCDIC** (l'ordre de tri des lettres/chiffres change !) |
| Vos plantages | **Abends** : `S0C7` (donnée non numérique — vieil ami), `S0C4` (mémoire), `SB37` (dataset plein) |

## 3. LE JCL EN DIX LIGNES (pour ne pas être surpris)
```jcl
//PAIEJOB  JOB (CGBA),'MARCEL',CLASS=A,MSGCLASS=X
//STEP01   EXEC PGM=PAYCALC
//EMPLOYES DD DSN=CGBA.PROD.EMPLOYES,DISP=SHR
//PAIE     DD DSN=CGBA.PROD.PAIE,DISP=(NEW,CATLG),
//            SPACE=(TRK,(5,2)),LRECL=45,RECFM=FB
//SYSOUT   DD SYSOUT=*
```
Traduction : « lance le programme PAYCALC ; son fichier logique EMPLOYES est le
dataset existant CGBA.PROD.EMPLOYES ; crée PAIE ; la sortie écran part en spool. »
Le JCL est à z/OS ce que `run_chaine.sh` était à M06 — vous l'avez déjà écrit sans
le savoir. C'était exprès.

## 4. PLAN DE CAMPAGNE CONSEILLÉ (4 semaines)
- **S1** : Z Xplore Fundamentals — connexion VS Code/Zowe, TSO, datasets, premier
  JCL. Objectif : badge Fundamentals. *(→ badge maison PREMIER JCL)*
- **S2** : porter trois programmes de la piscine (J07 ex01, J09 ex06, RUSH02) en
  datasets FB : mêmes sources à 95%, tout l'environnement change. C'est LA leçon.
- **S3** : VSAM — recréer J08 en KSDS via IDCAMS ; DFSORT sur vos fichiers de M06.
  *(→ badge DOMPTEUR DE VSAM)*
- **S4** : Z Xplore Advanced + survol Db2 (le SQL embarqué : `EXEC SQL ... END-EXEC`)
  et CICS (le transactionnel — le "GUICHET-3000 de la vraie vie").

## 5. LE MARCHÉ (parlons franchement)
- Qui recrute : banques, assurances, caisses de retraite, administrations,
  et surtout les **ESN** qui les servent — en France, Belgique, Luxembourg,
  Afrique de l'Ouest francophone (secteur bancaire UEMOA très actif), Canada.
- Les profils juniors COBOL sont RARES et les seniors partent (Marcel n'est pas
  une fiction statistique). Un junior autonome sur batch + VSAM + JCL, avec un
  portfolio comme votre M06 sur GitHub et deux badges Z Xplore, est un profil
  crédible en 6 à 12 mois de travail sérieux.
- Arguments d'entretien que VOUS avez déjà : « j'ai écrit une chaîne batch
  complète avec balance comptable à double contrôle », « j'ai débogué et
  réécrit un programme legacy avec golden master », « je connais la valeur d'un
  FILE STATUS contrôlé ». Ce sont des phrases de senior.
- Complétez avec : bases SQL (Db2), notions JCL solides, et l'anglais technique
  de lecture (les manuels IBM).

## 6. POUR ALLER PLUS LOIN
GnuCOBOL restera votre labo personnel à vie. Gardez le réflexe BERTHA : tout
changement se prouve par un test. Le jour de votre premier incident de production
réel, vous penserez à Marcel. C'est normal. Tout le monde y pense.

> *Dernière ligne du carnet de Marcel :*
> *« La machine a 60 ans. Elle en vivra 60 autres. Prends-en soin. — M.D. »*
